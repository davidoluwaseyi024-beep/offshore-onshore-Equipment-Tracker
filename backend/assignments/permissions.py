from rest_framework.permissions import SAFE_METHODS, BasePermission

from core.constants import RoleChoices


class AssignmentPermission(BasePermission):
    """
    Read: all roles (technicians see only their own — enforced via queryset
    scoping in the view, not here). Create/return: admin + engineer, since
    assignment is a supervisory action.
    """

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if request.method in SAFE_METHODS or view.action == "list" or view.action == "retrieve":
            return True
        return user.role in {RoleChoices.ADMIN, RoleChoices.ENGINEER}
