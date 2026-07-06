import django_filters

from sites.models import Site


class SiteFilterSet(django_filters.FilterSet):
    is_active = django_filters.BooleanFilter(field_name="is_active")
    country = django_filters.CharFilter(field_name="country", lookup_expr="iexact")

    class Meta:
        model = Site
        fields = ["is_active", "country"]
