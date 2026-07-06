from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from accounts.models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("email", "username", "role", "is_active", "is_staff")
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("email", "username", "first_name", "last_name")
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Role", {"fields": ("role", "phone_number")}),
    )
