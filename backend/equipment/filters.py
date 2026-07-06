import django_filters

from equipment.models import Equipment


class EquipmentFilterSet(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status")
    site = django_filters.NumberFilter(field_name="site_id")
    category = django_filters.NumberFilter(field_name="category_id")
    assigned_to = django_filters.NumberFilter(field_name="assigned_to_id")
    unassigned = django_filters.BooleanFilter(field_name="assigned_to", lookup_expr="isnull")
    created_after = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_before = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="lte")

    class Meta:
        model = Equipment
        fields = ["status", "site", "category", "assigned_to", "unassigned", "created_after", "created_before"]
