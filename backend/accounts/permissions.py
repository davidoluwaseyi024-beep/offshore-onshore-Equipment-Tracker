from rest_framework.permissions import SAFE_METHODS, BasePermission

from core.constants import RoleChoices


class UserManagementPermission(BasePermission):
    """Users — read: admin + engineer. Write (create/update/delete): admin only."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return user.role in {RoleChoices.ADMIN, RoleChoices.ENGINEER}
        return user.role == RoleChoices.ADMIN
