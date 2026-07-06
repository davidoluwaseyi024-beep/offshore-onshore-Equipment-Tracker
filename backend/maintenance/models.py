from django.conf import settings
from django.db import models

from core.models import SoftDeleteModel, TimeStampedModel, UserStampedModel


class MaintenanceTypeChoices(models.TextChoices):
    PREVENTIVE = "preventive", "Preventive"
    CORRECTIVE = "corrective", "Corrective"
    INSPECTION = "inspection", "Inspection"


class MaintenanceStatusChoices(models.TextChoices):
    SCHEDULED = "scheduled", "Scheduled"
    IN_PROGRESS = "in_progress", "In progress"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"


class MaintenanceRecord(TimeStampedModel, SoftDeleteModel, UserStampedModel):
    """
    `status` never stores "overdue" — that's a computed condition
    (next_due_date in the past AND status not in [completed, cancelled]),
    evaluated at query time by MaintenanceQuerySet.overdue() so it can
    never go stale waiting on a background job.
    """

    equipment = models.ForeignKey("equipment.Equipment", on_delete=models.CASCADE, related_name="maintenance_records")
    maintenance_type = models.CharField(max_length=20, choices=MaintenanceTypeChoices.choices)
    status = models.CharField(
        max_length=20, choices=MaintenanceStatusChoices.choices, default=MaintenanceStatusChoices.SCHEDULED, db_index=True
    )
    scheduled_date = models.DateField(db_index=True)
    completed_date = models.DateField(null=True, blank=True)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="maintenance_performed"
    )
    cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    description = models.TextField(blank=True)
    next_due_date = models.DateField(null=True, blank=True, db_index=True)

    class Meta:
        ordering = ["-scheduled_date"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(completed_date__isnull=True) | models.Q(completed_date__gte=models.F("scheduled_date")),
                name="maintenance_completed_after_scheduled",
            ),
        ]
        indexes = [
            models.Index(fields=["equipment"]),
            models.Index(fields=["status"]),
            models.Index(fields=["scheduled_date"]),
            models.Index(fields=["next_due_date"]),
            models.Index(fields=["status", "next_due_date"]),
        ]

    def __str__(self):
        return f"{self.get_maintenance_type_display()} — {self.equipment.name}"
