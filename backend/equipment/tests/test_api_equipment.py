import pytest
from django.urls import reverse

from conftest import EquipmentFactory

pytestmark = pytest.mark.django_db


class TestEquipmentWriteSerializer:
    def test_patch_cannot_change_status_directly(self, engineer_client):
        equipment = EquipmentFactory(status="active")
        response = engineer_client.patch(
            reverse("equipment-detail", args=[equipment.id]), {"status": "missing"}, format="json"
        )
        assert response.status_code == 200
        equipment.refresh_from_db()
        assert equipment.status == "active"  # unchanged — status field is read-only on this endpoint

    def test_create_sets_created_by_and_last_action(self, engineer_client, engineer_user):
        from conftest import CategoryFactory, SiteFactory

        category = CategoryFactory()
        site = SiteFactory()
        response = engineer_client.post(
            reverse("equipment-list"),
            {"name": "Pump", "serial_number": "SN-PUMP-1", "category": category.id, "site": site.id},
        )
        assert response.status_code == 201

        from equipment.models import Equipment

        equipment = Equipment.objects.get(pk=response.data["id"])
        assert equipment.created_by == engineer_user
        assert equipment.last_action_by == engineer_user
        assert equipment.last_action_type == "create"


class TestEquipmentRestore:
    def test_restore_brings_back_soft_deleted_equipment(self, admin_client):
        equipment = EquipmentFactory()
        admin_client.delete(reverse("equipment-detail", args=[equipment.id]))

        response = admin_client.post(reverse("equipment-restore", args=[equipment.id]))

        assert response.status_code == 200
        from equipment.models import Equipment

        assert Equipment.objects.filter(pk=equipment.id).exists()
