from django.db import transaction
from django.utils import timezone

from audit.models import ActionChoices
from audit.services import AuditService, compute_diff
from equipment.services import touch_last_action
from maintenance.models import MaintenanceRecord

TRACKED_FIELDS = [
    "equipment_id",
    "maintenance_type",
    "status",
    "scheduled_date",
    "completed_date",
    "performed_by_id",
    "cost",
    "description",
    "next_due_date",
]


def _snapshot(record: MaintenanceRecord) -> dict:
    return {field: getattr(record, field) for field in TRACKED_FIELDS}


@transaction.atomic
def create_maintenance_record(*, serializer, actor, request=None) -> MaintenanceRecord:
    record = serializer.save(created_by=actor, updated_by=actor)

    ip_address, user_agent = AuditService.request_meta(request)
    AuditService.log(
        actor=actor,
        action=ActionChoices.CREATE,
        target=record,
        changes=compute_diff({}, _snapshot(record), TRACKED_FIELDS),
        ip_address=ip_address,
        user_agent=user_agent,
    )
    touch_last_action(record.equipment, actor=actor, action=ActionChoices.CREATE)
    return record


@transaction.atomic
def update_maintenance_record(*, serializer, actor, request=None) -> MaintenanceRecord:
    before = _snapshot(serializer.instance)
    record = serializer.save(updated_by=actor)

    ip_address, user_agent = AuditService.request_meta(request)
    diff = compute_diff(before, _snapshot(record), TRACKED_FIELDS)
    if diff:
        AuditService.log(
            actor=actor,
            action=ActionChoices.UPDATE,
            target=record,
            changes=diff,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        touch_last_action(record.equipment, actor=actor, action=ActionChoices.UPDATE)
    return record


@transaction.atomic
def complete_maintenance(*, record: MaintenanceRecord, data: dict, actor, request=None) -> MaintenanceRecord:
    record.completed_date = data.get("completed_date") or timezone.localdate()
    record.status = "completed"
    record.performed_by = record.performed_by or actor
    if data.get("cost") is not None:
        record.cost = data["cost"]
    if data.get("notes"):
        record.description = f"{record.description}\n{data['notes']}".strip()
    record.updated_by = actor
    record.save(update_fields=["completed_date", "status", "performed_by", "cost", "description", "updated_by", "updated_at"])

    ip_address, user_agent = AuditService.request_meta(request)
    AuditService.log(
        actor=actor,
        action=ActionChoices.MAINTENANCE_COMPLETE,
        target=record,
        changes={"status": {"old": "scheduled/in_progress", "new": "completed"}},
        ip_address=ip_address,
        user_agent=user_agent,
    )
    touch_last_action(record.equipment, actor=actor, action=ActionChoices.MAINTENANCE_COMPLETE)
    return record


@transaction.atomic
def delete_maintenance_record(*, record: MaintenanceRecord, actor, request=None) -> MaintenanceRecord:
    record.delete(deleted_by=actor)
    ip_address, user_agent = AuditService.request_meta(request)
    AuditService.log(
        actor=actor,
        action=ActionChoices.DELETE,
        target=record,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    return record
