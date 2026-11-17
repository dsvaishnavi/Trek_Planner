from rest_framework import serializers

from .models import Destination, Expense, Trip, TripPhoto


class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = "__all__"


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ("id", "category", "amount", "description", "date")
        read_only_fields = ("id", "date")


class TripPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripPhoto
        fields = ("id", "image", "caption", "location", "uploaded_at")
        read_only_fields = ("id", "uploaded_at")


class TripSerializer(serializers.ModelSerializer):
    expenses = ExpenseSerializer(many=True, read_only=True)
    photos = TripPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = "__all__"
        read_only_fields = ("id", "user", "created_at", "updated_at")


class GeneratePlanSerializer(serializers.Serializer):
    destination = serializers.CharField(max_length=200)
    days = serializers.IntegerField(min_value=1, max_value=30, default=3)
    budget = serializers.DecimalField(max_digits=12, decimal_places=2, default=30000)
    travelers = serializers.IntegerField(min_value=1, max_value=20, default=1)
    starting_location = serializers.CharField(required=False, allow_blank=True, default="")
    hotel_category = serializers.ChoiceField(
        choices=["budget", "standard", "premium", "luxury"], default="standard"
    )
    transportation = serializers.CharField(required=False, allow_blank=True, default="")
    interests = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    travel_type = serializers.CharField(required=False, allow_blank=True, default="")
    save_trip = serializers.BooleanField(default=True)
