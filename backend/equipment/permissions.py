from rest_framework.permissions import SAFE_METHODS, BasePermission

from core.constants import RoleChoices


class EquipmentPermission(BasePermission):
    """
    Read: all roles. Create/update: admin + engineer. Delete/restore:
    admin only. Status change (including marking equipment missing) is
    handled by a separate, more permissive check on the custom action
    itself (see StatusChangePermission) since technicians must be able
    to report status changes in the field.
    """

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        if view.action == "destroy" or view.action == "restore":
            return user.role == RoleChoices.ADMIN
        return user.role in {RoleChoices.ADMIN, RoleChoices.ENGINEER}


class StatusChangePermission(BasePermission):
    """All three roles may change equipment status — technicians report field conditions."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class EquipmentAuditLogPermission(BasePermission):
    """
    All roles may view the audit history for a specific piece of equipment
    they can already read — tracing who last touched a (possibly missing)
    item shouldn't be role-gated. Only the *global* activity feed
    (audit.views.AuditLogViewSet) is restricted to admin+engineer.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
