"""
Custom User model and profile for TrekVerse AI.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extends Django auth user with travel-oriented profile fields."""

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to="profiles/", blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    travel_style = models.CharField(max_length=50, blank=True)
    interests = models.JSONField(default=list, blank=True)
    preferred_weather = models.CharField(max_length=50, blank=True)
    preferred_transport = models.CharField(max_length=50, blank=True)
    budget_range = models.CharField(max_length=50, blank=True)
    favorite_destinations = models.JSONField(default=list, blank=True)
    wishlist = models.JSONField(default=list, blank=True)
    visited_cities = models.JSONField(default=list, blank=True)
    travel_level = models.PositiveIntegerField(default=1)
    xp_points = models.PositiveIntegerField(default=0)
    dark_mode = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email

    @property
    def display_name(self):
        return self.get_full_name() or self.username


class PasswordResetToken(models.Model):
    """One-time token for forgot-password flow."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reset_tokens")
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def __str__(self):
        return f"Reset for {self.user.email}"


class Notification(models.Model):
    """In-app notifications for the navbar bell."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
