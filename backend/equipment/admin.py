from django.contrib import admin

from equipment.models import Equipment


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ("name", "serial_number", "status", "site", "category", "assigned_to", "is_deleted")
    list_filter = ("status", "condition", "site", "category", "is_deleted")
    search_fields = ("name", "serial_number", "qr_code", "manufacturer")

    def get_queryset(self, request):
        return Equipment.all_objects.all()
