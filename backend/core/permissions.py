from rest_framework.permissions import SAFE_METHODS, BasePermission

from core.constants import RoleChoices


class RoleAllowListPermission(BasePermission):
    """
    Base class for role-gated permissions. Subclasses declare which roles
    may perform safe (read) vs. unsafe (write) requests. This keeps the
    admin/engineer/technician permission matrix directly traceable to one
    class per resource group, instead of scattered `if` statements in views.
    """

    read_roles: set[str] = {RoleChoices.ADMIN, RoleChoices.ENGINEER, RoleChoices.TECHNICIAN}
    write_roles: set[str] = {RoleChoices.ADMIN}

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return user.role in self.read_roles
        return user.role in self.write_roles


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == RoleChoices.ADMIN)


class IsAdminOrEngineer(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.role in {RoleChoices.ADMIN, RoleChoices.ENGINEER}
        )


class IsAuthenticatedRole(BasePermission):
    """Any authenticated user regardless of role (e.g. read-only shared resources)."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
