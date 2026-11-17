"""Budget prediction using RandomForestRegressor on synthetic travel data."""
from __future__ import annotations

from functools import lru_cache
from typing import Any

import numpy as np
from sklearn.ensemble import RandomForestRegressor


HOTEL_MAP = {"budget": 1, "standard": 2, "premium": 3, "luxury": 4}
TRANSPORT_MAP = {"bus": 1, "train": 2, "cab": 3, "flight": 4, "self": 2.5}
SEASON_MAP = {"winter": 1.1, "summer": 1.0, "monsoon": 0.9, "shoulder": 0.95}


def _synthetic_dataset(n: int = 800):
    rng = np.random.default_rng(42)
    days = rng.integers(1, 15, n)
    travelers = rng.integers(1, 8, n)
    hotel = rng.integers(1, 5, n)
    transport = rng.choice([1, 2, 2.5, 3, 4], n)
    season = rng.choice([0.9, 0.95, 1.0, 1.1], n)
    activities = rng.integers(0, 8, n)
    dest_cost = rng.uniform(1500, 8000, n)

    hotel_cost = days * hotel * 1800 * travelers * 0.6 * season + rng.normal(0, 200, n)
    food_cost = days * travelers * 800 * season + rng.normal(0, 100, n)
    transport_cost = transport * 2500 * travelers * 0.5 + days * 400 + rng.normal(0, 150, n)
    activity_cost = activities * 1200 * travelers * 0.4 + rng.normal(0, 80, n)
    shopping = days * travelers * 300 + rng.normal(0, 50, n)

    X = np.column_stack([days, travelers, hotel, transport, season, activities, dest_cost])
    y = np.column_stack([hotel_cost, food_cost, transport_cost, activity_cost, shopping])
    return X, np.clip(y, 500, None)


@lru_cache(maxsize=1)
def _get_models():
    X, y = _synthetic_dataset()
    models = []
    for i in range(y.shape[1]):
        m = RandomForestRegressor(n_estimators=80, random_state=42, n_jobs=-1)
        m.fit(X, y[:, i])
        models.append(m)
    return models


def predict_budget(inputs: dict[str, Any]) -> dict[str, float]:
    days = int(inputs.get("days", 3))
    travelers = int(inputs.get("travelers", 2))
    hotel = HOTEL_MAP.get(str(inputs.get("hotel_category", "standard")).lower(), 2)
    transport = TRANSPORT_MAP.get(str(inputs.get("transport", "train")).lower(), 2)
    season = SEASON_MAP.get(str(inputs.get("season", "summer")).lower(), 1.0)
    activities = int(inputs.get("activities", 3))
    dest_cost = float(inputs.get("destination_cost_index", 3500))

    X = np.array([[days, travelers, hotel, transport, season, activities, dest_cost]])
    models = _get_models()
    preds = [float(m.predict(X)[0]) for m in models]
    hotel_c, food_c, transport_c, activity_c, shopping_c = preds
    subtotal = hotel_c + food_c + transport_c + activity_c + shopping_c
    emergency = subtotal * 0.1
    total = subtotal + emergency

    return {
        "hotel": round(hotel_c, 2),
        "food": round(food_c, 2),
        "transport": round(transport_c, 2),
        "activities": round(activity_c, 2),
        "shopping": round(shopping_c, 2),
        "emergency": round(emergency, 2),
        "total": round(total, 2),
        "currency": "INR",
        "model": "RandomForestRegressor",
    }
