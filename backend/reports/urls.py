from rest_framework.routers import DefaultRouter

from reports.views import ReportExportViewSet, ReportScheduleViewSet

router = DefaultRouter()
router.register("reports", ReportExportViewSet, basename="report")
router.register("report-schedules", ReportScheduleViewSet, basename="report-schedule")

urlpatterns = router.urls
