from rest_framework.routers import DefaultRouter

from equipment.views import EquipmentViewSet

router = DefaultRouter()
router.register("equipment", EquipmentViewSet, basename="equipment")

urlpatterns = router.urls
