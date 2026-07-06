from django.contrib import admin

from sites.models import Site


@admin.register(Site)
class SiteAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "city", "country", "is_active")
    list_filter = ("is_active", "country")
    search_fields = ("code", "name", "city")
