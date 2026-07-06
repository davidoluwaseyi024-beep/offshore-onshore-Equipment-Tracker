from django.db import models

from core.models import TimeStampedModel, UserStampedModel


class ReportTypeChoices(models.TextChoices):
    EQUIPMENT_SUMMARY = "equipment_summary", "Equipment summary"
    MAINTENANCE_HISTORY = "maintenance_history", "Maintenance history"
    ASSIGNMENT_HISTORY = "assignment_history", "Assignment history"
    FULL_HISTORY = "full_history", "Full history"


class PeriodChoices(models.TextChoices):
    WEEKLY = "weekly", "Weekly"
    MONTHLY = "monthly", "Monthly"
    FULL_HISTORY = "full_history", "Full history"
    CUSTOM = "custom", "Custom"


class FormatChoices(models.TextChoices):
    PDF = "pdf", "PDF"
    CSV = "csv", "CSV"


class ExportStatusChoices(models.TextChoices):
    PENDING = "pending", "Pending"
    PROCESSING = "processing", "Processing"
    COMPLETED = "completed", "Completed"
    FAILED = "failed", "Failed"


class ReportExport(TimeStampedModel, UserStampedModel):
    report_type = models.CharField(max_length=30, choices=ReportTypeChoices.choices, db_index=True)
    period = models.CharField(max_length=20, choices=PeriodChoices.choices, blank=True)
    date_from = models.DateField(null=True, blank=True)
    date_to = models.DateField(null=True, blank=True)
    format = models.CharField(max_length=10, choices=FormatChoices.choices)
    status = models.CharField(
        max_length=20, choices=ExportStatusChoices.choices, default=ExportStatusChoices.PENDING, db_index=True
    )
    filters = models.JSONField(default=dict, blank=True)
    file = models.FileField(upload_to="reports/exports/", blank=True, null=True)
    error_message = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["report_type"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.get_report_type_display()} ({self.format}) — {self.status}"


class ReportSchedule(TimeStampedModel, UserStampedModel):
    report_type = models.CharField(max_length=30, choices=ReportTypeChoices.choices)
    format = models.CharField(max_length=10, choices=FormatChoices.choices)
    frequency = models.CharField(max_length=10, choices=[("weekly", "Weekly"), ("monthly", "Monthly")])
    recipients = models.JSONField(default=list, blank=True, help_text="List of recipient email addresses")
    filters = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    last_run_at = models.DateTimeField(null=True, blank=True)
    next_run_at = models.DateTimeField(db_index=True)

    class Meta:
        ordering = ["next_run_at"]
        indexes = [
            models.Index(fields=["next_run_at"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self):
        return f"{self.get_report_type_display()} — {self.frequency}"
