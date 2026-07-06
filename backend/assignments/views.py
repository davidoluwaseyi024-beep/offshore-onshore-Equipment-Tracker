from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from assignments import services
from assignments.filters import AssignmentFilterSet
from assignments.models import Assignment
from assignments.permissions import AssignmentPermission
from assignments.serializers import AssignmentReturnSerializer, AssignmentSerializer
from core.constants import RoleChoices
from core.pagination import StandardPageNumberPagination


class AssignmentViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """
    Create/list/retrieve only — assignments are never edited or hard-deleted
    directly, only created and returned (see the `return` action), which
    keeps the history trail meaningful.
    """

    serializer_class = AssignmentSerializer
    permission_classes = [AssignmentPermission]
    pagination_class = StandardPageNumberPagination
    filterset_class = AssignmentFilterSet
    search_fields = ["equipment__name", "equipment__serial_number", "assigned_to__email"]
    ordering_fields = ["assigned_at", "returned_at"]

    def get_queryset(self):
        queryset = Assignment.objects.select_related("equipment", "assigned_to", "site")
        user = self.request.user
        if user.role == RoleChoices.TECHNICIAN:
            queryset = queryset.filter(assigned_to=user)
        return queryset

    def perform_create(self, serializer):
        services.create_assignment(serializer=serializer, actor=self.request.user, request=self.request)

    @action(detail=True, methods=["post"], url_path="return", url_name="return")
    def return_equipment(self, request, pk=None):
        assignment = self.get_object()
        serializer = AssignmentReturnSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assignment = services.return_assignment(
            assignment=assignment, notes=serializer.validated_data.get("notes", ""), actor=request.user, request=request
        )
        return Response(AssignmentSerializer(assignment).data)
