from rest_framework import permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ml_models.recommender import recommend
from planner.models import Trip

from .models import RecommendationLog


class RecommendRequestSerializer(serializers.Serializer):
    budget = serializers.CharField(required=False, allow_blank=True, default="")
    age = serializers.IntegerField(required=False, allow_null=True)
    travel_style = serializers.CharField(required=False, allow_blank=True, default="")
    interests = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    preferred_weather = serializers.CharField(required=False, allow_blank=True, default="")
    preferred_transport = serializers.CharField(required=False, allow_blank=True, default="")


class RecommendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ser = RecommendRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = request.user
        profile = {
            "budget_range": ser.validated_data.get("budget") or user.budget_range,
            "age": ser.validated_data.get("age") or user.age,
            "travel_style": ser.validated_data.get("travel_style") or user.travel_style,
            "interests": ser.validated_data.get("interests") or user.interests or [],
            "preferred_weather": ser.validated_data.get("preferred_weather") or user.preferred_weather,
            "preferred_transport": ser.validated_data.get("preferred_transport") or user.preferred_transport,
        }
        past = list(
            Trip.objects.filter(user=user).values("destination", "interests", "travel_type", "budget")[:20]
        )
        for p in past:
            p["budget"] = float(p["budget"] or 0)

        results = recommend(profile, past)
        RecommendationLog.objects.create(user=user, input_data=profile, results=results)
        return Response(results, status=status.HTTP_200_OK)
