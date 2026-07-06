from django.conf import settings
from django.db import models

from core.models import SoftDeleteModel, TimeStampedModel, UserStampedModel


class Assignment(TimeStampedModel, SoftDeleteModel, UserStampedModel):
    equipment = models.ForeignKey("equipment.Equipment", on_delete=models.CASCADE, related_name="assignments")
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="assignment_history"
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="+"
    )
    site = models.ForeignKey(
        "sites.Site", on_delete=models.PROTECT, related_name="assignments", null=True, blank=True
    )
    assigned_at = models.DateTimeField()
    expected_return_at = models.DateTimeField(null=True, blank=True)
    returned_at = models.DateTimeField(null=True, blank=True, db_index=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-assigned_at"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(returned_at__isnull=True) | models.Q(returned_at__gte=models.F("assigned_at")),
                name="assignment_returned_after_assigned",
            ),
            models.UniqueConstraint(
                fields=["equipment"],
                condition=models.Q(returned_at__isnull=True, is_deleted=False),
                name="unique_active_assignment_per_equipment",
            ),
        ]
        indexes = [
            models.Index(fields=["equipment"]),
            models.Index(fields=["assigned_to"]),
            models.Index(fields=["returned_at"]),
            models.Index(fields=["equipment", "returned_at"]),
        ]

    def __str__(self):
        return f"{self.equipment.name} → {self.assigned_to}"

    @property
    def is_active(self) -> bool:
        return self.returned_at is None
