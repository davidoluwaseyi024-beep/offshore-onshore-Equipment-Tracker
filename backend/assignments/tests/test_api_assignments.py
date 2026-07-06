import pytest
from django.urls import reverse
from django.utils import timezone

from conftest import EquipmentFactory, UserFactory

pytestmark = pytest.mark.django_db


class TestAssignmentConflict:
    def test_cannot_double_assign_active_equipment(self, engineer_client, technician_user):
        equipment = EquipmentFactory()

        first = engineer_client.post(
            reverse("assignment-list"),
            {"equipment": equipment.id, "assigned_to": technician_user.id, "assigned_at": timezone.now().isoformat()},
        )
        assert first.status_code == 201

        second_user = UserFactory()
        second = engineer_client.post(
            reverse("assignment-list"),
            {"equipment": equipment.id, "assigned_to": second_user.id, "assigned_at": timezone.now().isoformat()},
        )
        assert second.status_code == 400

    def test_assign_updates_equipment_assigned_to(self, engineer_client, technician_user):
        equipment = EquipmentFactory()
        engineer_client.post(
            reverse("assignment-list"),
            {"equipment": equipment.id, "assigned_to": technician_user.id, "assigned_at": timezone.now().isoformat()},
        )
        equipment.refresh_from_db()
        assert equipment.assigned_to == technician_user

    def test_return_clears_equipment_assigned_to_and_allows_reassignment(self, engineer_client, technician_user):
        equipment = EquipmentFactory()
        create_response = engineer_client.post(
            reverse("assignment-list"),
            {"equipment": equipment.id, "assigned_to": technician_user.id, "assigned_at": timezone.now().isoformat()},
        )
        assignment_id = create_response.data["id"]

        return_response = engineer_client.post(reverse("assignment-return", args=[assignment_id]))
        assert return_response.status_code == 200

        equipment.refresh_from_db()
        assert equipment.assigned_to is None

        second_user = UserFactory()
        reassign = engineer_client.post(
            reverse("assignment-list"),
            {"equipment": equipment.id, "assigned_to": second_user.id, "assigned_at": timezone.now().isoformat()},
        )
        assert reassign.status_code == 201


class TestAssignmentScoping:
    def test_technician_only_sees_own_assignments(self, engineer_client, technician_client, technician_user):
        other_user = UserFactory()
        own_equipment = EquipmentFactory()
        other_equipment = EquipmentFactory()

        engineer_client.post(
            reverse("assignment-list"),
            {
                "equipment": own_equipment.id,
                "assigned_to": technician_user.id,
                "assigned_at": timezone.now().isoformat(),
            },
        )
        engineer_client.post(
            reverse("assignment-list"),
            {"equipment": other_equipment.id, "assigned_to": other_user.id, "assigned_at": timezone.now().isoformat()},
        )

        response = technician_client.get(reverse("assignment-list"))
        assert response.data["count"] == 1
        assert response.data["results"][0]["equipment"] == own_equipment.id

    def test_technician_cannot_create_assignment(self, technician_client, technician_user):
        equipment = EquipmentFactory()
        response = technician_client.post(
            reverse("assignment-list"),
            {"equipment": equipment.id, "assigned_to": technician_user.id, "assigned_at": timezone.now().isoformat()},
        )
        assert response.status_code == 403
