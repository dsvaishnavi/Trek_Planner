from django.urls import path

from .views import AllBadgesView, LeaderboardView, MyBadgesView

urlpatterns = [
    path("badges/", AllBadgesView.as_view(), name="badges"),
    path("badges/me/", MyBadgesView.as_view(), name="my-badges"),
    path("leaderboard/", LeaderboardView.as_view(), name="leaderboard"),
]
