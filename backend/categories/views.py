from categories.filters import CategoryFilterSet
from categories.models import Category
from categories.permissions import CategoryPermission
from categories.serializers import CategorySerializer
from core.viewsets import AuditedModelViewSet


class CategoryViewSet(AuditedModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [CategoryPermission]
    filterset_class = CategoryFilterSet
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    tracked_fields = ["name", "parent", "description"]
