from django.db import IntegrityError, transaction
from django.utils import timezone

from assignments.models import Assignment
from audit.models import ActionChoices
from audit.services import AuditService
from core.exceptions import ConflictError
from equipment.services import touch_last_action


@transaction.atomic
def create_assignment(*, serializer, actor, request=None) -> Assignment:
    """`serializer` must already be validated (DRF calls perform_create after is_valid())."""
    try:
        with transaction.atomic():
            assignment = serializer.save(
                created_by=actor, updated_by=actor, assigned_by=actor
            )
    except IntegrityError as exc:
        raise ConflictError(
            "This equipment already has an active assignment. Return it before reassigning."
        ) from exc

    equipment = assignment.equipment
    equipment.assigned_to = assignment.assigned_to
    equipment.updated_by = actor
    equipment.save(update_fields=["assigned_to", "updated_by", "updated_at"])

    ip_address, user_agent = AuditService.request_meta(request)
    AuditService.log(
        actor=actor,
        action=ActionChoices.ASSIGN,
        target=assignment,
        changes={"equipment": equipment.name, "assigned_to": str(assignment.assigned_to)},
        ip_address=ip_address,
        user_agent=user_agent,
    )
    touch_last_action(equipment, actor=actor, action=ActionChoices.ASSIGN)
    return assignment


@transaction.atomic
def return_assignment(*, assignment: Assignment, notes: str, actor, request=None) -> Assignment:
    if not assignment.is_active:
        raise ConflictError("This assignment has already been returned.")

    assignment.returned_at = timezone.now()
    if notes:
        assignment.notes = f"{assignment.notes}\n{notes}".strip()
    assignment.updated_by = actor
    assignment.save(update_fields=["returned_at", "notes", "updated_by", "updated_at"])

    equipment = assignment.equipment
    equipment.assigned_to = None
    equipment.updated_by = actor
    equipment.save(update_fields=["assigned_to", "updated_by", "updated_at"])

    ip_address, user_agent = AuditService.request_meta(request)
    AuditService.log(
        actor=actor,
        action=ActionChoices.RETURN,
        target=assignment,
        changes={"equipment": equipment.name, "returned_by": str(actor)},
        ip_address=ip_address,
        user_agent=user_agent,
    )
    touch_last_action(equipment, actor=actor, action=ActionChoices.RETURN)
    return assignment
