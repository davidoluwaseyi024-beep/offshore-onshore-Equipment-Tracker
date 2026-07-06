from rest_framework.routers import DefaultRouter

from maintenance.views import MaintenanceRecordViewSet

router = DefaultRouter()
router.register("maintenance", MaintenanceRecordViewSet, basename="maintenance")

urlpatterns = router.urls
