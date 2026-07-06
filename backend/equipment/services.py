from django.db import transaction
from django.utils import timezone

from audit.models import ActionChoices
from audit.services import AuditService, compute_diff
from equipment.models import Equipment

TRACKED_FIELDS = [
    "name",
    "serial_number",
    "qr_code",
    "category_id",
    "site_id",
    "condition",
    "manufacturer",
    "model_number",
    "purchase_date",
    "purchase_cost",
    "warranty_expiry",
    "notes",
]


def _snapshot(equipment: Equipment) -> dict:
    return {field: getattr(equipment, field) for field in TRACKED_FIELDS}


def touch_last_action(equipment: Equipment, *, actor, action: str, at=None):
    """
    Called by this app's own services AND by other apps' services
    (assignments, maintenance) whenever they perform an audited action
    that concerns a specific piece of equipment, so `last_action_*` always
    reflects the most recent touch regardless of which app initiated it.
    Must be called inside the caller's own transaction.atomic() block.
    """
    equipment.record_last_action(actor=actor, action=action, at=at or timezone.now())
    equipment.save(update_fields=["last_action_by", "last_action_type", "last_action_at"])


@transaction.atomic
def create_equipment(*, serializer, actor, request=None) -> Equipment:
    """`serializer` must already be validated (DRF calls perform_create after is_valid())."""
    equipment = serializer.save(created_by=actor, updated_by=actor)

    ip_address, user_agent = AuditService.request_meta(request)
    AuditService.log(
        actor=actor,
        action=ActionChoices.CREATE,
        target=equipment,
        changes=compute_diff({}, _snapshot(equipment), TRACKED_FIELDS),
        ip_address=ip_address,
        user_agent=user_agent,
    )
    touch_last_action(equipment, actor=actor, action=ActionChoices.CREATE)
    return equipment


@transaction.atomic
def update_equipment(*, serializer, actor, request=None) -> Equipment:
    """`serializer` must already be validated, with `.instance` set to the equipment being updated."""
    before = _snapshot(serializer.instance)
    equipment = serializer.save(updated_by=actor)

    ip_address, user_agent = AuditService.request_meta(request)
    diff = compute_diff(before, _snapshot(equipment), TRACKED_FIELDS)
    if diff:
        AuditService.log(
            actor=actor,
            action=ActionChoices.UPDATE,
            target=equipment,
            changes=diff,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        touch_last_action(equipment, actor=actor, action=ActionChoices.UPDATE)
    return equipment


@transaction.atomic
def change_status(*, equipment: Equipment, new_status: str, note: str, actor, request=None) -> Equipment:
    old_status = equipment.status
    equipment.status = new_status
    equipment.updated_by = actor
    equipment.save(update_fields=["status", "updated_by", "updated_at"])

    ip_address, user_agent = AuditService.request_meta(request)
    AuditService.log(
        actor=actor,
        action=ActionChoices.STATUS_CHANGE,
        target=equipment,
        changes={"status": {"old": old_status, "new": new_status}, "note": note},
        ip_address=ip_address,
        user_agent=user_agent,
    )
    touch_last_action(equipment, actor=actor, action=ActionChoices.STATUS_CHANGE)
    return equipment


@transaction.atomic
def delete_equipment(*, equipment: Equipment, actor, request=None) -> Equipment:
    equipment.delete(deleted_by=actor)

    ip_address, user_agent = AuditService.request_meta(request)
    AuditService.log(
        actor=actor,
        action=ActionChoices.DELETE,
        target=equipment,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    touch_last_action(equipment, actor=actor, action=ActionChoices.DELETE)
    return equipment


@transaction.atomic
def restore_equipment(*, equipment: Equipment, actor, request=None) -> Equipment:
    equipment.restore()

    ip_address, user_agent = AuditService.request_meta(request)
    AuditService.log(
        actor=actor,
        action=ActionChoices.RESTORE,
        target=equipment,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    touch_last_action(equipment, actor=actor, action=ActionChoices.RESTORE)
    return equipment
