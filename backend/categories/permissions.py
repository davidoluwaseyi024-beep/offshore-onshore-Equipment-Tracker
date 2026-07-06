from core.constants import RoleChoices
from core.permissions import RoleAllowListPermission


class CategoryPermission(RoleAllowListPermission):
    write_roles = {RoleChoices.ADMIN, RoleChoices.ENGINEER}
