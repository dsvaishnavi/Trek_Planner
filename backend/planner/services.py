"""AI trip plan generation via Gemini with heuristic fallback."""
from __future__ import annotations

import json
import logging
from typing import Any

from django.conf import settings

logger = logging.getLogger(__name__)


def _mock_plan(data: dict[str, Any]) -> dict[str, Any]:
    """Rich offline itinerary when Gemini is unavailable."""
    destination = data.get("destination", "Goa")
    days = int(data.get("days", 3))
    budget = float(data.get("budget", 30000))
    travelers = int(data.get("travelers", 2))
    interests = data.get("interests") or ["nature", "food"]
    hotel_cat = data.get("hotel_category", "standard")

    per_day = budget / max(days, 1)
    itinerary = {}
    for d in range(1, days + 1):
        itinerary[f"day_{d}"] = {
            "title": f"Day {d} in {destination}",
            "morning": f"Explore local highlights of {destination} — start early for cooler weather.",
            "afternoon": f"Enjoy {interests[0] if interests else 'sightseeing'} activities and local cuisine.",
            "evening": f"Sunset viewpoint + dinner at a recommended restaurant in {destination}.",
        }

    hotel_cost = round(per_day * 0.35 * days, 2)
    food_cost = round(per_day * 0.25 * days, 2)
    transport_cost = round(per_day * 0.2 * days, 2)
    activity_cost = round(per_day * 0.12 * days, 2)
    shopping = round(per_day * 0.05 * days, 2)
    emergency = round(budget * 0.08, 2)

    return {
        "title": f"{days}-Day {destination} Adventure",
        "destination": destination,
        "days": days,
        "travelers": travelers,
        "itinerary": itinerary,
        "attractions": [
            {"name": f"{destination} Old Town", "rating": 4.6, "type": "sightseeing"},
            {"name": f"{destination} Viewpoint", "rating": 4.8, "type": "nature"},
            {"name": f"{destination} Cultural Museum", "rating": 4.4, "type": "historical"},
        ],
        "restaurants": [
            {"name": "Spice Trail Kitchen", "cuisine": "Local", "price_range": "₹₹", "rating": 4.5},
            {"name": "Horizon Café", "cuisine": "Continental", "price_range": "₹₹₹", "rating": 4.3},
            {"name": "Street Food Lane", "cuisine": "Street", "price_range": "₹", "rating": 4.7},
        ],
        "hotels": [
            {
                "name": f"{hotel_cat.title()} Stay {destination}",
                "category": hotel_cat,
                "price_per_night": round(hotel_cost / days, 2),
                "rating": 4.4,
            }
        ],
        "nearby_places": [
            {"name": "Local Market", "distance_km": 2.1},
            {"name": "City Park", "distance_km": 3.5},
            {"name": "Heritage Walk", "distance_km": 1.2},
        ],
        "travel_tips": [
            f"Book {hotel_cat} hotels early for {destination}.",
            "Carry a reusable water bottle and sunscreen.",
            "Keep digital + physical copies of IDs.",
        ],
        "packing_checklist": [
            "Comfortable walking shoes",
            "Light layers / rain jacket",
            "Power bank",
            "First-aid kit",
            "Reusable bottle",
            "Travel adapters",
        ],
        "best_transport": data.get("transportation") or "Mix of train/flight + local cabs",
        "safety_advice": [
            "Share itinerary with a trusted contact.",
            "Avoid isolated areas after dark.",
            "Use registered taxis or ride-hailing apps.",
        ],
        "budget_breakdown": {
            "hotel": hotel_cost,
            "food": food_cost,
            "transport": transport_cost,
            "activities": activity_cost,
            "shopping": shopping,
            "emergency": emergency,
            "total": round(hotel_cost + food_cost + transport_cost + activity_cost + shopping + emergency, 2),
        },
        "estimated_cost": round(hotel_cost + food_cost + transport_cost + activity_cost + shopping + emergency, 2),
        "ai_summary": (
            f"A curated {days}-day plan for {travelers} traveler(s) in {destination}, "
            f"focused on {', '.join(interests)}. Estimated spend ~₹{budget:,.0f}."
        ),
        "source": "mock",
    }


def _gemini_plan(data: dict[str, Any]) -> dict[str, Any] | None:
    api_key = getattr(settings, "GEMINI_API_KEY", "") or ""
    if not api_key:
        return None
    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
You are TrekVerse AI, an expert travel planner. Return ONLY valid JSON (no markdown)
for a trip with these inputs:
{json.dumps(data, default=str)}

JSON schema:
{{
  "title": string,
  "destination": string,
  "days": number,
  "travelers": number,
  "itinerary": {{ "day_1": {{ "title", "morning", "afternoon", "evening" }}, ... }},
  "attractions": [{{ "name", "rating", "type" }}],
  "restaurants": [{{ "name", "cuisine", "price_range", "rating" }}],
  "hotels": [{{ "name", "category", "price_per_night", "rating" }}],
  "nearby_places": [{{ "name", "distance_km" }}],
  "travel_tips": [string],
  "packing_checklist": [string],
  "best_transport": string,
  "safety_advice": [string],
  "budget_breakdown": {{ "hotel", "food", "transport", "activities", "shopping", "emergency", "total" }},
  "estimated_cost": number,
  "ai_summary": string
}}
Currency: INR. Be practical and destination-specific.
"""
        response = model.generate_content(prompt)
        text = (response.text or "").strip()
        if text.startswith("```"):
            text = text.strip("`")
            if text.startswith("json"):
                text = text[4:].strip()
        plan = json.loads(text)
        plan["source"] = "gemini"
        return plan
    except Exception as exc:
        logger.warning("Gemini plan generation failed: %s", exc)
        return None


def generate_trip_plan(data: dict[str, Any]) -> dict[str, Any]:
    """Generate a complete AI trip plan; falls back to mock if Gemini fails."""
    plan = _gemini_plan(data)
    if plan:
        return plan
    return _mock_plan(data)
