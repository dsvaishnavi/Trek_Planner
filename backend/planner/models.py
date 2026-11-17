"""
Trip / itinerary models — core of the AI Travel Planner.
"""
from django.conf import settings
from django.db import models


class Destination(models.Model):
    """Catalog of travel destinations used across planner & recommendations."""

    name = models.CharField(max_length=200)
    country = models.CharField(max_length=100, default="India")
    state = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    category = models.CharField(max_length=50, blank=True)  # adventure, beach, nature...
    tags = models.JSONField(default=list, blank=True)
    average_budget_per_day = models.DecimalField(max_digits=10, decimal_places=2, default=3000)
    best_season = models.CharField(max_length=100, blank=True)
    rating = models.FloatField(default=4.5)
    is_trending = models.BooleanField(default=False)
    is_popular = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-rating", "name"]

    def __str__(self):
        return f"{self.name}, {self.country}"


class Trip(models.Model):
    """A generated or manually saved trip plan."""

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("planned", "Planned"),
        ("ongoing", "Ongoing"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]
    HOTEL_CATEGORIES = [
        ("budget", "Budget"),
        ("standard", "Standard"),
        ("premium", "Premium"),
        ("luxury", "Luxury"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="trips")
    title = models.CharField(max_length=255)
    destination = models.CharField(max_length=200)
    starting_location = models.CharField(max_length=200, blank=True)
    days = models.PositiveIntegerField(default=3)
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    travelers = models.PositiveIntegerField(default=1)
    hotel_category = models.CharField(max_length=20, choices=HOTEL_CATEGORIES, default="standard")
    transportation = models.CharField(max_length=50, blank=True)
    interests = models.JSONField(default=list, blank=True)
    travel_type = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="planned")
    itinerary = models.JSONField(default=dict, blank=True)
    attractions = models.JSONField(default=list, blank=True)
    restaurants = models.JSONField(default=list, blank=True)
    hotels = models.JSONField(default=list, blank=True)
    nearby_places = models.JSONField(default=list, blank=True)
    travel_tips = models.JSONField(default=list, blank=True)
    packing_checklist = models.JSONField(default=list, blank=True)
    best_transport = models.CharField(max_length=200, blank=True)
    safety_advice = models.JSONField(default=list, blank=True)
    budget_breakdown = models.JSONField(default=dict, blank=True)
    ai_summary = models.TextField(blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_saved_offline = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.destination})"


class TripPhoto(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="photos")
    image = models.ImageField(upload_to="trips/")
    caption = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=200, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)


class Expense(models.Model):
    CATEGORY_CHOICES = [
        ("hotel", "Hotel"),
        ("food", "Food"),
        ("transport", "Transport"),
        ("activity", "Activity"),
        ("shopping", "Shopping"),
        ("other", "Other"),
    ]
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="expenses")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.category}: {self.amount}"
