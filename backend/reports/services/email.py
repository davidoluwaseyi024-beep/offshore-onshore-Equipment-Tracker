from django.conf import settings
from django.core.mail import EmailMessage

from reports.models import ReportExport


def send_report_email(*, export: ReportExport, recipients: list[str]) -> None:
    """
    Emails a completed ReportExport as an attachment. No-op if there are no
    recipients or the export has no file (e.g. it failed to generate) —
    callers should check `export.status == "completed"` before calling this
    if they want to distinguish "nothing to send" from "failed silently".
    """
    if not recipients or not export.file:
        return

    subject = f"{export.get_report_type_display()} report ({export.get_format_display()})"
    body = (
        f"Your scheduled {export.get_report_type_display().lower()} report is attached.\n\n"
        f"Period: {export.date_from or 'full history'} to {export.date_to or 'present'}\n"
        f"Generated: {export.created_at:%Y-%m-%d %H:%M} UTC"
    )

    message = EmailMessage(
        subject=subject,
        body=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=recipients,
    )
    with export.file.open("rb") as f:
        content_type = "application/pdf" if export.format == "pdf" else "text/csv"
        message.attach(export.file.name.split("/")[-1], f.read(), content_type)
    message.send(fail_silently=False)
