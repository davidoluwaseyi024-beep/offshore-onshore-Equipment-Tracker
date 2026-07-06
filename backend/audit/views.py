from rest_framework import viewsets

from audit.filters import AuditLogFilterSet
from audit.models import AuditLog
from audit.permissions import CanViewGlobalAuditLog
from audit.serializers import AuditLogSerializer
from core.pagination import StandardPageNumberPagination


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Global, cross-resource activity feed. Read-only, admin+engineer only."""

    queryset = AuditLog.objects.select_related("actor", "content_type").all()
    serializer_class = AuditLogSerializer
    permission_classes = [CanViewGlobalAuditLog]
    pagination_class = StandardPageNumberPagination
    filterset_class = AuditLogFilterSet
    search_fields = ["object_repr"]
    ordering_fields = ["created_at", "action"]
    ordering = ["-created_at"]
