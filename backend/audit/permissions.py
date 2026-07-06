from rest_framework.permissions import BasePermission

from core.constants import RoleChoices


class CanViewGlobalAuditLog(BasePermission):
    """
    The global, cross-resource activity feed is admin + engineer only, to
    avoid over-exposing org-wide activity to field staff. Per-object audit
    history (e.g. /equipment/{id}/audit-log/) is a separate, more open
    permission — see equipment.views.
    """

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.role in {RoleChoices.ADMIN, RoleChoices.ENGINEER}
        )
