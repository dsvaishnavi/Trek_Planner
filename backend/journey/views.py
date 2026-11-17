from django.db.models import Sum
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from gamification.models import UserBadge
from planner.models import Expense, Trip
from planner.serializers import TripSerializer


class JourneyOverviewView(APIView):
    """Timeline, expenses summary, and achievements for the Journey page."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        trips = Trip.objects.filter(user=request.user).prefetch_related("expenses", "photos")
        total_spent = (
            Expense.objects.filter(trip__user=request.user).aggregate(s=Sum("amount"))["s"] or 0
        )
        cities = list(
            {t.destination for t in trips if t.destination}
            | set(request.user.visited_cities or [])
        )
        badges = list(
            UserBadge.objects.filter(user=request.user).select_related("badge").values(
                "badge__name", "badge__slug", "badge__icon", "badge__description", "earned_at"
            )
        )
        return Response(
            {
                "timeline": TripSerializer(trips, many=True, context={"request": request}).data,
                "stats": {
                    "trips_count": trips.count(),
                    "completed": trips.filter(status="completed").count(),
                    "total_spent": float(total_spent),
                    "cities_visited": len(cities),
                    "xp_points": request.user.xp_points,
                    "travel_level": request.user.travel_level,
                },
                "visited_locations": cities,
                "achievements": badges,
            }
        )
