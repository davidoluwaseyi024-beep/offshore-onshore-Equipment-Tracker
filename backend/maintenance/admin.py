from django.contrib import admin

from maintenance.models import MaintenanceRecord


@admin.register(MaintenanceRecord)
class MaintenanceRecordAdmin(admin.ModelAdmin):
    list_display = ("equipment", "maintenance_type", "status", "scheduled_date", "next_due_date")
    list_filter = ("status", "maintenance_type")
    search_fields = ("equipment__name", "equipment__serial_number")
