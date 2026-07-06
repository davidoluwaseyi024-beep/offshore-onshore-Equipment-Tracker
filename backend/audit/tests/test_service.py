import pytest

from audit.models import ActionChoices, AuditLog
from audit.services import AuditService, compute_diff
from conftest import EquipmentFactory

pytestmark = pytest.mark.django_db


class TestComputeDiff:
    def test_only_changed_fields_appear_in_diff(self):
        old = {"name": "Drill A", "status": "active", "cost": 100}
        new = {"name": "Drill A", "status": "in_repair", "cost": 100}

        diff = compute_diff(old, new, ["name", "status", "cost"])

        assert diff == {"status": {"old": "active", "new": "in_repair"}}

    def test_empty_diff_when_nothing_changed(self):
        old = {"name": "Drill A"}
        new = {"name": "Drill A"}
        assert compute_diff(old, new, ["name"]) == {}


class TestAuditServiceLog:
    def test_log_creates_entry_linked_to_target_via_generic_relation(self, admin_user):
        equipment = EquipmentFactory()

        entry = AuditService.log(
            actor=admin_user,
            action=ActionChoices.UPDATE,
            target=equipment,
            changes={"status": {"old": "active", "new": "in_repair"}},
        )

        assert AuditLog.objects.filter(pk=entry.pk).exists()
        assert entry.target == equipment
        assert entry.object_repr == str(equipment)

    def test_log_survives_target_becoming_unavailable_via_object_repr_snapshot(self, admin_user):
        equipment = EquipmentFactory(name="Old Name")
        entry = AuditService.log(actor=admin_user, action=ActionChoices.CREATE, target=equipment)

        equipment.name = "New Name"
        equipment.save()

        entry.refresh_from_db()
        assert entry.object_repr != equipment.__str__()  # snapshot frozen at log time, not live
