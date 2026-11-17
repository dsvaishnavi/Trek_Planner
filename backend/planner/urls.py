from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DestinationViewSet, ExpenseCreateView, GeneratePlanAPIView, TripViewSet

router = DefaultRouter()
router.register("destinations", DestinationViewSet, basename="destination")
router.register("trips", TripViewSet, basename="trip")

urlpatterns = [
    path("", include(router.urls)),
    path("planner/generate/", GeneratePlanAPIView.as_view(), name="generate-plan"),
    path("trips/<int:trip_id>/expenses/", ExpenseCreateView.as_view(), name="trip-expenses"),
]
