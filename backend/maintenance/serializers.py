from django.utils import timezone
from rest_framework import serializers

from maintenance.models import MaintenanceRecord


class MaintenanceRecordSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source="equipment.name", read_only=True)
    performed_by_name = serializers.CharField(source="performed_by.full_name", read_only=True, default=None)
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = MaintenanceRecord
        fields = [
            "id",
            "equipment",
            "equipment_name",
            "maintenance_type",
            "status",
            "scheduled_date",
            "completed_date",
            "performed_by",
            "performed_by_name",
            "cost",
            "description",
            "next_due_date",
            "is_overdue",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_by", "updated_by", "created_at", "updated_at"]

    def get_is_overdue(self, obj) -> bool:
        return bool(
            obj.next_due_date
            and obj.next_due_date < timezone.localdate()
            and obj.status not in {"completed", "cancelled"}
        )


class MaintenanceCompleteSerializer(serializers.Serializer):
    completed_date = serializers.DateField(required=False)
    cost = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, default="")
