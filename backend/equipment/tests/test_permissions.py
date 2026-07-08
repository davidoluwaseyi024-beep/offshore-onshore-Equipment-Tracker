import pytest
from django.urls import reverse

from conftest import EquipmentFactory

pytestmark = pytest.mark.django_db


class TestEquipmentPermissionMatrix:
    def test_all_roles_can_list_equipment(self, admin_client, engineer_client, technician_client):
        for client in (admin_client, engineer_client, technician_client):
            assert client.get(reverse("equipment-list")).status_code == 200

    def test_technician_can_create_equipment(self, technician_client, db):
        from conftest import CategoryFactory, SiteFactory

        category = CategoryFactory()
        site = SiteFactory()
        response = technician_client.post(
            reverse("equipment-list"),
            {"name": "Drill", "serial_number": "SN-TECH-1", "category": category.id, "site": site.id},
        )
        assert response.status_code == 201

    def test_engineer_can_create_equipment(self, engineer_client, db):
        from conftest import CategoryFactory, SiteFactory

        category = CategoryFactory()
        site = SiteFactory()
        response = engineer_client.post(
            reverse("equipment-list"),
            {"name": "Drill", "serial_number": "SN-ENG-1", "category": category.id, "site": site.id},
        )
        assert response.status_code == 201

    def test_only_admin_can_delete_equipment(self, engineer_client, admin_client):
        equipment = EquipmentFactory()
        assert engineer_client.delete(reverse("equipment-detail", args=[equipment.id])).status_code == 403
        assert admin_client.delete(reverse("equipment-detail", args=[equipment.id])).status_code == 204

    def test_technician_can_change_status(self, technician_client):
        equipment = EquipmentFactory()
        response = technician_client.post(
            reverse("equipment-status", args=[equipment.id]), {"status": "missing", "note": "not found"}
        )
        assert response.status_code == 200
        assert response.data["status"] == "missing"
