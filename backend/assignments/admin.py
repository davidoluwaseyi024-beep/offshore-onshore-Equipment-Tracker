from django.contrib import admin

from assignments.models import Assignment


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ("equipment", "assigned_to", "assigned_at", "returned_at")
    list_filter = ("returned_at",)
    search_fields = ("equipment__name", "assigned_to__email")
