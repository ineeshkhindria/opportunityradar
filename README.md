# OpportunityRadar

AI-powered internship aggregator that scrapes real opportunities from LinkedIn, detects young startups, and ranks them using Google Gemini to match your student profile.

## Features

- **Multi-Source Aggregation** — Real internships from LinkedIn (69+ live listings)
- **AI-Powered Matching** — Google Gemini ranks every opportunity with a personalized score and explanation based on your skills, year, branch, and preferences
- **Young Startup Detection** — Auto-identifies startups and early-stage companies
- **Weekly Digest** — Top matches delivered to your inbox (SendGrid configurable)
- **Application Pipeline** — Track each application: saved → applied → interview → offered
- **Custom Profile** — Skills, domains, locations, work mode — all used for matching

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0 (async) |
| Database | PostgreSQL 16 (asyncpg) |
| LLM | Google Gemini 2.5 Flash (free tier, no credit card) |
| Auth | JWT (bcrypt + python-jose) |
| Task Queue | Celery + Redis |
| Scraping | httpx, Playwright, BeautifulSoup4 |
| CI | GitHub Actions (daily scraping) |

## Architecture

```
                    ┌─────────────┐
                    │   Vercel    │  ← Frontend (React) + API CRUD
                    │ (serverless)│     (auth, listings, applications)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Render /   │  ← Backend workers (Celery + Redis)
                    │  Railway    │     (scraping, digest, background jobs)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Supabase   │  ← PostgreSQL database
                    └─────────────┘
```

**Important:** Vercel is serverless (10s max duration). Long-running background jobs (scraping, email digests) run on Render/Railway via Celery + Redis, or as GitHub Actions cron jobs.

## Quick Start (Local)

```bash
# 1. Start Postgres + Redis
docker compose up -d db redis

# 2. Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit with your config
uvicorn app.main:app --reload

# 3. Frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — register, set up your profile, and start matching.

### Scrape Real Data

```bash
curl -X POST http://localhost:8000/api/admin/scrape \
  -H "Authorization: Bearer <your_jwt_token>"
```

### Run Tests

```bash
cd backend
pip install pytest pytest-asyncio httpx
python -m pytest tests/ -v
```

## Deployment

### Option 1: Render (Recommended, no credit card)

- **Web Service:** Deploy `backend/` as a FastAPI web service
- **Cron Job:** Replace Celery beat with GitHub Actions (`.github/workflows/scrape.yml`)
- **Postgres + Redis:** Use Render's free managed Postgres and Redis

### Option 2: Vercel (Frontend + CRUD API only)

See `vercel.json`. Background jobs (scraping, digests) must run elsewhere.

### Option 3: Oracle Cloud Free Tier

Permanent free VM (4 cores, 24 GB RAM ARM). Run the full Docker Compose stack.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in |
| GET | `/api/auth/me` | Yes | Current user |
| PUT | `/api/profile` | Yes | Update profile |
| GET | `/api/opportunities` | Yes | List with filters |
| GET | `/api/opportunities/match` | Yes | AI-ranked matches |
| POST | `/api/applications` | Yes | Save opportunity |
| PATCH | `/api/applications/{id}` | Yes | Update status |
| POST | `/api/admin/scrape` | Yes | Trigger scrapers |

## License

MIT
