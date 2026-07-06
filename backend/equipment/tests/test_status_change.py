import pytest
from django.contrib.contenttypes.models import ContentType
from django.urls import reverse

from audit.models import AuditLog
from conftest import EquipmentFactory

pytestmark = pytest.mark.django_db


class TestStatusChangeAccountability:
    def test_status_change_writes_audit_log_with_actor_and_note(self, technician_client, technician_user):
        equipment = EquipmentFactory(status="active")

        response = technician_client.post(
            reverse("equipment-status", args=[equipment.id]),
            {"status": "missing", "note": "Not found during shift audit"},
        )
        assert response.status_code == 200

        content_type = ContentType.objects.get_for_model(equipment.__class__)
        log = AuditLog.objects.filter(content_type=content_type, object_id=str(equipment.pk)).latest("created_at")

        assert log.action == "status_change"
        assert log.actor == technician_user
        assert log.changes["status"] == {"old": "active", "new": "missing"}
        assert log.changes["note"] == "Not found during shift audit"

    def test_status_change_updates_denormalized_last_action_fields(self, technician_client, technician_user):
        equipment = EquipmentFactory(status="active")

        technician_client.post(reverse("equipment-status", args=[equipment.id]), {"status": "missing"})

        equipment.refresh_from_db()
        assert equipment.last_action_by == technician_user
        assert equipment.last_action_type == "status_change"
        assert equipment.last_action_at is not None

    def test_equipment_scoped_audit_log_visible_to_all_roles(
        self, admin_client, engineer_client, technician_client
    ):
        equipment = EquipmentFactory()
        admin_client.post(reverse("equipment-status", args=[equipment.id]), {"status": "in_repair"})

        for client in (admin_client, engineer_client, technician_client):
            response = client.get(reverse("equipment-audit-log", args=[equipment.id]))
            assert response.status_code == 200
            assert response.data["count"] >= 1

    def test_global_audit_log_denied_to_technician(self, technician_client):
        response = technician_client.get(reverse("audit-log-list"))
        assert response.status_code == 403

    def test_global_audit_log_visible_to_engineer(self, engineer_client):
        response = engineer_client.get(reverse("audit-log-list"))
        assert response.status_code == 200
