"""Gemini chatbot service with streaming-friendly helpers."""
from __future__ import annotations

import logging
from typing import Generator, Iterable

from django.conf import settings

logger = logging.getLogger(__name__)

SUGGESTED = [
    "What is the best time to visit Goa?",
    "Suggest hidden waterfalls near Pune",
    "Plan a 5-day Kashmir trip",
    "What should I pack for Ladakh?",
    "Best treks in Himachal for beginners?",
    "Budget-friendly hotels in Jaipur under ₹3000?",
]


def suggested_questions() -> list[str]:
    return SUGGESTED


def _mock_reply(user_message: str) -> str:
    lower = user_message.lower()
    if "goa" in lower:
        return (
            "**Best time for Goa:** November to February — pleasant beaches, nightlife, and festivals.\n\n"
            "- Avoid peak monsoon (June–Sept) for swimming.\n"
            "- Try North Goa for nightlife, South Goa for quieter beaches."
        )
    if "kashmir" in lower:
        return (
            "**5-day Kashmir sketch:**\n"
            "1. Srinagar — Dal Lake & Mughal gardens\n"
            "2. Gulmarg — gondola & meadows\n"
            "3. Pahalgam — valleys & rivers\n"
            "4. Sonamarg — glaciers\n"
            "5. Local markets & wazwan feast\n\n"
            "Pack warm layers even in summer evenings."
        )
    if "ladakh" in lower or "pack" in lower:
        return (
            "**Ladakh packing list:** thermal layers, sunscreen SPF 50+, sunglasses, "
            "lip balm, altitude meds, sturdy shoes, power bank, and reusable bottle.\n\n"
            "Acclimatize 24–48h in Leh before high passes."
        )
    if "waterfall" in lower or "pune" in lower:
        return (
            "Hidden waterfalls near Pune: **Thoseghar**, **Bhivpuri**, **Bhor Ghat cascades**, "
            "and **Tamhini**. Visit post-monsoon (Aug–Oct) and check local road conditions."
        )
    return (
        f"I'm **TrekVerse AI**, your travel companion. Regarding “{user_message}”:\n\n"
        "- Share destination, days, and budget for a tailored plan.\n"
        "- Or open the **AI Planner** for a full itinerary.\n"
        "- Tip: add interests like trekking, food, or photography for better suggestions."
    )


def _gemini_reply(messages: list[dict]) -> str | None:
    api_key = getattr(settings, "GEMINI_API_KEY", "") or ""
    if not api_key:
        return None
    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            "gemini-1.5-flash",
            system_instruction=(
                "You are TrekVerse AI, a friendly expert travel assistant. "
                "Use markdown. Be concise, practical, and India-travel aware."
            ),
        )
        history = []
        for m in messages[:-1]:
            role = "user" if m["role"] == "user" else "model"
            history.append({"role": role, "parts": [m["content"]]})
        chat = model.start_chat(history=history)
        response = chat.send_message(messages[-1]["content"])
        return (response.text or "").strip()
    except Exception as exc:
        logger.warning("Gemini chat failed: %s", exc)
        return None


def chat_response(messages: list[dict], stream: bool = False) -> str | Generator[str, None, None]:
    """Return full reply or a generator of text chunks."""
    user_msg = messages[-1]["content"] if messages else ""
    reply = _gemini_reply(messages) or _mock_reply(user_msg)

    if not stream:
        return reply

    def _chunks() -> Generator[str, None, None]:
        words = reply.split(" ")
        buf = []
        for i, w in enumerate(words):
            buf.append(w)
            if (i + 1) % 4 == 0 or i == len(words) - 1:
                yield " ".join(buf) + (" " if i < len(words) - 1 else "")
                buf = []

    return _chunks()
