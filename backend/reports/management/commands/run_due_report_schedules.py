import datetime
import logging

from django.core.management.base import BaseCommand
from django.utils import timezone

from reports.models import ExportStatusChoices, ReportSchedule
from reports.services.email import send_report_email
from reports.services.generator import generate_report

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Generates and emails any ReportSchedule whose next_run_at has passed."

    def handle(self, *args, **options):
        due = ReportSchedule.objects.filter(is_active=True, next_run_at__lte=timezone.now())
        generated = 0
        emailed = 0
        for schedule in due:
            export = generate_report(
                report_type=schedule.report_type,
                format=schedule.format,
                period=schedule.frequency,
                date_from=None,
                date_to=None,
                filters=schedule.filters,
                actor=schedule.created_by,
            )
            generated += 1

            if export.status == ExportStatusChoices.COMPLETED and schedule.recipients:
                try:
                    send_report_email(export=export, recipients=schedule.recipients)
                    emailed += 1
                except Exception:
                    # A delivery failure shouldn't block the schedule from
                    # advancing — the report was still generated and is
                    # visible in Report History; log it and move on.
                    logger.exception("Failed to email scheduled report %s to %s", export.pk, schedule.recipients)

            schedule.last_run_at = timezone.now()
            schedule.next_run_at = self._next_run(schedule)
            schedule.save(update_fields=["last_run_at", "next_run_at"])

        self.stdout.write(self.style.SUCCESS(f"Generated {generated} scheduled report(s), emailed {emailed}."))

    @staticmethod
    def _next_run(schedule: ReportSchedule) -> datetime.datetime:
        delta = datetime.timedelta(days=7 if schedule.frequency == "weekly" else 30)
        return timezone.now() + delta
