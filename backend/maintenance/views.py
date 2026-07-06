from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.pagination import StandardPageNumberPagination
from maintenance import services
from maintenance.filters import MaintenanceRecordFilterSet
from maintenance.models import MaintenanceRecord
from maintenance.permissions import MaintenancePermission
from maintenance.serializers import MaintenanceCompleteSerializer, MaintenanceRecordSerializer


class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRecord.objects.select_related("equipment", "performed_by").all()
    serializer_class = MaintenanceRecordSerializer
    permission_classes = [MaintenancePermission]
    pagination_class = StandardPageNumberPagination
    filterset_class = MaintenanceRecordFilterSet
    search_fields = ["equipment__name", "equipment__serial_number", "description"]
    ordering_fields = ["scheduled_date", "next_due_date", "created_at"]

    def perform_create(self, serializer):
        services.create_maintenance_record(serializer=serializer, actor=self.request.user, request=self.request)

    def perform_update(self, serializer):
        services.update_maintenance_record(serializer=serializer, actor=self.request.user, request=self.request)

    def perform_destroy(self, instance):
        services.delete_maintenance_record(record=instance, actor=self.request.user, request=self.request)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        record = self.get_object()
        serializer = MaintenanceCompleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        record = services.complete_maintenance(record=record, data=serializer.validated_data, actor=request.user, request=request)
        return Response(MaintenanceRecordSerializer(record).data)

    @action(detail=False, methods=["get"])
    def overdue(self, request):
        today = timezone.localdate()
        queryset = self.filter_queryset(
            self.get_queryset().filter(next_due_date__lt=today).exclude(status__in=["completed", "cancelled"])
        )
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page if page is not None else queryset, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)
