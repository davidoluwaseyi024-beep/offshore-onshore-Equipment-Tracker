from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from audit.models import AuditLog
from audit.serializers import AuditLogSerializer
from core.pagination import StandardPageNumberPagination
from equipment import services
from equipment.filters import EquipmentFilterSet
from equipment.models import Equipment
from equipment.permissions import (
    EquipmentAuditLogPermission,
    EquipmentPermission,
    StatusChangePermission,
)
from equipment.serializers import (
    EquipmentDetailSerializer,
    EquipmentListSerializer,
    EquipmentStatusChangeSerializer,
    EquipmentWriteSerializer,
)


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.select_related("category", "site", "assigned_to").all()
    permission_classes = [EquipmentPermission]
    pagination_class = StandardPageNumberPagination
    filterset_class = EquipmentFilterSet
    search_fields = ["name", "serial_number", "qr_code", "manufacturer"]
    ordering_fields = ["created_at", "updated_at", "name", "status"]

    def get_serializer_class(self):
        if self.action == "list":
            return EquipmentListSerializer
        if self.action in {"create", "update", "partial_update"}:
            return EquipmentWriteSerializer
        return EquipmentDetailSerializer

    def perform_create(self, serializer):
        services.create_equipment(serializer=serializer, actor=self.request.user, request=self.request)

    def perform_update(self, serializer):
        services.update_equipment(serializer=serializer, actor=self.request.user, request=self.request)

    def perform_destroy(self, instance):
        services.delete_equipment(equipment=instance, actor=self.request.user, request=self.request)

    @action(detail=True, methods=["post"], permission_classes=[StatusChangePermission])
    def status(self, request, pk=None):
        equipment = self.get_object()
        serializer = EquipmentStatusChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        equipment = services.change_status(
            equipment=equipment,
            new_status=serializer.validated_data["status"],
            note=serializer.validated_data.get("note", ""),
            actor=request.user,
            request=request,
        )
        return Response(EquipmentDetailSerializer(equipment).data)

    @action(detail=True, methods=["get"], url_path="audit-log", permission_classes=[EquipmentAuditLogPermission])
    def audit_log(self, request, pk=None):
        equipment = self.get_object()
        content_type = ContentType.objects.get_for_model(Equipment)
        logs = AuditLog.objects.filter(content_type=content_type, object_id=str(equipment.pk)).select_related(
            "actor"
        )
        page = self.paginate_queryset(logs)
        serializer = AuditLogSerializer(page if page is not None else logs, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[EquipmentPermission])
    def restore(self, request, pk=None):
        equipment = get_object_or_404(Equipment.all_objects, pk=pk)
        equipment = services.restore_equipment(equipment=equipment, actor=request.user, request=request)
        return Response(EquipmentDetailSerializer(equipment).data, status=status.HTTP_200_OK)
