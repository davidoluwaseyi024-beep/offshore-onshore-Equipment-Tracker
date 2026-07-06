import django_filters

from maintenance.models import MaintenanceRecord


class MaintenanceRecordFilterSet(django_filters.FilterSet):
    equipment = django_filters.NumberFilter(field_name="equipment_id")
    status = django_filters.CharFilter(field_name="status")
    maintenance_type = django_filters.CharFilter(field_name="maintenance_type")
    scheduled_after = django_filters.DateFilter(field_name="scheduled_date", lookup_expr="gte")
    scheduled_before = django_filters.DateFilter(field_name="scheduled_date", lookup_expr="lte")

    class Meta:
        model = MaintenanceRecord
        fields = ["equipment", "status", "maintenance_type", "scheduled_after", "scheduled_before"]
