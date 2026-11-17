"""Award travel badges based on trip interests and completion."""
from __future__ import annotations

from .models import Badge, UserBadge

BADGE_DEFS = [
    ("Mountain Explorer", "mountain-explorer", "Completed a mountain/trek trip", "🏔️", "mountains"),
    ("Beach Lover", "beach-lover", "Planned a beach getaway", "🏖️", "beach"),
    ("Food Explorer", "food-explorer", "Chased culinary experiences", "🍜", "food"),
    ("Solo Traveller", "solo-traveller", "Traveled alone", "🎒", "solo"),
    ("Road Trip Expert", "road-trip-expert", "Hit the open road", "🚗", "roadtrip"),
    ("Camping Master", "camping-master", "Slept under the stars", "⛺", "camping"),
]


def ensure_badges():
    for name, slug, desc, icon, criteria in BADGE_DEFS:
        Badge.objects.get_or_create(
            slug=slug,
            defaults={"name": name, "description": desc, "icon": icon, "criteria": criteria},
        )


def award_badges_for_trip(user, trip) -> list[str]:
    ensure_badges()
    awarded = []
    interests = [i.lower() for i in (trip.interests or [])]
    text = " ".join(interests + [trip.travel_type or "", trip.destination or ""]).lower()
    travelers = trip.travelers or 1

    checks = [
        ("mountain-explorer", any(k in text for k in ("mountain", "trek", "trekking", "himalaya", "ladakh", "manali"))),
        ("beach-lover", any(k in text for k in ("beach", "goa", "andaman", "coast"))),
        ("food-explorer", "food" in text or "culinary" in text),
        ("solo-traveller", travelers == 1 or "solo" in text),
        ("road-trip-expert", any(k in text for k in ("road", "self", "drive"))),
        ("camping-master", "camping" in text or "camp" in text),
    ]
    for slug, ok in checks:
        if not ok:
            continue
        badge = Badge.objects.filter(slug=slug).first()
        if badge:
            _, created = UserBadge.objects.get_or_create(user=user, badge=badge)
            if created:
                awarded.append(badge.name)
                user.xp_points += 75
                user.travel_level = 1 + user.xp_points // 200
                user.save(update_fields=["xp_points", "travel_level"])
    return awarded
