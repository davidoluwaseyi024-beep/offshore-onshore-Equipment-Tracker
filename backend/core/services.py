from django.db import transaction

from audit.models import ActionChoices
from audit.services import AuditService, compute_diff


def snapshot(instance, tracked_fields: list[str]) -> dict:
    return {field: getattr(instance, field) for field in tracked_fields}


@transaction.atomic
def create_with_audit(*, serializer, actor, request, tracked_fields: list[str]):
    """Saves a valid serializer and writes a `create` AuditLog entry in the same transaction."""
    instance = serializer.save(created_by=actor, updated_by=actor)
    ip_address, user_agent = AuditService.request_meta(request)
    AuditService.log(
        actor=actor,
        action=ActionChoices.CREATE,
        target=instance,
        changes=compute_diff({}, snapshot(instance, tracked_fields), tracked_fields),
        ip_address=ip_address,
        user_agent=user_agent,
    )
    return instance


@transaction.atomic
def update_with_audit(*, serializer, actor, request, tracked_fields: list[str]):
    """Saves a valid serializer against an existing instance and writes an `update` diff if anything changed."""
    before = snapshot(serializer.instance, tracked_fields)
    instance = serializer.save(updated_by=actor)
    diff = compute_diff(before, snapshot(instance, tracked_fields), tracked_fields)
    if diff:
        ip_address, user_agent = AuditService.request_meta(request)
        AuditService.log(
            actor=actor,
            action=ActionChoices.UPDATE,
            target=instance,
            changes=diff,
            ip_address=ip_address,
            user_agent=user_agent,
        )
    return instance


@transaction.atomic
def soft_delete_with_audit(*, instance, actor, request):
    instance.delete(deleted_by=actor)
    ip_address, user_agent = AuditService.request_meta(request)
    AuditService.log(
        actor=actor,
        action=ActionChoices.DELETE,
        target=instance,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    return instance


@transaction.atomic
def restore_with_audit(*, instance, actor, request):
    instance.restore()
    ip_address, user_agent = AuditService.request_meta(request)
    AuditService.log(
        actor=actor,
        action=ActionChoices.RESTORE,
        target=instance,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    return instance
