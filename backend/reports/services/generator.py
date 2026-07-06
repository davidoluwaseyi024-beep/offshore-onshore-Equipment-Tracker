import datetime

from django.core.files.base import ContentFile
from django.db import transaction
from django.utils import timezone

from assignments.models import Assignment
from audit.models import ActionChoices, AuditLog
from audit.services import AuditService
from equipment.models import Equipment
from maintenance.models import MaintenanceRecord
from reports.models import ExportStatusChoices, FormatChoices, PeriodChoices, ReportExport, ReportTypeChoices
from reports.services.csv_export import rows_to_csv
from reports.services.pdf_export import render_pdf

TEMPLATE_BY_REPORT_TYPE = {
    ReportTypeChoices.EQUIPMENT_SUMMARY: "reports/equipment_summary.html",
    ReportTypeChoices.MAINTENANCE_HISTORY: "reports/maintenance_history.html",
    ReportTypeChoices.ASSIGNMENT_HISTORY: "reports/assignment_history.html",
    ReportTypeChoices.FULL_HISTORY: "reports/full_history.html",
}


def resolve_date_range(period: str, date_from, date_to):
    today = timezone.localdate()
    if period == PeriodChoices.WEEKLY:
        return today - datetime.timedelta(days=7), today
    if period == PeriodChoices.MONTHLY:
        return today - datetime.timedelta(days=30), today
    if period == PeriodChoices.FULL_HISTORY:
        return None, None
    return date_from, date_to


def _apply_date_range(queryset, field: str, date_from, date_to):
    """For DateField columns — `date_from`/`date_to` are already plain dates."""
    if date_from:
        queryset = queryset.filter(**{f"{field}__gte": date_from})
    if date_to:
        queryset = queryset.filter(**{f"{field}__lte": date_to})
    return queryset


def _apply_datetime_date_range(queryset, field: str, date_from, date_to):
    """
    For DateTimeField columns filtered by plain dates — uses the `__date`
    lookup transform rather than comparing against a naive midnight
    datetime, which would otherwise raise Django's naive-datetime warning
    under USE_TZ=True.
    """
    if date_from:
        queryset = queryset.filter(**{f"{field}__date__gte": date_from})
    if date_to:
        queryset = queryset.filter(**{f"{field}__date__lte": date_to})
    return queryset


def _gather_equipment_summary(date_from, date_to, filters):
    queryset = Equipment.objects.select_related("category", "site", "assigned_to")
    queryset = _apply_datetime_date_range(queryset, "created_at", date_from, date_to)
    if filters.get("site"):
        queryset = queryset.filter(site_id=filters["site"])
    if filters.get("status"):
        queryset = queryset.filter(status=filters["status"])

    fieldnames = ["name", "serial_number", "status", "site", "category", "assigned_to", "updated_at"]
    rows = [
        {
            "name": e.name,
            "serial_number": e.serial_number,
            "status": e.get_status_display(),
            "site": e.site.name,
            "category": e.category.name,
            "assigned_to": e.assigned_to.full_name if e.assigned_to else "",
            "updated_at": e.updated_at.isoformat(),
        }
        for e in queryset
    ]
    return fieldnames, rows, {"equipment": queryset}


def _gather_maintenance_history(date_from, date_to, filters):
    queryset = MaintenanceRecord.objects.select_related("equipment", "performed_by")
    queryset = _apply_date_range(queryset, "scheduled_date", date_from, date_to)
    if filters.get("equipment"):
        queryset = queryset.filter(equipment_id=filters["equipment"])

    fieldnames = ["equipment", "maintenance_type", "status", "scheduled_date", "completed_date", "performed_by", "cost"]
    rows = [
        {
            "equipment": r.equipment.name,
            "maintenance_type": r.get_maintenance_type_display(),
            "status": r.get_status_display(),
            "scheduled_date": r.scheduled_date.isoformat(),
            "completed_date": r.completed_date.isoformat() if r.completed_date else "",
            "performed_by": r.performed_by.full_name if r.performed_by else "",
            "cost": str(r.cost) if r.cost is not None else "",
        }
        for r in queryset
    ]
    return fieldnames, rows, {"records": queryset}


