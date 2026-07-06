from django.contrib import admin

from reports.models import ReportExport, ReportSchedule


@admin.register(ReportExport)
class ReportExportAdmin(admin.ModelAdmin):
    list_display = ("report_type", "format", "status", "created_by", "created_at")
    list_filter = ("report_type", "format", "status")


@admin.register(ReportSchedule)
class ReportScheduleAdmin(admin.ModelAdmin):
    list_display = ("report_type", "frequency", "is_active", "next_run_at", "last_run_at")
    list_filter = ("frequency", "is_active")
