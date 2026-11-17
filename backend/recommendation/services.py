"""
Content-based + collaborative-style recommendations using TF-IDF / cosine similarity.
Falls back to curated seed data; optional FAISS if installed.
"""
from __future__ import annotations

import logging
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)

SEED_DESTINATIONS = [
    {"name": "Manali", "category": "adventure", "tags": ["mountains", "trek", "snow", "nature"], "budget": 3500, "rating": 4.7},
    {"name": "Goa", "category": "beach", "tags": ["beach", "nightlife", "relax", "water sports"], "budget": 4000, "rating": 4.6},
    {"name": "Jaipur", "category": "culture", "tags": ["heritage", "forts", "food", "shopping"], "budget": 3000, "rating": 4.5},
    {"name": "Munnar", "category": "nature", "tags": ["tea", "hills", "wildlife", "relax"], "budget": 2800, "rating": 4.8},
    {"name": "Rishikesh", "category": "adventure", "tags": ["rafting", "yoga", "trek", "spiritual"], "budget": 2500, "rating": 4.6},
    {"name": "Udaipur", "category": "culture", "tags": ["lakes", "palaces", "romance", "heritage"], "budget": 3200, "rating": 4.7},
    {"name": "Ladakh", "category": "adventure", "tags": ["mountains", "trek", "roadtrip", "monastery"], "budget": 5000, "rating": 4.9},
    {"name": "Andaman", "category": "beach", "tags": ["beach", "diving", "islands", "nature"], "budget": 5500, "rating": 4.8},
    {"name": "Coorg", "category": "nature", "tags": ["coffee", "hills", "waterfall", "relax"], "budget": 2700, "rating": 4.5},
    {"name": "Varanasi", "category": "spiritual", "tags": ["spiritual", "culture", "food", "ghat"], "budget": 2200, "rating": 4.4},
    {"name": "Spiti", "category": "adventure", "tags": ["mountains", "trek", "remote", "monastery"], "budget": 4500, "rating": 4.8},
    {"name": "Pondicherry", "category": "beach", "tags": ["beach", "french", "cafe", "relax"], "budget": 3000, "rating": 4.5},
]

SEED_HOTELS = [
    {"name": "Mountain View Lodge", "destination": "Manali", "price": 3200, "rating": 4.4},
    {"name": "Beach Shack Resort", "destination": "Goa", "price": 4500, "rating": 4.5},
    {"name": "Heritage Haveli", "destination": "Jaipur", "price": 3800, "rating": 4.6},
    {"name": "Tea Estate Stay", "destination": "Munnar", "price": 2900, "rating": 4.7},
    {"name": "Riverfront Camp", "destination": "Rishikesh", "price": 2100, "rating": 4.3},
]

SEED_RESTAURANTS = [
    {"name": "Himalayan Kitchen", "destination": "Manali", "cuisine": "Himachali", "price_range": "₹₹"},
    {"name": "Fisherman's Wharf", "destination": "Goa", "cuisine": "Seafood", "price_range": "₹₹₹"},
    {"name": "LMB", "destination": "Jaipur", "cuisine": "Rajasthani", "price_range": "₹₹"},
    {"name": "Rasa Cafe", "destination": "Munnar", "cuisine": "South Indian", "price_range": "₹"},
]

SEED_ACTIVITIES = [
    {"name": "Paragliding", "destination": "Manali", "type": "adventure"},
    {"name": "Scuba Diving", "destination": "Andaman", "type": "water sports"},
    {"name": "Amber Fort Tour", "destination": "Jaipur", "type": "culture"},
    {"name": "Tea Plantation Walk", "destination": "Munnar", "type": "nature"},
    {"name": "White Water Rafting", "destination": "Rishikesh", "type": "adventure"},
]

SEED_TREKS = [
    {"name": "Triund Trek", "destination": "Dharamshala", "difficulty": "easy", "days": 2},
    {"name": "Hampta Pass", "destination": "Manali", "difficulty": "moderate", "days": 4},
    {"name": "Chadar Trek", "destination": "Ladakh", "difficulty": "hard", "days": 8},
    {"name": "Kudremukh", "destination": "Karnataka", "difficulty": "moderate", "days": 2},
]

SEED_HIDDEN = [
    {"name": "Ziro Valley", "state": "Arunachal", "why": "Quiet rice fields and music festival vibes"},
    {"name": "Gokarna", "state": "Karnataka", "why": "Quieter beaches than Goa"},
    {"name": "Majuli", "state": "Assam", "why": "World's largest river island"},
    {"name": "Chopta", "state": "Uttarakhand", "why": "Mini Switzerland of India"},
]


