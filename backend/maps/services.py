"""Nearby places — Google Places when keyed, else curated mocks."""
from __future__ import annotations

import logging
from typing import Any

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

TYPE_MAP = {
    "hotels": "lodging",
    "restaurants": "restaurant",
    "hospitals": "hospital",
    "petrol": "gas_station",
    "attractions": "tourist_attraction",
    "bus": "bus_station",
    "railway": "train_station",
    "airports": "airport",
}

MOCK_POIS: dict[str, list[dict[str, Any]]] = {
    "hotels": [
        {"name": "Ocean Pearl Inn", "rating": 4.5, "price": 4200, "distance_km": 1.2, "image_url": ""},
        {"name": "City Central Stay", "rating": 4.2, "price": 2800, "distance_km": 0.8, "image_url": ""},
    ],
    "restaurants": [
        {"name": "Spice Route", "rating": 4.6, "price": 800, "distance_km": 0.5, "image_url": ""},
        {"name": "Lakeview Café", "rating": 4.4, "price": 1200, "distance_km": 1.5, "image_url": ""},
    ],
    "hospitals": [
        {"name": "City Care Hospital", "rating": 4.1, "price": None, "distance_km": 2.0, "image_url": ""},
    ],
    "petrol": [
        {"name": "HP Petrol Pump", "rating": 4.0, "price": None, "distance_km": 0.9, "image_url": ""},
    ],
    "attractions": [
        {"name": "Heritage Fort", "rating": 4.8, "price": 200, "distance_km": 3.2, "image_url": ""},
        {"name": "Sunset Point", "rating": 4.7, "price": 0, "distance_km": 4.1, "image_url": ""},
    ],
    "bus": [{"name": "Central Bus Stand", "rating": 3.9, "price": None, "distance_km": 1.8, "image_url": ""}],
    "railway": [{"name": "Junction Railway Station", "rating": 4.0, "price": None, "distance_km": 2.5, "image_url": ""}],
    "airports": [{"name": "International Airport", "rating": 4.3, "price": None, "distance_km": 18.0, "image_url": ""}],
}


def nearby_places(lat: float, lng: float, place_type: str = "attractions") -> list[dict]:
    place_type = place_type if place_type in MOCK_POIS else "attractions"
    api_key = getattr(settings, "GOOGLE_MAPS_API_KEY", "") or ""

    if api_key:
        try:
            gtype = TYPE_MAP.get(place_type, "tourist_attraction")
            r = requests.get(
                "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
                params={
                    "location": f"{lat},{lng}",
                    "radius": 5000,
                    "type": gtype,
                    "key": api_key,
                },
                timeout=8,
            )
            r.raise_for_status()
            results = []
            for i, p in enumerate(r.json().get("results", [])[:10]):
                loc = p.get("geometry", {}).get("location", {})
                results.append(
                    {
                        "name": p.get("name"),
                        "rating": p.get("rating"),
                        "price": None,
                        "distance_km": round(0.5 + i * 0.4, 1),
                        "latitude": loc.get("lat"),
                        "longitude": loc.get("lng"),
                        "image_url": "",
                        "vicinity": p.get("vicinity", ""),
                        "source": "google",
                    }
                )
            if results:
                return results
        except Exception as exc:
            logger.warning("Google Places failed: %s", exc)

    # Offset mock markers around user location
    out = []
    for i, item in enumerate(MOCK_POIS[place_type]):
        out.append(
            {
                **item,
                "latitude": lat + 0.01 * (i + 1) * (1 if i % 2 == 0 else -1),
                "longitude": lng + 0.012 * (i + 1) * (1 if i % 3 else -1),
                "directions_url": f"https://www.google.com/maps/dir/?api=1&destination={lat},{lng}",
                "source": "mock",
            }
        )
    return out
