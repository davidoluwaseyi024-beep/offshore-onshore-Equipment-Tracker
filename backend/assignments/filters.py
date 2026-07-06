import django_filters

from assignments.models import Assignment


class AssignmentFilterSet(django_filters.FilterSet):
    equipment = django_filters.NumberFilter(field_name="equipment_id")
    assigned_to = django_filters.NumberFilter(field_name="assigned_to_id")
    active = django_filters.BooleanFilter(field_name="returned_at", lookup_expr="isnull")

    class Meta:
        model = Assignment
        fields = ["equipment", "assigned_to", "active"]