def _profile_text(user_profile: dict, past_trips: list) -> str:
    parts = []
    for key in ("interests", "travel_style", "preferred_weather", "budget_range", "favorite_destinations"):
        val = user_profile.get(key)
        if isinstance(val, list):
            parts.extend([str(v) for v in val])
        elif val:
            parts.append(str(val))
    for t in past_trips or []:
        if isinstance(t, dict):
            parts.append(str(t.get("destination", "")))
            interests = t.get("interests") or []
            parts.extend([str(i) for i in interests])
        else:
            parts.append(str(t))
    return " ".join(parts).lower() or "nature adventure culture"


def recommend(user_profile: dict | None = None, past_trips: list | None = None) -> dict:
    """
    Hybrid recommender: TF-IDF cosine similarity over destination tags +
    simple collaborative boost from past destinations.
    """
    user_profile = user_profile or {}
    past_trips = past_trips or []
    query = _profile_text(user_profile, past_trips)

    docs = []
    for d in SEED_DESTINATIONS:
        docs.append(" ".join([d["name"], d["category"], " ".join(d["tags"])]))

    scores = np.ones(len(SEED_DESTINATIONS))
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        vectorizer = TfidfVectorizer()
        matrix = vectorizer.fit_transform(docs + [query])
        sims = cosine_similarity(matrix[-1], matrix[:-1]).flatten()
        scores = sims

        # Optional FAISS re-rank if available
        try:
            import faiss  # type: ignore

            dense = matrix[:-1].astype(np.float32).toarray()
            # L2-normalize for cosine via inner product
            faiss.normalize_L2(dense)
            index = faiss.IndexFlatIP(dense.shape[1])
            index.add(dense)
            q = matrix[-1].astype(np.float32).toarray()
            faiss.normalize_L2(q)
            D, I = index.search(q, min(8, len(SEED_DESTINATIONS)))
            faiss_scores = np.zeros(len(SEED_DESTINATIONS))
            for rank, idx in enumerate(I[0]):
                if idx >= 0:
                    faiss_scores[idx] = float(D[0][rank])
            scores = 0.6 * scores + 0.4 * faiss_scores
        except ImportError:
            pass
    except Exception as exc:
        logger.warning("sklearn recommender failed, using tag overlap: %s", exc)
        q_tokens = set(query.split())
        scores = np.array(
            [len(q_tokens & set(" ".join(d["tags"] + [d["category"]]).split())) for d in SEED_DESTINATIONS],
            dtype=float,
        )

    # Collaborative-ish boost: past destinations / categories
    past_names = set()
    for t in past_trips:
        if isinstance(t, dict):
            past_names.add(str(t.get("destination", "")).lower())
        else:
            past_names.add(str(t).lower())
    for i, d in enumerate(SEED_DESTINATIONS):
        if d["name"].lower() in past_names:
            scores[i] *= 0.85  # slightly downrank already visited
        # budget affinity
        br = str(user_profile.get("budget_range") or "").lower()
        if "budget" in br and d["budget"] < 3000:
            scores[i] *= 1.1
        if "luxury" in br and d["budget"] > 4000:
            scores[i] *= 1.1

    order = np.argsort(-scores)
    destinations = []
    for idx in order[:8]:
        d = dict(SEED_DESTINATIONS[int(idx)])
        d["score"] = round(float(scores[int(idx)]), 4)
        destinations.append(d)

    top_names = {d["name"] for d in destinations[:4]}
    hotels = [h for h in SEED_HOTELS if h["destination"] in top_names] or SEED_HOTELS[:3]
    restaurants = [r for r in SEED_RESTAURANTS if r["destination"] in top_names] or SEED_RESTAURANTS[:3]
    activities = [a for a in SEED_ACTIVITIES if a["destination"] in top_names] or SEED_ACTIVITIES[:3]
    treks = SEED_TREKS[:4]
    if any("adventure" in (d.get("category") or "") or "trek" in d.get("tags", []) for d in destinations[:3]):
        treks = SEED_TREKS

    return {
        "destinations": destinations,
        "hotels": hotels,
        "restaurants": restaurants,
        "activities": activities,
        "treks": treks,
        "hidden_gems": SEED_HIDDEN,
        "method": "tfidf_cosine_hybrid",
    }
