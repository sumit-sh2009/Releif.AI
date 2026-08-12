# ReliefAI

**Unified disaster response platform** — connect citizens in crisis with prediction, emergency intake, volunteer dispatch, and AI-assisted first aid.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-AI%20services-009688)](https://fastapi.tiangolo.com/)

---

## Features

| Area | What it does |
|------|----------------|
| **Citizen portal** | Report emergencies (`/get-help`), track requests (`/tracking?code=…`) — no ops login required |
| **Operations console** | Dashboard, live map, emergency queue, volunteer management, AI prediction |
| **AI prediction** | LangGraph flood/disaster risk analysis with RAG (port 8000) |
| **AI first aid** | Ollama-powered emergency guidance (port 7860) |
| **PostgreSQL** | Persistent emergency requests, volunteers, predictions, activity feed |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  webapp (Next.js 16) — http://localhost:3000                     │
│  Landing · Get Help · Tracking · Ops Dashboard · Maps · Admin      │
│                                                                  │
│  /api/emergency-requests  ──►  PostgreSQL (:5432)                │
│  /api/volunteers          ──►  PostgreSQL                        │
│  /api/predictions/run     ──►  AI Engine  (:8000)                │
│  /api/first-aid           ──►  AI Centre  (:7860)                │
│  /api/health              ──►  All services                      │
└──────────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌─────────────────────┐    ┌─────────────────────────┐
│  ai-engine/         │    │  ai-centre/             │
│  LangGraph + FAISS    │    │  Ollama llama3.2        │
│  Groq / Open-Meteo    │    │  Disaster chat + risk   │
│  Flood prediction     │    │  First-aid guidance     │
└─────────────────────┘    └─────────────────────────┘
```

---

## Quick start

### Prerequisites

- **Node.js** 20+
- **Python** 3.11+
- **PostgreSQL** 16 (local or Docker)
- **Ollama** (optional, for AI Centre) — `ollama pull llama3.2`
- **Groq API key** (optional, for AI Engine LLM features)

### 1. Clone & setup

```bash
git clone <your-repo-url> reliefai
cd reliefai
chmod +x scripts/*.sh
./scripts/setup.sh
```

Setup creates a Python venv, installs dependencies, configures env files, starts Postgres (Docker if available), and seeds the database.

### 2. Configure environment

```bash
cp .env.example .env
cp webapp/.env.local.example webapp/.env.local
```

Edit `.env` and add your `GROQ_API_KEY` if using the AI Engine LLM features.

**Default database URL:**

```
postgresql://reliefai:reliefai@localhost:5432/reliefai
```

**Manual Postgres setup** (without Docker):

```bash
psql -U postgres -c "CREATE USER reliefai WITH PASSWORD 'reliefai';"
psql -U postgres -c "CREATE DATABASE reliefai OWNER reliefai;"
cd webapp && npx prisma db push && npm run db:seed
```

### 3. Start all services

```bash
./scripts/start-all.sh
```

Or individually:

```bash
npm run dev          # web + engine + centre (requires setup first)
npm run dev:web      # Next.js only
npm run dev:engine   # AI Engine only
npm run dev:centre   # AI Centre only
```

### 4. Open the app

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Landing page |
| http://localhost:3000/get-help | Emergency report wizard |
| http://localhost:3000/tracking?code=RF-7K29X4P1 | Track a request (seed demo) |
| http://localhost:3000/dashboard | Operations dashboard |
| http://localhost:3000/api/health | Service health JSON |
| http://localhost:8000/docs | AI Engine OpenAPI docs |
| http://localhost:7860 | AI Centre API |

---

## Project structure

```
reliefai/
├── webapp/              Next.js 16 frontend + REST API + Prisma
│   ├── prisma/          Schema, migrations, seed data
│   └── src/
│       ├── app/(citizen)/   Public citizen routes (get-help, tracking)
│       ├── app/(app)/       Operations console routes
│       └── components/      UI, wizard, maps, landing
├── ai-engine/           LangGraph flood prediction (FastAPI)
├── ai-centre/           Ollama disaster AI (FastAPI)
├── scripts/             setup.sh, start-all.sh, stop-all.sh
├── docker-compose.yml   Postgres + all services
└── .env.example         Root environment template
```

---

## Environment variables

| Variable | Service | Default | Description |
|----------|---------|---------|-------------|
| `DATABASE_URL` | webapp | `postgresql://reliefai:reliefai@localhost:5432/reliefai` | PostgreSQL connection |
| `AI_ENGINE_URL` | webapp | `http://localhost:8000` | LangGraph prediction engine |
| `AI_CENTRE_URL` | webapp | `http://localhost:7860` | Ollama disaster AI |
| `GROQ_API_KEY` | ai-engine | — | Groq LLM key (falls back to mock if missing) |
| `GOOGLE_API_KEY` | ai-engine | — | Optional embeddings fallback |
| `OLLAMA_HOST` | ai-centre | `http://localhost:11434` | Ollama server URL |

If AI services are unavailable, the webapp **gracefully falls back** to mock providers.

---

## API reference

| Endpoint | Method | Backend | Purpose |
|----------|--------|---------|---------|
| `/api/emergency-requests` | GET, POST | PostgreSQL | List / create emergencies |
| `/api/emergency-requests/track?code=` | GET | PostgreSQL | Citizen tracking lookup |
| `/api/emergency-requests/[id]` | PATCH | PostgreSQL | Update status / dispatch |
| `/api/volunteers` | GET, POST | PostgreSQL | Volunteer registry |
| `/api/volunteers/[id]/assign` | POST | PostgreSQL | Assign volunteer to request |
| `/api/predictions/run` | POST | AI Engine | Run disaster prediction |
| `/api/first-aid` | POST | AI Centre | AI first-aid guidance |
| `/api/activity` | GET | PostgreSQL | Ops activity feed |
| `/api/health` | GET | All | Service health check |

---

## Database

```bash
cd webapp
npx prisma db push      # Apply schema
npm run db:seed         # Load demo data
npx prisma studio       # Visual browser (optional)
```

**Seed includes:** 6 demo emergencies, 4 volunteers, 1 prediction, activity log entries.

Demo tracking code: **`RF-7K29X4P1`**

---

## Docker (optional)

```bash
# Postgres only
docker compose up -d postgres

# Full stack (AI Centre needs Ollama on host)
docker compose up --build
```

AI Centre in Docker connects to host Ollama via `host.docker.internal:11434`.

---

## Production build

```bash
cd webapp
npm run build
npm start
```

Ensure `DATABASE_URL`, `AI_ENGINE_URL`, and `AI_CENTRE_URL` are set in the deployment environment.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `DATABASE_URL` not found (Prisma) | Create `webapp/.env` with `DATABASE_URL=…` (Prisma does not read `.env.local`) |
| Port 3000/8000/7860 busy | `./scripts/stop-all.sh` then restart |
| Ollama bind error on :11434 | Already running — that's fine |
| AI Engine offline | Add `GROQ_API_KEY` to `.env` or use mock fallback |
| CSS build error (Turbopack) | Restart dev server after pulling latest |

---

## Tech stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, Motion, Leaflet
- **Backend:** Next.js API routes, Prisma ORM, PostgreSQL 16
- **AI Engine:** Python, FastAPI, LangGraph, FAISS, Groq
- **AI Centre:** Python, FastAPI, Ollama (llama3.2)

---

## License

MIT — see [LICENSE](LICENSE).

---

## Acknowledgements

Built by merging three codebases into one deployable system:

- **reliefai_v3** → `webapp/` — landing, citizen flow, ops dashboard
- **Releif.ai** → `ai-engine/` — LangGraph agentic flood analysis
- **AI-centre** → `ai-centre/` — Ollama disaster management chat
