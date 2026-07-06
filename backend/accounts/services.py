import logging

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMessage
from django.db import transaction
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework.exceptions import ValidationError

from accounts.models import User
from audit.models import ActionChoices
from audit.services import AuditService, compute_diff
from core.constants import RoleChoices

logger = logging.getLogger(__name__)

TRACKED_FIELDS = ["email", "username", "first_name", "last_name", "role", "phone_number", "is_active"]


def _snapshot(user: User) -> dict:
    return {field: getattr(user, field) for field in TRACKED_FIELDS}


@transaction.atomic
def create_user(*, serializer, actor, request=None) -> User:
    user = serializer.save()

    ip_address, user_agent = AuditService.request_meta(request)
    AuditService.log(
        actor=actor,
        action=ActionChoices.CREATE,
        target=user,
        changes=compute_diff({}, _snapshot(user), TRACKED_FIELDS),
        ip_address=ip_address,
        user_agent=user_agent,
    )
    return user


@transaction.atomic
def update_user(*, serializer, actor, request=None) -> User:
    before = _snapshot(serializer.instance)
    user = serializer.save()

    ip_address, user_agent = AuditService.request_meta(request)
    diff = compute_diff(before, _snapshot(user), TRACKED_FIELDS)
    if diff:
        AuditService.log(
            actor=actor,
            action=ActionChoices.UPDATE,
            target=user,
            changes=diff,
            ip_address=ip_address,
            user_agent=user_agent,
        )
    return user


@transaction.atomic
def register_user(*, serializer, request=None) -> User:
    """
    Public self-registration. Always creates a `technician`-role account
    regardless of anything the client sends — `serializer` (RegisterSerializer)
    has no `role` field at all, and we set it explicitly here as a second
    line of defense against privilege escalation via a crafted request body.
    """
    user = serializer.save(role=RoleChoices.TECHNICIAN)

    ip_address, user_agent = AuditService.request_meta(request)
    AuditService.log(
        actor=user,
        action=ActionChoices.REGISTER,
        target=user,
        changes=compute_diff({}, _snapshot(user), TRACKED_FIELDS),
        ip_address=ip_address,
        user_agent=user_agent,
    )
    return user


def request_password_reset(*, email: str, request=None) -> None:
    """
    Always succeeds from the caller's perspective, whether or not the email
    matches an account — this is deliberate: responding differently for
    known vs. unknown emails lets an attacker enumerate registered accounts.
    """
    user = User.objects.filter(email__iexact=email, is_active=True).first()
    if not user:
        return

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

    body = render_to_string(
        "accounts/password_reset_email.txt",
        {"user": user, "reset_link": reset_link},
    )
    try:
        EmailMessage(
            subject="Reset your Equipment Tracker password",
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        ).send(fail_silently=False)
    except Exception:
        # Never let an email-delivery failure leak account existence to the
        # caller (see docstring) — log it server-side instead.
        logger.exception("Failed to send password reset email to user %s", user.pk)


@transaction.atomic
def confirm_password_reset(*, uid: str, token: str, new_password: str, request=None) -> User:
    try:
        pk = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=pk, is_active=True)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist) as exc:
        raise ValidationError({"uid": ["This reset link is invalid."]}) from exc

    if not default_token_generator.check_token(user, token):
        raise ValidationError({"token": ["This reset link is invalid or has expired."]})

    user.set_password(new_password)
    user.save(update_fields=["password"])

    ip_address, user_agent = AuditService.request_meta(request)
    AuditService.log(
        actor=user,
        action=ActionChoices.PASSWORD_RESET,
        target=user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    return user


@transaction.atomic
def deactivate_user(*, user: User, actor, request=None) -> User:
    before = _snapshot(user)
    user.is_active = False
    user.save(update_fields=["is_active"])

    ip_address, user_agent = AuditService.request_meta(request)
    AuditService.log(
        actor=actor,
        action=ActionChoices.UPDATE,
        target=user,
        changes=compute_diff(before, _snapshot(user), TRACKED_FIELDS),
        ip_address=ip_address,
        user_agent=user_agent,
    )
    return user
