"""Seed destinations, hotels, and badges for TrekVerse AI."""
from django.core.management.base import BaseCommand

from gamification.services import ensure_badges
from hotels.models import Hotel
from planner.models import Destination


DESTINATIONS = [
    {
        "name": "Manali",
        "state": "Himachal Pradesh",
        "category": "mountains",
        "description": "Himalayan town famous for adventure sports and scenic valleys.",
        "image_url": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
        "latitude": 32.2396,
        "longitude": 77.1887,
        "tags": ["adventure", "trekking", "snow"],
        "average_budget_per_day": 3500,
        "best_season": "Oct–Jun",
        "is_popular": True,
        "is_trending": True,
        "rating": 4.7,
    },
    {
        "name": "Goa",
        "state": "Goa",
        "category": "beach",
        "description": "Sun, sand, seafood, and vibrant nightlife on India's west coast.",
        "image_url": "https://images.unsplash.com/photo-1512343879784-a960cd67eb2b?w=800",
        "latitude": 15.2993,
        "longitude": 74.1240,
        "tags": ["beach", "party", "food"],
        "average_budget_per_day": 4000,
        "best_season": "Nov–Feb",
        "is_popular": True,
        "is_trending": True,
        "rating": 4.6,
    },
    {
        "name": "Jaipur",
        "state": "Rajasthan",
        "category": "historical",
        "description": "The Pink City — forts, palaces, and rich Rajasthani culture.",
        "image_url": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800",
        "latitude": 26.9124,
        "longitude": 75.7873,
        "tags": ["historical", "shopping", "culture"],
        "average_budget_per_day": 2800,
        "best_season": "Oct–Mar",
        "is_popular": True,
        "rating": 4.5,
    },
    {
        "name": "Kerala Backwaters",
        "state": "Kerala",
        "category": "nature",
        "description": "Serene houseboats, coconut groves, and Ayurvedic calm.",
        "image_url": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
        "latitude": 9.4981,
        "longitude": 76.3388,
        "tags": ["nature", "luxury", "couple"],
        "average_budget_per_day": 5000,
        "best_season": "Sep–Mar",
        "is_trending": True,
        "rating": 4.8,
    },
    {
        "name": "Ladakh",
        "state": "Ladakh",
        "category": "adventure",
        "description": "High-altitude desert of monasteries, passes, and epic road trips.",
        "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        "latitude": 34.1526,
        "longitude": 77.5771,
        "tags": ["adventure", "trekking", "solo"],
        "average_budget_per_day": 4500,
        "best_season": "Jun–Sep",
        "is_popular": True,
        "is_trending": True,
        "rating": 4.9,
    },
    {
        "name": "Rishikesh",
        "state": "Uttarakhand",
        "category": "adventure",
        "description": "Yoga capital with rafting, camping, and Ganga vibes.",
        "image_url": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
        "latitude": 30.0869,
        "longitude": 78.2676,
        "tags": ["adventure", "camping", "yoga"],
        "average_budget_per_day": 2200,
        "best_season": "Sep–Nov, Mar–Apr",
        "is_trending": True,
        "rating": 4.6,
    },
]

HOTELS = [
    ("Snow Peak Resort", "Manali", 4500, 4.6, ["wifi", "spa", "parking"], 32.24, 77.19),
    ("Beachside Boutique", "Goa", 6200, 4.7, ["pool", "beach", "bar"], 15.49, 73.82),
    ("Heritage Haveli", "Jaipur", 3800, 4.5, ["wifi", "breakfast", "courtyard"], 26.92, 75.79),
    ("Backwater Villa", "Kerala Backwaters", 8500, 4.8, ["pool", "boat", "ayurveda"], 9.50, 76.34),
    ("Altitude Camp", "Ladakh", 5200, 4.4, ["wifi", "heater", "views"], 34.15, 77.58),
    ("River Bank Hostel", "Rishikesh", 1800, 4.3, ["wifi", "cafe", "yoga"], 30.09, 78.27),
]


class Command(BaseCommand):
    help = "Seed TrekVerse demo destinations, hotels, and badges"

    def handle(self, *args, **options):
        for d in DESTINATIONS:
            Destination.objects.update_or_create(name=d["name"], defaults=d)
        self.stdout.write(self.style.SUCCESS(f"Destinations: {Destination.objects.count()}"))

        for name, dest, price, rating, amenities, lat, lng in HOTELS:
            Hotel.objects.update_or_create(
                name=name,
                destination=dest,
                defaults={
                    "price": price,
                    "rating": rating,
                    "amenities": amenities,
                    "latitude": lat,
                    "longitude": lng,
                    "room_types": ["Standard", "Deluxe"],
                    "reviews_count": 120,
                    "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
                    "description": f"Comfortable stay in {dest}.",
                },
            )
        self.stdout.write(self.style.SUCCESS(f"Hotels: {Hotel.objects.count()}"))

        ensure_badges()
        self.stdout.write(self.style.SUCCESS("Badges ensured."))
        self.stdout.write(self.style.SUCCESS("Seed complete."))
