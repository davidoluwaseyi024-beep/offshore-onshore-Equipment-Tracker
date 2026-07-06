from rest_framework import serializers

from equipment.models import Equipment, StatusChoices


class EquipmentListSerializer(serializers.ModelSerializer):
    """Lean serializer for list views — avoids over-fetching for table rendering."""

    category_name = serializers.CharField(source="category.name", read_only=True)
    site_name = serializers.CharField(source="site.name", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.full_name", read_only=True, default=None)

    class Meta:
        model = Equipment
        fields = [
            "id",
            "name",
            "serial_number",
            "qr_code",
            "category",
            "category_name",
            "site",
            "site_name",
            "status",
            "condition",
            "assigned_to",
            "assigned_to_name",
            "last_action_type",
            "last_action_at",
            "updated_at",
        ]


class EquipmentDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    site_name = serializers.CharField(source="site.name", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.full_name", read_only=True, default=None)
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True, default=None)
    updated_by_name = serializers.CharField(source="updated_by.full_name", read_only=True, default=None)
    last_action_by_name = serializers.CharField(source="last_action_by.full_name", read_only=True, default=None)

    class Meta:
        model = Equipment
        fields = [
            "id",
            "name",
            "serial_number",
            "qr_code",
            "category",
            "category_name",
            "site",
            "site_name",
            "status",
            "condition",
            "manufacturer",
            "model_number",
            "purchase_date",
            "purchase_cost",
            "warranty_expiry",
            "photo",
            "notes",
            "assigned_to",
            "assigned_to_name",
            "created_by",
            "created_by_name",
            "updated_by",
            "updated_by_name",
            "last_action_by",
            "last_action_by_name",
            "last_action_type",
            "last_action_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "status",
            "assigned_to",
            "created_by",
            "updated_by",
            "last_action_by",
            "last_action_type",
            "last_action_at",
            "created_at",
            "updated_at",
        ]


class EquipmentWriteSerializer(serializers.ModelSerializer):
    """
    Used for create/update. `status` is deliberately excluded — every
    status transition, including marking equipment missing, must go
    through the dedicated /equipment/{id}/status/ action so it always
    carries a reason and a guaranteed audit entry.
    """

    class Meta:
        model = Equipment
        fields = [
            "id",
            "name",
            "serial_number",
            "qr_code",
            "category",
            "site",
            "condition",
            "manufacturer",
            "model_number",
            "purchase_date",
            "purchase_cost",
            "warranty_expiry",
            "photo",
            "notes",
        ]
        read_only_fields = ["id"]


class EquipmentStatusChangeSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=StatusChoices.choices)
    note = serializers.CharField(required=False, allow_blank=True, default="")
