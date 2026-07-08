import pytest
from django.urls import reverse

pytestmark = pytest.mark.django_db


class TestReportPermissions:
    def test_technician_can_generate_reports(self, technician_client):
        response = technician_client.post(
            reverse("report-generate"),
            {"report_type": "equipment_summary", "format": "csv", "period": "full_history"},
        )
        assert response.status_code == 201
        assert response.data["status"] == "completed"

    def test_engineer_can_generate_csv_report(self, engineer_client):
        response = engineer_client.post(
            reverse("report-generate"),
            {"report_type": "equipment_summary", "format": "csv", "period": "full_history"},
        )
        assert response.status_code == 201
        assert response.data["status"] == "completed"

    def test_custom_period_requires_date_range(self, engineer_client):
        response = engineer_client.post(
            reverse("report-generate"),
            {"report_type": "equipment_summary", "format": "csv", "period": "custom"},
        )
        assert response.status_code == 400
