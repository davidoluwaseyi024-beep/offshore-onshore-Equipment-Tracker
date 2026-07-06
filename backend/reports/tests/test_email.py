import pytest
from django.core import mail

from conftest import EquipmentFactory
from reports.models import PeriodChoices, ReportTypeChoices
from reports.services.email import send_report_email
from reports.services.generator import generate_report

pytestmark = pytest.mark.django_db


class TestSendReportEmail:
    def test_completed_export_is_emailed_with_attachment(self, admin_user):
        EquipmentFactory(name="Rig Pump")
        export = generate_report(
            report_type=ReportTypeChoices.EQUIPMENT_SUMMARY,
            format="csv",
            period=PeriodChoices.FULL_HISTORY,
            date_from=None,
            date_to=None,
            filters={},
            actor=admin_user,
        )

        send_report_email(export=export, recipients=["ops@example.com"])

        assert len(mail.outbox) == 1
        sent = mail.outbox[0]
        assert sent.to == ["ops@example.com"]
        assert len(sent.attachments) == 1
        filename, _content, content_type = sent.attachments[0]
        assert filename.endswith(".csv")
        assert content_type == "text/csv"

    def test_no_recipients_sends_nothing(self, admin_user):
        EquipmentFactory()
        export = generate_report(
            report_type=ReportTypeChoices.EQUIPMENT_SUMMARY,
            format="csv",
            period=PeriodChoices.FULL_HISTORY,
            date_from=None,
            date_to=None,
            filters={},
            actor=admin_user,
        )

        send_report_email(export=export, recipients=[])

        assert len(mail.outbox) == 0
