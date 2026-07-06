from core.viewsets import AuditedModelViewSet
from sites.filters import SiteFilterSet
from sites.models import Site
from sites.permissions import SitePermission
from sites.serializers import SiteSerializer


class SiteViewSet(AuditedModelViewSet):
    queryset = Site.objects.all()
    serializer_class = SiteSerializer
    permission_classes = [SitePermission]
    filterset_class = SiteFilterSet
    search_fields = ["name", "code", "city", "country"]
    ordering_fields = ["name", "code", "created_at"]
    tracked_fields = ["name", "code", "address", "city", "state_region", "country", "is_active"]
