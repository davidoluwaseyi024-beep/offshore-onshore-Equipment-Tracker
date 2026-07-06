import django_filters

from categories.models import Category


class CategoryFilterSet(django_filters.FilterSet):
    parent = django_filters.NumberFilter(field_name="parent_id")

    class Meta:
        model = Category
        fields = ["parent"]
