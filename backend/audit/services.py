from django.contrib.contenttypes.models import ContentType

from audit.models import AuditLog


def compute_diff(old: dict, new: dict, tracked_fields: list[str]) -> dict:
    """
    Builds a {"field": {"old": ..., "new": ...}} diff for the given
    tracked fields, only including fields that actually changed.
    """
    diff = {}
    for field in tracked_fields:
        old_value = old.get(field)
        new_value = new.get(field)
        if old_value != new_value:
            diff[field] = {"old": _serializable(old_value), "new": _serializable(new_value)}
    return diff


def _serializable(value):
    if hasattr(value, "isoformat"):
        return value.isoformat()
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    return str(value)


class AuditService:
    """
    Every state-changing operation in every app's service layer calls
    `AuditService.log(...)` as part of the same DB transaction as the
    business change, so the audit entry and the change it describes
    always succeed or fail together.
    """

    @staticmethod
    def log(
        *,
        actor,
        action: str,
        target,
        changes: dict | None = None,
        ip_address: str | None = None,
        user_agent: str = "",
    ) -> AuditLog:
        return AuditLog.objects.create(
            actor=actor if (actor and getattr(actor, "is_authenticated", True)) else None,
            action=action,
            content_type=ContentType.objects.get_for_model(target.__class__),
            object_id=str(target.pk),
            object_repr=str(target)[:255],
            changes=changes or {},
            ip_address=ip_address,
            user_agent=user_agent[:255],
        )

    @staticmethod
    def request_meta(request):
        """Extracts (ip_address, user_agent) from a DRF request for logging."""
        if request is None:
            return None, ""
        xff = request.META.get("HTTP_X_FORWARDED_FOR")
        ip_address = xff.split(",")[0].strip() if xff else request.META.get("REMOTE_ADDR")
        user_agent = request.META.get("HTTP_USER_AGENT", "")
        return ip_address, user_agent
