from rest_framework import serializers

from .models import RecommendationLog


class RecommendRequestSerializer(serializers.Serializer):
    interests = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    travel_style = serializers.CharField(required=False, allow_blank=True, default="")
    preferred_weather = serializers.CharField(required=False, allow_blank=True, default="")
    budget_range = serializers.CharField(required=False, allow_blank=True, default="")
    favorite_destinations = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )
    past_trips = serializers.ListField(required=False, default=list)


class RecommendationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecommendationLog
        fields = ("id", "input_data", "results", "created_at")
        read_only_fields = fields
