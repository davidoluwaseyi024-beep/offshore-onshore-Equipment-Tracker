from django.http import FileResponse
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.constants import RoleChoices
from core.pagination import StandardPageNumberPagination
from reports.models import ReportExport, ReportSchedule
from reports.permissions import ReportPermission
from reports.serializers import ReportExportSerializer, ReportGenerateSerializer, ReportScheduleSerializer
from reports.services.generator import generate_report


class ReportExportViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = ReportExport.objects.all()
    serializer_class = ReportExportSerializer
    permission_classes = [ReportPermission]
    pagination_class = StandardPageNumberPagination
    ordering_fields = ["created_at"]

    @action(detail=False, methods=["post"])
    def generate(self, request):
        serializer = ReportGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        export = generate_report(actor=request.user, request=request, **serializer.validated_data)
        return Response(ReportExportSerializer(export).data, status=201)

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        export = self.get_object()
        if not export.file:
            return Response({"detail": "This report has no generated file."}, status=404)
        return FileResponse(export.file.open("rb"), as_attachment=True, filename=export.file.name.split("/")[-1])


class ReportScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = ReportScheduleSerializer
    permission_classes = [ReportPermission]
    pagination_class = StandardPageNumberPagination

    def get_queryset(self):
        queryset = ReportSchedule.objects.all()
        user = self.request.user
        if user.role == RoleChoices.ENGINEER:
            queryset = queryset.filter(created_by=user)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
