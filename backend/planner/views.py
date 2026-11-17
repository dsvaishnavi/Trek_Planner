from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Notification
from gamification.services import award_badges_for_trip

from .models import Destination, Expense, Trip
from .serializers import (
    DestinationSerializer,
    ExpenseSerializer,
    GeneratePlanSerializer,
    TripSerializer,
)
from .services import generate_trip_plan


class DestinationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer
    permission_classes = [permissions.AllowAny]
    search_fields = ["name", "country", "state", "category"]
    filterset_fields = ["category", "is_trending", "is_popular", "country"]


class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user).prefetch_related("expenses", "photos")

    def perform_create(self, serializer):
        trip = serializer.save(user=self.request.user)
        award_badges_for_trip(self.request.user, trip)
        self.request.user.xp_points += 50
        self.request.user.travel_level = 1 + self.request.user.xp_points // 200
        self.request.user.save(update_fields=["xp_points", "travel_level"])


class GeneratePlanAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = GeneratePlanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        plan = generate_trip_plan(data)

        trip = None
        if data.get("save_trip", True):
            trip = Trip.objects.create(
                user=request.user,
                title=plan.get("title", f"{data['destination']} Trip"),
                destination=data["destination"],
                starting_location=data.get("starting_location", ""),
                days=data["days"],
                budget=data["budget"],
                estimated_cost=plan.get("estimated_cost", 0),
                travelers=data["travelers"],
                hotel_category=data["hotel_category"],
                transportation=data.get("transportation", ""),
                interests=data.get("interests", []),
                travel_type=data.get("travel_type", ""),
                itinerary=plan.get("itinerary", {}),
                attractions=plan.get("attractions", []),
                restaurants=plan.get("restaurants", []),
                hotels=plan.get("hotels", []),
                nearby_places=plan.get("nearby_places", []),
                travel_tips=plan.get("travel_tips", []),
                packing_checklist=plan.get("packing_checklist", []),
                best_transport=plan.get("best_transport", ""),
                safety_advice=plan.get("safety_advice", []),
                budget_breakdown=plan.get("budget_breakdown", {}),
                ai_summary=plan.get("ai_summary", ""),
                status="planned",
            )
            award_badges_for_trip(request.user, trip)
            request.user.xp_points += 100
            request.user.travel_level = 1 + request.user.xp_points // 200
            request.user.save(update_fields=["xp_points", "travel_level"])
            Notification.objects.create(
                user=request.user,
                title="Trip plan ready!",
                message=f"Your AI plan for {data['destination']} is saved.",
                link="/journey",
            )

        return Response(
            {
                "plan": plan,
                "trip": TripSerializer(trip, context={"request": request}).data if trip else None,
            },
            status=status.HTTP_201_CREATED if trip else status.HTTP_200_OK,
        )


class ExpenseCreateView(generics.CreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        trip_id = self.kwargs["trip_id"]
        trip = Trip.objects.get(pk=trip_id, user=self.request.user)
        serializer.save(trip=trip)
