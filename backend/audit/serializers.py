from rest_framework import serializers

from audit.models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source="actor.email", read_only=True, default=None)
    actor_name = serializers.CharField(source="actor.full_name", read_only=True, default=None)
    content_type = serializers.CharField(source="content_type.model", read_only=True)
    action_display = serializers.CharField(source="get_action_display", read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "actor",
            "actor_email",
            "actor_name",
            "action",
            "action_display",
            "content_type",
            "object_id",
            "object_repr",
            "changes",
            "ip_address",
            "created_at",
        ]
        read_only_fields = fields
