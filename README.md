# TrekVerse AI

Production-ready AI-powered travel planner — **React (Vite) + Django REST Framework**.

Plan trips with Gemini, chat with an AI travel assistant, get ML recommendations & budget forecasts, check weather, explore maps, and track your journey with gamification.

## Quick start

### Backend

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # or cp .env.example .env
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

API: http://localhost:8000/api/v1/  
Docs: http://localhost:8000/api/docs/

### Frontend

```bash
cd frontend
npm install
# ensure .env has VITE_API_URL=http://localhost:8000/api/v1
npm run dev
```

App: http://localhost:5173

### Docker

```bash
docker compose up --build
```

## Environment variables

See `backend/.env.example` and `frontend/.env`.

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | AI Planner + Chatbot (falls back to rich mocks) |
| `OPENWEATHER_API_KEY` | Live weather (mock fallback) |
| `GOOGLE_MAPS_API_KEY` | Nearby places (Leaflet + mock POIs otherwise) |
| `DB_NAME` / `DB_*` | PostgreSQL (SQLite if unset) |

## API map

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/register/`, `/auth/login/`, `/auth/forgot-password/`, `/auth/reset-password/`, `GET/PATCH /auth/profile/`, `/auth/notifications/` |
| Trips | `GET/POST /trips/`, `POST /planner/generate/`, `GET /destinations/` |
| Chat | `/chat/sessions/`, `/chat/sessions/:id/messages/`, `/chat/suggestions/` |
| ML | `POST /recommendations/`, `POST /budget/predict/` |
| Weather / Maps / Hotels | `GET /weather/?city=`, `GET /maps/nearby/`, `GET /hotels/` |
| Journey / XP | `GET /journey/`, `/gamification/badges/`, `/gamification/leaderboard/` |

## Project structure

```
backend/
  travelplanner/     # settings, urls, celery
  accounts/          # JWT auth, profile, notifications
  planner/           # trips, AI itinerary, destinations
  chatbot/           # Gemini chat + history
  recommendation/    # TF-IDF + cosine recommender
  budget/            # RandomForest budget predictor
  weather/ hotels/ maps/ journey/ gamification/
  ml_models/         # sklearn pipelines
frontend/
  src/pages/ components/ context/ services/ styles/
```

## Features

- JWT register / login / forgot password / profile picture
- AI trip planner (Gemini or offline mock)
- Streaming-capable chatbot with markdown & history
- Content + collaborative-style recommendations
- Budget charts (Random Forest)
- OpenWeather + AI packing/trek tips
- Leaflet maps with nearby POIs
- Journey timeline, badges, leaderboard
- Dark mode, glass UI, Framer Motion

## License

MIT
