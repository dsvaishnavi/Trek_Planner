"""Central API router for TrekVerse AI."""
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("auth/", include("accounts.urls")),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("", include("planner.urls")),
    path("chat/", include("chatbot.urls")),
    path("recommendations/", include("recommendation.urls")),
    path("budget/", include("budget.urls")),
    path("weather/", include("weather.urls")),
    path("hotels/", include("hotels.urls")),
    path("maps/", include("maps.urls")),
    path("journey/", include("journey.urls")),
    path("gamification/", include("gamification.urls")),
]