def _gather_assignment_history(date_from, date_to, filters):
    queryset = Assignment.objects.select_related("equipment", "assigned_to", "site")
    queryset = _apply_datetime_date_range(queryset, "assigned_at", date_from, date_to)

    fieldnames = ["equipment", "assigned_to", "assigned_at", "returned_at", "site"]
    rows = [
        {
            "equipment": a.equipment.name,
            "assigned_to": a.assigned_to.full_name,
            "assigned_at": a.assigned_at.isoformat(),
            "returned_at": a.returned_at.isoformat() if a.returned_at else "",
            "site": a.site.name if a.site else "",
        }
        for a in queryset
    ]
    return fieldnames, rows, {"assignments": queryset}


def _gather_full_history(date_from, date_to, filters):
    queryset = AuditLog.objects.select_related("actor", "content_type")
    queryset = _apply_datetime_date_range(queryset, "created_at", date_from, date_to)

    fieldnames = ["created_at", "actor", "action", "content_type", "object_repr", "changes"]
    rows = [
        {
            "created_at": log.created_at.isoformat(),
            "actor": log.actor.full_name if log.actor else "system",
            "action": log.get_action_display(),
            "content_type": log.content_type.model,
            "object_repr": log.object_repr,
            "changes": log.changes,
        }
        for log in queryset
    ]
    return fieldnames, rows, {"logs": queryset}


_GATHERERS = {
    ReportTypeChoices.EQUIPMENT_SUMMARY: _gather_equipment_summary,
    ReportTypeChoices.MAINTENANCE_HISTORY: _gather_maintenance_history,
    ReportTypeChoices.ASSIGNMENT_HISTORY: _gather_assignment_history,
    ReportTypeChoices.FULL_HISTORY: _gather_full_history,
}


def generate_report(
    *, report_type: str, format: str, period: str, date_from, date_to, filters: dict, actor, request=None
) -> ReportExport:
    """
    Synchronous for v1 (see architecture doc for the Celery upgrade seam).
    This function's signature/behavior doesn't know or care whether it's
    called directly from a view or later wrapped in `.delay()`.
    """
    resolved_from, resolved_to = resolve_date_range(period, date_from, date_to)

    export = ReportExport.objects.create(
        report_type=report_type,
        period=period,
        date_from=resolved_from,
        date_to=resolved_to,
        format=format,
        filters=filters,
        status=ExportStatusChoices.PROCESSING,
        created_by=actor,
        updated_by=actor,
    )

    try:
        fieldnames, rows, pdf_context = _GATHERERS[report_type](resolved_from, resolved_to, filters or {})
        timestamp = timezone.now().strftime("%Y%m%d-%H%M%S")

        if format == FormatChoices.CSV:
            content = rows_to_csv(fieldnames, rows)
            filename = f"{report_type}-{timestamp}.csv"
        else:
            template_name = TEMPLATE_BY_REPORT_TYPE[report_type]
            context = {
                "generated_at": timezone.now(),
                "date_from": resolved_from,
                "date_to": resolved_to,
                "report_type": report_type,
                **pdf_context,
            }
            content = render_pdf(template_name, context)
            filename = f"{report_type}-{timestamp}.pdf"

        with transaction.atomic():
            export.file.save(filename, ContentFile(content), save=False)
            export.status = ExportStatusChoices.COMPLETED
            export.save(update_fields=["file", "status"])
    except Exception as exc:  # noqa: BLE001 — genuinely must catch anything to record failure state
        export.status = ExportStatusChoices.FAILED
        export.error_message = str(exc)
        export.save(update_fields=["status", "error_message"])
        raise

    ip_address, user_agent = AuditService.request_meta(request)
    AuditService.log(
        actor=actor,
        action=ActionChoices.EXPORT,
        target=export,
        changes={"report_type": report_type, "format": format},
        ip_address=ip_address,
        user_agent=user_agent,
    )
    return export
