import pytest

from conftest import EquipmentFactory
from reports.models import ExportStatusChoices, PeriodChoices, ReportTypeChoices
from reports.services.generator import generate_report

pytestmark = pytest.mark.django_db


class TestGenerateReportCSV:
    def test_equipment_summary_csv_completes_and_produces_a_file(self, admin_user):
        EquipmentFactory(name="Excavator One")

        export = generate_report(
            report_type=ReportTypeChoices.EQUIPMENT_SUMMARY,
            format="csv",
            period=PeriodChoices.FULL_HISTORY,
            date_from=None,
            date_to=None,
            filters={},
            actor=admin_user,
        )

        assert export.status == ExportStatusChoices.COMPLETED
        assert export.file.name.endswith(".csv")
        content = export.file.read().decode("utf-8")
        assert "Excavator One" in content


class TestGenerateReportPDF:
    def test_full_history_pdf_completes_and_produces_a_valid_pdf(self, admin_user):
        export = generate_report(
            report_type=ReportTypeChoices.FULL_HISTORY,
            format="pdf",
            period=PeriodChoices.FULL_HISTORY,
            date_from=None,
            date_to=None,
            filters={},
            actor=admin_user,
        )

        assert export.status == ExportStatusChoices.COMPLETED
        assert export.file.name.endswith(".pdf")
        header = export.file.read(5)
        assert header == b"%PDF-"


class TestGenerateReportFailure:
    def test_unknown_gatherer_failure_marks_export_failed_not_silently_lost(self, admin_user, monkeypatch):
        from reports.services import generator

        def boom(*args, **kwargs):
            raise RuntimeError("simulated failure")

        monkeypatch.setitem(generator._GATHERERS, ReportTypeChoices.EQUIPMENT_SUMMARY, boom)

        with pytest.raises(RuntimeError):
            generate_report(
                report_type=ReportTypeChoices.EQUIPMENT_SUMMARY,
                format="csv",
                period=PeriodChoices.FULL_HISTORY,
                date_from=None,
                date_to=None,
                filters={},
                actor=admin_user,
            )

        from reports.models import ReportExport

        export = ReportExport.objects.latest("created_at")
        assert export.status == ExportStatusChoices.FAILED
        assert "simulated failure" in export.error_message
