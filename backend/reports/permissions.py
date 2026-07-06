from rest_framework.permissions import BasePermission

from core.constants import RoleChoices


class ReportPermission(BasePermission):
    """Reports and their schedules are admin + engineer only."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.role in {RoleChoices.ADMIN, RoleChoices.ENGINEER}
        )
