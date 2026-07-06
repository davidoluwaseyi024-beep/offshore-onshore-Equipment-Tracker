from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from audit.models import AuditLog
from audit.serializers import AuditLogSerializer
from core.constants import RoleChoices
from equipment.models import Equipment, StatusChoices
from maintenance.models import MaintenanceRecord
from reports.models import ReportTypeChoices


class DashboardSummaryView(APIView):
    """
    One aggregate call to hydrate the dashboard — totals by status,
    overdue maintenance, recent activity, report shortcuts — instead of
    the frontend composing five separate requests.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        equipment_qs = Equipment.objects.all()
        total_equipment = equipment_qs.count()
        by_status = {
            choice: equipment_qs.filter(status=choice).count() for choice in StatusChoices.values
        }

        today = timezone.localdate()
        overdue_maintenance = (
            MaintenanceRecord.objects.filter(next_due_date__lt=today)
            .exclude(status__in=["completed", "cancelled"])
            .count()
        )

        data = {
            "total_equipment": total_equipment,
            "equipment_by_status": by_status,
            "overdue_maintenance_count": overdue_maintenance,
            "report_shortcuts": [
                {"value": value, "label": label} for value, label in ReportTypeChoices.choices
            ],
            "recent_activity": [],
        }

        # The global activity feed is admin+engineer only (see audit.permissions),
        # so a technician's dashboard omits it rather than leaking org-wide activity.
        if request.user.role in {RoleChoices.ADMIN, RoleChoices.ENGINEER}:
            recent = AuditLog.objects.select_related("actor", "content_type").order_by("-created_at")[:10]
            data["recent_activity"] = AuditLogSerializer(recent, many=True).data

        return Response(data)
