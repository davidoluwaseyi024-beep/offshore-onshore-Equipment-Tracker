from django.conf import settings
from django.db import models

from audit.models import ActionChoices
from core.models import SoftDeleteModel, TimeStampedModel, UserStampedModel


class StatusChoices(models.TextChoices):
    ACTIVE = "active", "Active"
    IN_REPAIR = "in_repair", "In repair"
    MAINTENANCE_DUE = "maintenance_due", "Maintenance due"
    MISSING = "missing", "Missing"
    RETIRED = "retired", "Retired"


class ConditionChoices(models.TextChoices):
    EXCELLENT = "excellent", "Excellent"
    GOOD = "good", "Good"
    FAIR = "fair", "Fair"
    POOR = "poor", "Poor"


class Equipment(TimeStampedModel, SoftDeleteModel, UserStampedModel):
    """
    The core tracked asset. `status` describes physical/operational
    condition only — "who has it" is derived from `assigned_to` / the
    active Assignment record, never from status, so the two can never
    disagree.
    """

    name = models.CharField(max_length=255)
    serial_number = models.CharField(max_length=100, unique=True, db_index=True)
    qr_code = models.CharField(max_length=100, unique=True, null=True, blank=True, db_index=True)

    category = models.ForeignKey("categories.Category", on_delete=models.PROTECT, related_name="equipment")
    site = models.ForeignKey("sites.Site", on_delete=models.PROTECT, related_name="equipment")

    status = models.CharField(
        max_length=20, choices=StatusChoices.choices, default=StatusChoices.ACTIVE, db_index=True
    )
    condition = models.CharField(max_length=20, choices=ConditionChoices.choices, blank=True)

    manufacturer = models.CharField(max_length=255, blank=True)
    model_number = models.CharField(max_length=100, blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    purchase_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    warranty_expiry = models.DateField(null=True, blank=True)
    photo = models.ImageField(upload_to="equipment/photos/", blank=True, null=True)
    notes = models.TextField(blank=True)

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_equipment",
    )

    # Denormalized accountability fields: a fast, join-free cache of the
    # most recent AuditLog entry for this object, kept in sync in the same
    # transaction as every write. The full AuditLog remains the source of
    # truth for complete history.
    last_action_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    last_action_type = models.CharField(max_length=30, choices=ActionChoices.choices, blank=True)
    last_action_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(purchase_cost__isnull=True) | models.Q(purchase_cost__gte=0),
                name="equipment_purchase_cost_non_negative",
            ),
        ]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["site"]),
            models.Index(fields=["category"]),
            models.Index(fields=["assigned_to"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["site", "status"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.serial_number})"

    def record_last_action(self, *, actor, action: str, at):
        self.last_action_by = actor if getattr(actor, "is_authenticated", True) else None
        self.last_action_type = action
        self.last_action_at = at
