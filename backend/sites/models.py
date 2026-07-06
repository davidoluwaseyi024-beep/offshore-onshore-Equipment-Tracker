from django.db import models

from core.models import SoftDeleteModel, TimeStampedModel, UserStampedModel


class Site(TimeStampedModel, SoftDeleteModel, UserStampedModel):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=120, blank=True)
    state_region = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=120, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["is_active"]),
            models.Index(fields=["country", "city"]),
        ]

    def __str__(self):
        return f"{self.code} — {self.name}"
