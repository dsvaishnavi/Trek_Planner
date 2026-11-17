"""TF-IDF + cosine similarity recommender with collaborative-style boosts."""
from __future__ import annotations

from typing import Any

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Curated catalog used when DB is empty or for vector search
CATALOG = [
    {
        "name": "Manali",
        "type": "destination",
        "tags": "mountains adventure trekking camping nature snow",
        "budget": "medium",
        "weather": "cold",
        "category": "mountains",
    },
    {
        "name": "Goa",
        "type": "destination",
        "tags": "beach party food nightlife luxury friends",
        "budget": "medium",
        "weather": "warm",
        "category": "beach",
    },
    {
        "name": "Jaipur",
        "type": "destination",
        "tags": "historical culture shopping family photography",
        "budget": "low",
        "weather": "hot",
        "category": "historical",
    },
    {
        "name": "Kerala Backwaters",
        "type": "destination",
        "tags": "nature luxury couple food photography calm",
        "budget": "high",
        "weather": "humid",
        "category": "nature",
    },
    {
        "name": "Ladakh",
        "type": "destination",
        "tags": "adventure trekking mountains solo roadtrip camping",
        "budget": "high",
        "weather": "cold",
        "category": "adventure",
    },
    {
        "name": "Rishikesh",
        "type": "destination",
        "tags": "adventure camping yoga nature solo trekking",
        "budget": "low",
        "weather": "mild",
        "category": "adventure",
    },
    {
        "name": "Udaipur",
        "type": "destination",
        "tags": "luxury couple historical photography lakes",
        "budget": "high",
        "weather": "hot",
        "category": "historical",
    },
    {
        "name": "Andaman",
        "type": "destination",
        "tags": "beach nature snorkeling luxury couple",
        "budget": "high",
        "weather": "warm",
        "category": "beach",
    },
]

HOTELS = [
    {"name": "Mountain View Resort", "destination": "Manali", "price": 4500, "rating": 4.6, "amenities": ["wifi", "spa"]},
    {"name": "Beachside Boutique", "destination": "Goa", "price": 6200, "rating": 4.7, "amenities": ["pool", "beach"]},
    {"name": "Heritage Haveli", "destination": "Jaipur", "price": 3800, "rating": 4.5, "amenities": ["wifi", "breakfast"]},
    {"name": "Backwater Villa", "destination": "Kerala Backwaters", "price": 8500, "rating": 4.8, "amenities": ["pool", "boat"]},
]

ACTIVITIES = [
    {"name": "River Rafting", "destination": "Rishikesh", "type": "adventure"},
    {"name": "Scuba Diving", "destination": "Andaman", "type": "beach"},
    {"name": "Camel Safari", "destination": "Jaipur", "type": "cultural"},
    {"name": "Houseboat Stay", "destination": "Kerala Backwaters", "type": "luxury"},
    {"name": "Chadar Trek", "destination": "Ladakh", "type": "trekking"},
]

HIDDEN_GEMS = [
    {"name": "Ziro Valley", "region": "Arunachal", "why": "Quiet music & rice fields"},
    {"name": "Gokarna Beaches", "region": "Karnataka", "why": "Calmer than Goa"},
    {"name": "Spiti Villages", "region": "Himachal", "why": "Raw Himalayan culture"},
    {"name": "Majuli Island", "region": "Assam", "why": "World's largest river island"},
]

TREKS = [
    {"name": "Triund Trek", "difficulty": "easy", "region": "Himachal"},
    {"name": "Kedarkantha", "difficulty": "moderate", "region": "Uttarakhand"},
    {"name": "Hampta Pass", "difficulty": "moderate", "region": "Himachal"},
    {"name": "Chadar Trek", "difficulty": "hard", "region": "Ladakh"},
]


def _profile_text(profile: dict[str, Any], past_trips: list[dict] | None = None) -> str:
    parts = []
    for key in ("travel_style", "preferred_weather", "preferred_transport", "budget_range"):
        if profile.get(key):
            parts.append(str(profile[key]))
    interests = profile.get("interests") or []
    parts.extend(interests)
    for t in past_trips or []:
        parts.append(t.get("destination", ""))
        parts.extend(t.get("interests") or [])
    return " ".join(parts) or "nature adventure travel"


def recommend(user_profile: dict[str, Any], past_trips: list[dict] | None = None) -> dict[str, Any]:
    """Content-based recommendations with collaborative boost from past trips."""
    query = _profile_text(user_profile, past_trips)
    docs = [f"{c['name']} {c['tags']} {c['category']} {c['budget']} {c['weather']}" for c in CATALOG]
    vectorizer = TfidfVectorizer(stop_words="english")
    matrix = vectorizer.fit_transform(docs + [query])
    sims = cosine_similarity(matrix[-1], matrix[:-1]).flatten()

    # Collaborative-style boost: destinations visited by similar interest clusters
    past_names = {t.get("destination", "").lower() for t in (past_trips or [])}
    for i, c in enumerate(CATALOG):
        if any(tag in query.lower() for tag in c["tags"].split()):
            sims[i] += 0.15
        if c["name"].lower() in past_names:
            sims[i] -= 0.3  # prefer unseen

    ranked_idx = np.argsort(sims)[::-1]
    destinations = []
    for i in ranked_idx[:6]:
        item = dict(CATALOG[i])
        item["score"] = round(float(sims[i]), 3)
        destinations.append(item)

    top_dest = {d["name"] for d in destinations[:3]}
    hotels = [h for h in HOTELS if h["destination"] in top_dest] or HOTELS[:3]
    activities = [a for a in ACTIVITIES if a["destination"] in top_dest] or ACTIVITIES[:3]
    restaurants = [
        {"name": f"{d} Local Kitchen", "destination": d, "rating": 4.5}
        for d in list(top_dest)[:3]
    ]

    return {
        "destinations": destinations,
        "hotels": hotels,
        "restaurants": restaurants,
        "activities": activities,
        "treks": TREKS[:4],
        "hidden_gems": HIDDEN_GEMS,
        "method": "tfidf_cosine_content_collaborative",
        "query": query,
    }
