from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

from core.models import TimeStampedModel


class ActionChoices(models.TextChoices):
    CREATE = "create", "Create"
    UPDATE = "update", "Update"
    DELETE = "delete", "Delete"
    RESTORE = "restore", "Restore"
    STATUS_CHANGE = "status_change", "Status change"
    ASSIGN = "assign", "Assign"
    RETURN = "return", "Return"
    MAINTENANCE_COMPLETE = "maintenance_complete", "Maintenance complete"
    LOGIN = "login", "Login"
    LOGOUT = "logout", "Logout"
    EXPORT = "export", "Export"
    REGISTER = "register", "Self-registered"
    PASSWORD_RESET = "password_reset", "Password reset"


class AuditLog(TimeStampedModel):
    """
    Append-only, immutable audit trail. No update/delete API is ever
    exposed for this model. Uses a generic relation so a single unified
    table can log events for any target model (Equipment, MaintenanceRecord,
    Assignment, User, ...) without per-app audit tables or a growing set
    of nullable FK columns.
    """

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_entries",
    )
    action = models.CharField(max_length=30, choices=ActionChoices.choices, db_index=True)

    content_type = models.ForeignKey(ContentType, on_delete=models.PROTECT)
    object_id = models.CharField(max_length=64, db_index=True)
    target = GenericForeignKey("content_type", "object_id")

    object_repr = models.CharField(max_length=255, blank=True)
    changes = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["content_type", "object_id"]),
            models.Index(fields=["actor"]),
            models.Index(fields=["action"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        return f"{self.get_action_display()} on {self.object_repr} by {self.actor_id}"
