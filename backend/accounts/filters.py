import django_filters

from accounts.models import User


class UserFilterSet(django_filters.FilterSet):
    role = django_filters.CharFilter(field_name="role")
    is_active = django_filters.BooleanFilter(field_name="is_active")

    class Meta:
        model = User
        fields = ["role", "is_active"]
