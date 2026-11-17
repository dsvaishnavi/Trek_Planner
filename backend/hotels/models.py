from django.db import models


class Hotel(models.Model):
    name = models.CharField(max_length=200)
    destination = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    rating = models.FloatField(default=4.0)
    amenities = models.JSONField(default=list, blank=True)
    image_url = models.URLField(blank=True)
    room_types = models.JSONField(default=list, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    reviews_count = models.PositiveIntegerField(default=0)
    distance_km = models.FloatField(default=1.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-rating", "price"]

    def __str__(self):
        return self.name
