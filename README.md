# OpportunityRadar

A smart internship aggregator that scrapes real opportunities from LinkedIn, detects young startups, and ranks them using AI to match your unique student profile.

Built with students in mind — because hunting for internships across 10+ tabs is broken.

## Features

- **Multi-Source Aggregation** — Real internships from LinkedIn (69+ live listings), with Wellfound and Y Combinator sources ready
- **AI-Powered Matching** — Keyword-based ranking engine (with OpenAI/Anthropic LLM support when keys are configured)
- **Young Startup Detection** — Automatically identifies startups and early-stage companies hiring. Filter by "Young Startups Only"
- **Smart Rankings** — Every opportunity gets a personalized match score and explanation based on your skills, year, branch, and preferences
- **Weekly Digest** — Your top matches delivered to your inbox (SendGrid configurable)
- **Application Pipeline** — Track each application from saved → applied → interview → offered
- **Custom Profile** — Skills, domains, locations, work mode, links — all used for matching

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0 (async) |
| Database | PostgreSQL 16 (asyncpg) |
| Auth | JWT (bcrypt + python-jose) |
| Task Queue | Celery + Redis |
| Scraping | httpx, Playwright, BeautifulSoup4 |

## Design

Dark immersive theme with glassmorphism cards, teal/cyan radar aesthetic, and custom UI components:

- **CustomSelect** — Searchable dropdowns with keyboard navigation (replaces native `<select>`)
- **HeroVisual** — Animated radar visualization with orbiting cards, sweep line, and floating particles
- **Glassmorphism** — `backdrop-blur-xl` cards on a dark grid background
- **Glow Effects** — Pulsing accents and subtle gradients throughout

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+
- PostgreSQL 16
- Redis (for Celery)

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit with your database URL
uvicorn app.main:app --reload
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — register, set up your profile, and start matching.

### 3. Scrape Real Data

```bash
# Trigger a scrape of 69+ LinkedIn internships
curl -X POST http://localhost:8000/api/admin/scrape \
  -H "Authorization: Bearer <your_jwt_token>"
```

## Deployment

The project is ready for Vercel + Supabase deployment:

- `vercel.json` — routes `/api/*` to the Python backend, everything else to the React frontend
- `api/asgi.py` — FastAPI entry point for Vercel's ASGI runtime
- `.github/workflows/scrape.yml` — GitHub Actions workflow for automated daily scraping
- `scraper/run.py` — standalone script to run scrapers from CI

### Deploy on Vercel

1. Push to GitHub
2. Import repo into Vercel
3. Set environment variables (see `backend/.env.example`)
4. Deploy — Vercel detects `vercel.json` and builds automatically

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/profile` | Update profile |
| GET | `/api/opportunities` | List with filters |
| GET | `/api/opportunities/match` | AI-ranked matches |
| POST | `/api/applications` | Save opportunity |
| PATCH | `/api/applications/{id}` | Update status |
| POST | `/api/admin/scrape` | Trigger all scrapers |

## License

MIT
