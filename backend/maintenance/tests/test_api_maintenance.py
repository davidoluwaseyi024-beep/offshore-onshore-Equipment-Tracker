import datetime

import pytest
from django.urls import reverse
from django.utils import timezone

from conftest import EquipmentFactory
from maintenance.models import MaintenanceRecord

pytestmark = pytest.mark.django_db


class TestOverdueComputation:
    def test_overdue_endpoint_only_returns_past_due_incomplete_records(self, engineer_client):
        equipment = EquipmentFactory()
        today = timezone.localdate()

        overdue = MaintenanceRecord.objects.create(
            equipment=equipment,
            maintenance_type="inspection",
            scheduled_date=today - datetime.timedelta(days=30),
            next_due_date=today - datetime.timedelta(days=5),
        )
        MaintenanceRecord.objects.create(
            equipment=equipment,
            maintenance_type="inspection",
            scheduled_date=today,
            next_due_date=today + datetime.timedelta(days=30),
        )
        MaintenanceRecord.objects.create(
            equipment=equipment,
            maintenance_type="inspection",
            status="completed",
            scheduled_date=today - datetime.timedelta(days=40),
            completed_date=today - datetime.timedelta(days=35),
            next_due_date=today - datetime.timedelta(days=10),
        )

        response = engineer_client.get(reverse("maintenance-overdue"))

        assert response.status_code == 200
        ids = {r["id"] for r in response.data["results"]}
        assert ids == {overdue.id}

    def test_is_overdue_flag_never_goes_stale_without_a_background_job(self, engineer_client):
        """`overdue` is computed at query time, not stored — so it can't drift from reality."""
        equipment = EquipmentFactory()
        record = MaintenanceRecord.objects.create(
            equipment=equipment,
            maintenance_type="inspection",
            scheduled_date=timezone.localdate() - datetime.timedelta(days=10),
            next_due_date=timezone.localdate() - datetime.timedelta(days=1),
        )

        response = engineer_client.get(reverse("maintenance-detail", args=[record.id]))
        assert response.data["is_overdue"] is True


class TestMaintenanceComplete:
    def test_complete_sets_status_and_performed_by(self, technician_client, technician_user):
        equipment = EquipmentFactory()
        record = MaintenanceRecord.objects.create(
            equipment=equipment, maintenance_type="preventive", scheduled_date=timezone.localdate()
        )

        response = technician_client.post(reverse("maintenance-complete", args=[record.id]), {"notes": "Done"})

        assert response.status_code == 200
        assert response.data["status"] == "completed"
        assert response.data["performed_by_name"] == technician_user.full_name
