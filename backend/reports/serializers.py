from rest_framework import serializers

from reports.models import FormatChoices, PeriodChoices, ReportExport, ReportSchedule, ReportTypeChoices


class ReportExportSerializer(serializers.ModelSerializer):
    requested_by_name = serializers.CharField(source="created_by.full_name", read_only=True, default=None)
    file_url = serializers.FileField(source="file", read_only=True)

    class Meta:
        model = ReportExport
        fields = [
            "id",
            "report_type",
            "period",
            "date_from",
            "date_to",
            "format",
            "status",
            "filters",
            "file_url",
            "error_message",
            "requested_by_name",
            "created_at",
        ]
        read_only_fields = fields


class ReportGenerateSerializer(serializers.Serializer):
    report_type = serializers.ChoiceField(choices=ReportTypeChoices.choices)
    format = serializers.ChoiceField(choices=FormatChoices.choices)
    period = serializers.ChoiceField(choices=PeriodChoices.choices, default=PeriodChoices.FULL_HISTORY)
    date_from = serializers.DateField(required=False, allow_null=True, default=None)
    date_to = serializers.DateField(required=False, allow_null=True, default=None)
    filters = serializers.JSONField(required=False, default=dict)

    def validate(self, attrs):
        if attrs.get("period") == PeriodChoices.CUSTOM and not (attrs.get("date_from") and attrs.get("date_to")):
            raise serializers.ValidationError("date_from and date_to are required when period is 'custom'.")
        return attrs


class ReportScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportSchedule
        fields = [
            "id",
            "report_type",
            "format",
            "frequency",
            "recipients",
            "filters",
            "is_active",
            "last_run_at",
            "next_run_at",
            "created_by",
            "created_at",
        ]
        read_only_fields = ["id", "last_run_at", "created_by", "created_at"]
