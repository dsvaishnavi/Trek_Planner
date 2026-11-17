"""OpenWeatherMap integration with AI-style suggestions."""
from __future__ import annotations

import logging
from datetime import timedelta

import requests
from django.conf import settings
from django.utils import timezone

from .models import WeatherCache

logger = logging.getLogger(__name__)


def _ai_suggestions(weather: dict) -> list[str]:
    tips = []
    temp = weather.get("temperature", 25)
    rain = weather.get("rain_chance", 0)
    wind = weather.get("wind_speed", 0)
    uv = weather.get("uv_index", 5)
    aqi = weather.get("air_quality", {}).get("aqi", 2)

    if rain >= 40:
        tips.append("Carry an umbrella — rain chance is elevated.")
    if temp >= 35:
        tips.append("Hydrate often; avoid midday outdoor treks (12–3pm).")
    elif temp <= 10:
        tips.append("Pack thermal layers; mornings will feel colder than forecast.")
    if wind >= 10:
        tips.append("Windy conditions — secure loose gear on open trails.")
    if uv >= 7:
        tips.append("High UV — use SPF 50+ and sunglasses.")
    if aqi >= 4:
        tips.append("Poor air quality alert — consider a mask for city walks.")
    if 15 <= temp <= 28 and rain < 30:
        tips.append("Best trekking hours: early morning 6–10am.")
    if not tips:
        tips.append("Conditions look favorable — great day to explore outdoors.")
    return tips


def _mock_weather(city: str) -> dict:
    base = {
        "city": city,
        "temperature": 28.5,
        "feels_like": 30.0,
        "humidity": 62,
        "rain_chance": 20,
        "wind_speed": 3.4,
        "uv_index": 6,
        "sunrise": "06:12",
        "sunset": "18:45",
        "description": "Partly cloudy",
        "air_quality": {"aqi": 2, "label": "Fair"},
        "source": "mock",
    }
    base["suggestions"] = _ai_suggestions(base)
    return base


def fetch_weather(city: str) -> dict:
    city = (city or "Mumbai").strip()
    cache = WeatherCache.objects.filter(city__iexact=city).first()
    if cache and cache.fetched_at > timezone.now() - timedelta(minutes=30):
        return cache.data

    api_key = getattr(settings, "OPENWEATHER_API_KEY", "") or ""
    if not api_key:
        data = _mock_weather(city)
        WeatherCache.objects.update_or_create(city=city, defaults={"data": data})
        return data

    try:
        r = requests.get(
            "https://api.openweathermap.org/data/2.5/weather",
            params={"q": city, "appid": api_key, "units": "metric"},
            timeout=8,
        )
        r.raise_for_status()
        raw = r.json()
        data = {
            "city": raw.get("name", city),
            "temperature": raw["main"]["temp"],
            "feels_like": raw["main"]["feels_like"],
            "humidity": raw["main"]["humidity"],
            "rain_chance": raw.get("rain", {}).get("1h", 0) * 10 if raw.get("rain") else 15,
            "wind_speed": raw["wind"]["speed"],
            "uv_index": 5,
            "sunrise": timezone.datetime.fromtimestamp(
                raw["sys"]["sunrise"], tz=timezone.get_current_timezone()
            ).strftime("%H:%M"),
            "sunset": timezone.datetime.fromtimestamp(
                raw["sys"]["sunset"], tz=timezone.get_current_timezone()
            ).strftime("%H:%M"),
            "description": raw["weather"][0]["description"].title(),
            "air_quality": {"aqi": 2, "label": "Fair"},
            "source": "openweather",
        }
        data["suggestions"] = _ai_suggestions(data)
        WeatherCache.objects.update_or_create(city=city, defaults={"data": data})
        return data
    except Exception as exc:
        logger.warning("Weather fetch failed: %s", exc)
        return _mock_weather(city)
