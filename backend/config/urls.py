from django.http import HttpResponse

def health_check(request):
    return HttpResponse("OK")

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("", health_check),
    path("admin/", admin.site.urls),
    path("api/v1/", include("accounts.urls")),
    path("api/v1/", include("audit.urls")),
    path("api/v1/", include("sites.urls")),
    path("api/v1/", include("categories.urls")),
    path("api/v1/", include("equipment.urls")),
    path("api/v1/", include("maintenance.urls")),
    path("api/v1/", include("assignments.urls")),
    path("api/v1/", include("reports.urls")),
    path("api/v1/", include("dashboard.urls")),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
