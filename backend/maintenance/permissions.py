from rest_framework.permissions import SAFE_METHODS, BasePermission

from core.constants import RoleChoices


class MaintenancePermission(BasePermission):
    """Read/create/update/complete: all roles (technicians log their own field work). Delete: admin + engineer."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if request.method in SAFE_METHODS or view.action in {"create", "update", "partial_update", "complete"}:
            return True
        if view.action == "destroy":
            return user.role in {RoleChoices.ADMIN, RoleChoices.ENGINEER}
        return True
