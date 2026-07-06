import pytest

from conftest import UserFactory
from core.constants import RoleChoices

pytestmark = pytest.mark.django_db


class TestRoleGroupSync:
    def test_creating_admin_user_adds_admin_group(self):
        user = UserFactory(role=RoleChoices.ADMIN)
        assert {g.name for g in user.groups.all()} == {"Admin"}

    def test_changing_role_moves_user_between_groups(self):
        user = UserFactory(role=RoleChoices.TECHNICIAN)
        assert {g.name for g in user.groups.all()} == {"Technician"}

        user.role = RoleChoices.ENGINEER
        user.save()

        assert {g.name for g in user.groups.all()} == {"Engineer"}
