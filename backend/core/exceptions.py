import logging

from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from django.http import Http404
from rest_framework import exceptions as drf_exceptions
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)


class ConflictError(drf_exceptions.APIException):
    """Raised when a request conflicts with current state (e.g. equipment already assigned)."""

    status_code = 409
    default_detail = "The request conflicts with the current state of the resource."
    default_code = "conflict"


_CODE_BY_EXCEPTION = {
    ConflictError: "conflict",
    drf_exceptions.ValidationError: "validation_error",
    drf_exceptions.AuthenticationFailed: "authentication_failed",
    drf_exceptions.NotAuthenticated: "authentication_failed",
    drf_exceptions.PermissionDenied: "permission_denied",
    DjangoPermissionDenied: "permission_denied",
    drf_exceptions.NotFound: "not_found",
    Http404: "not_found",
    drf_exceptions.MethodNotAllowed: "method_not_allowed",
    drf_exceptions.Throttled: "throttled",
}


def _error_code_for(exc):
    for exc_type, code in _CODE_BY_EXCEPTION.items():
        if isinstance(exc, exc_type):
            return code
    return "error"


def custom_exception_handler(exc, context):
    """
    Normalizes every DRF-raised error into one envelope shape:

        {"error": {"code": ..., "message": ..., "details": ...}}

    HTTP status codes remain semantically correct alongside this body.
    """
    response = drf_exception_handler(exc, context)

    if response is None:
        logger.exception("Unhandled exception in %s", context.get("view"))
        return Response(
            {
                "error": {
                    "code": "server_error",
                    "message": "An unexpected error occurred.",
                    "details": {},
                }
            },
            status=500,
        )

    code = _error_code_for(exc)
    details = response.data if isinstance(response.data, (dict, list)) else {"detail": response.data}
    message = (
        details.get("detail")
        if isinstance(details, dict) and isinstance(details.get("detail"), str)
        else "Unable to complete request due to validation errors."
        if code == "validation_error"
        else "Request failed."
    )

    response.data = {
        "error": {
            "code": code,
            "message": message,
            "details": details,
        }
    }
    return response
