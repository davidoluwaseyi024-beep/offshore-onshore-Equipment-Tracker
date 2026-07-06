from django.utils import timezone
from rest_framework import serializers

from assignments.models import Assignment


class AssignmentSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source="equipment.name", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.full_name", read_only=True)
    site_name = serializers.CharField(source="site.name", read_only=True, default=None)
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id",
            "equipment",
            "equipment_name",
            "assigned_to",
            "assigned_to_name",
            "assigned_by",
            "site",
            "site_name",
            "assigned_at",
            "expected_return_at",
            "returned_at",
            "is_active",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "assigned_by", "returned_at", "created_at", "updated_at"]

    def validate_equipment(self, equipment):
        if Assignment.objects.filter(equipment=equipment, returned_at__isnull=True).exists():
            raise serializers.ValidationError(
                "This equipment already has an active assignment. Return it before reassigning."
            )
        return equipment

    def validate(self, attrs):
        attrs.setdefault("assigned_at", timezone.now())
        return attrs


class AssignmentReturnSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True, default="")
