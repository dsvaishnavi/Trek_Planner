from django.urls import path

from .views import JourneyOverviewView

urlpatterns = [
    path("", JourneyOverviewView.as_view(), name="journey"),
]
