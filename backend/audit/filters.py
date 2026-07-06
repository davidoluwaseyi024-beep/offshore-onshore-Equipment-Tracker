import django_filters

from audit.models import AuditLog


class AuditLogFilterSet(django_filters.FilterSet):
    actor = django_filters.NumberFilter(field_name="actor_id")
    action = django_filters.CharFilter(field_name="action")
    content_type = django_filters.CharFilter(field_name="content_type__model")
    created_after = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_before = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="lte")

    class Meta:
        model = AuditLog
        fields = ["actor", "action", "content_type", "created_after", "created_before"]
