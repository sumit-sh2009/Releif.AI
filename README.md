<div align="center">

```
 ██████╗ ███████╗██╗     ██╗███████╗███████╗ █████╗ ██╗
 ██╔══██╗██╔════╝██║     ██║██╔════╝██╔════╝██╔══██╗██║
 ██████╔╝█████╗  ██║     ██║█████╗  █████╗  ███████║██║
 ██╔══██╗██╔══╝  ██║     ██║██╔══╝  ██╔══╝  ██╔══██║██║
 ██║  ██║███████╗███████╗██║██║     ███████╗██║  ██║██║
 ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝
```

### When disaster strikes, every second matters.

**ReliefAI** is a full-stack disaster response platform — built so citizens can get help fast, and responders can see the full picture.

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16-000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-AI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Prediction-1c1c1c?style=for-the-badge)](https://langchain-ai.github.io/langgraph/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br />

[Try the demo](#-see-it-in-action) · [Quick start](#-get-running-in-5-minutes) · [Architecture](#-how-it-all-fits-together) · [API](#-api-at-a-glance)

</div>

---

## Why we built this

Disasters don't wait for paperwork. Someone trapped in a flood needs to report it *now*. A coordinator needs to see every open request on one map. A volunteer needs to know where to go.

ReliefAI brings those pieces into **one place**:

> **Citizens** report and track emergencies without logging in.  
> **Ops teams** dispatch volunteers, monitor risk, and run predictions from a live dashboard.  
> **AI** helps with flood forecasting and first-aid guidance when every minute counts.

No silos. No "check three different tools." Just one system that actually talks to itself.

---

## See it in action

Spin it up locally, then open these in your browser:

| What | URL | What you'll see |
|------|-----|-----------------|
| **Landing** | [localhost:3000](http://localhost:3000) | The public face — calm, clear, ready |
| **Get Help** | [localhost:3000/get-help](http://localhost:3000/get-help) | 3-step emergency report wizard |
| **Track a request** | [localhost:3000/tracking?code=RF-7K29X4P1](http://localhost:3000/tracking?code=RF-7K29X4P1) | Live status for a seeded demo request |
| **Ops dashboard** | [localhost:3000/dashboard](http://localhost:3000/dashboard) | Map, triage queue, activity feed |
| **Health check** | [localhost:3000/api/health](http://localhost:3000/api/health) | JSON status for all services |
| **AI Engine docs** | [localhost:8000/docs](http://localhost:8000/docs) | OpenAPI for prediction API |
| **AI Centre** | [localhost:7860](http://localhost:7860) | Disaster chat + first-aid API |

> **Demo tracking code:** `RF-7K29X4P1` — try it after running `./scripts/setup.sh`

---

## Two worlds, one platform

Citizens and responders use different interfaces — on purpose. People in crisis shouldn't need an ops login. Teams on the ground shouldn't wade through a marketing page.

```mermaid
flowchart LR
    subgraph CITIZEN["Citizen portal — no login"]
        direction TB
        c1[Landing]
        c2[Get Help wizard]
        c3[Tracking page]
        c1 --> c2 --> c3
    end

    db[(PostgreSQL)]

    subgraph OPS["Operations console"]
        direction TB
        o1[Dashboard]
        o2[Live map]
        o3[Emergency queue]
        o4[Volunteers]
        o5[AI prediction]
        o1 --> o2 & o3 & o4 & o5
    end

    c2 -->|creates request| db
    db -->|status sync| c3
    o3 -->|manage requests| db
    o4 -->|assign volunteer| db
```

---

## How it all fits together

Three services, one monorepo. The webapp is the hub — everything else plugs in.

```mermaid
flowchart TB
    subgraph WEB["webapp — Next.js 16"]
        direction TB
        pub[Public UI]
        ops[Ops UI]
        api[REST API]
        pub --> api
        ops --> api
    end

    db[(PostgreSQL)]
    engine[ai-engine]
    centre[ai-centre]

    api --> db
    api --> engine
    api --> centre
```

<details>
<summary><strong>Plain-text version (for terminals & copy-paste)</strong></summary>

```
┌─────────────────────────────────────────────────────────────┐
│  webapp (Next.js 16) — http://localhost:3000                │
│  Landing · Get Help · Tracking · Ops Dashboard · Maps       │
│                                                             │
│  /api/emergency-requests  ──►  PostgreSQL (:5432)         │
│  /api/volunteers          ──►  PostgreSQL                   │
│  /api/predictions/run     ──►  AI Engine  (:8000)           │
│  /api/first-aid           ──►  AI Centre  (:7860)           │
└─────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌─────────────────────┐    ┌─────────────────────────┐
│  ai-engine/         │    │  ai-centre/             │
│  LangGraph + FAISS  │    │  FastAPI + Groq API     │
│  Flood prediction   │    │  Disaster chat assistant│
└─────────────────────┘    └─────────────────────────┘
```

</details>

---

## What's inside

<table>
<tr>
<td width="50%" valign="top">

### For people in crisis

- **Get Help** — guided wizard: type, urgency, location, contact
- **Tracking** — look up status with a single code, no account
- **Mobile-friendly** — works when networks are shaky

</td>
<td width="50%" valign="top">

### For response teams

- **Live dashboard** — triage queue, stats, activity feed
- **Map view** — emergencies + volunteers on one canvas
- **Volunteer dispatch** — assign, track, complete missions
- **AI prediction** — flood/disaster risk with LangGraph + RAG

</td>
</tr>
<tr>
<td colspan="2" valign="top">

### Under the hood

- **PostgreSQL + Prisma** — real persistence, not mock JSON files
- **Seed data included** — 6 emergencies, 4 volunteers, demo predictions
- **Graceful fallbacks** — if AI services are down, the app keeps working with mock providers

</td>
</tr>
</table>

---

## Get running in 5 minutes

You'll need **Node 20+**, **Python 3.11+**, and either **Docker** (easiest for Postgres) or a local PostgreSQL 16 install.

### 1 · Clone & one-shot setup

```bash
git clone <your-repo-url> reliefai
cd reliefai
chmod +x scripts/*.sh
./scripts/setup.sh
```

This installs dependencies, copies env templates, starts Postgres, runs migrations, and seeds demo data. Grab a coffee — it does the boring stuff for you.

### 2 · Add your keys (optional but recommended)

```bash
cp .env.example .env
cp webapp/.env.local.example webapp/.env.local   # if present
```

Open `.env` and set:

```env
GROQ_API_KEY=gsk_...   # powers AI prediction + disaster chat
```

No key? The app still runs — AI features fall back to mock responses so you can explore the UI.

### 3 · Start everything

```bash
./scripts/start-all.sh
# or: npm run dev
```

### 4 · Sanity check

```bash
npm run health
# or: curl http://localhost:3000/api/health
```

You should see all services reporting `ok` (or `degraded` if AI keys aren't set — that's fine for local dev).

<details>
<summary><strong>Manual Postgres setup (no Docker)</strong></summary>

```bash
psql -U postgres -c "CREATE USER reliefai WITH PASSWORD 'reliefai';"
psql -U postgres -c "CREATE DATABASE reliefai OWNER reliefai;"
cd webapp && npx prisma db push && npm run db:seed
```

Default connection string:

```
postgresql://reliefai:reliefai@localhost:5432/reliefai
```

> **Heads up:** Prisma reads `webapp/.env`, not `.env.local`. Make sure `DATABASE_URL` is there.

</details>

---

## Project layout

```
reliefai/
├── webapp/                 Next.js 16 — UI + REST API + Prisma
│   ├── prisma/             Schema, seed data
│   └── src/
│       ├── app/(citizen)/  Public routes: get-help, tracking
│       ├── app/(app)/      Ops console: dashboard, map, admin
│       └── components/     Landing, wizard, maps, design system
│
├── ai-engine/              LangGraph flood prediction (FastAPI :8000)
├── ai-centre/              Groq disaster assistant (FastAPI :7860)
├── scripts/                setup.sh · start-all.sh · stop-all.sh
├── docker-compose.yml      Postgres (+ optional full stack)
└── .env.example            Environment template
```

---

## API at a glance

| Endpoint | Method | Does what |
|----------|--------|-----------|
| `/api/emergency-requests` | `GET`, `POST` | List or create emergencies |
| `/api/emergency-requests/track?code=` | `GET` | Citizen lookup by tracking code |
| `/api/emergency-requests/[id]` | `PATCH` | Update status, dispatch |
| `/api/volunteers` | `GET`, `POST` | Volunteer registry |
| `/api/volunteers/[id]/assign` | `POST` | Assign to a request |
| `/api/predictions/run` | `POST` | Run disaster prediction (AI Engine) |
| `/api/first-aid` | `POST` | AI first-aid guidance (AI Centre) |
| `/api/activity` | `GET` | Ops activity feed |
| `/api/health` | `GET` | Ping all services |

---

## Environment variables

| Variable | Where | Default | Notes |
|----------|-------|---------|-------|
| `DATABASE_URL` | webapp | `postgresql://reliefai:reliefai@localhost:5432/reliefai` | Required for persistence |
| `AI_ENGINE_URL` | webapp | `http://localhost:8000` | Prediction engine |
| `AI_CENTRE_URL` | webapp | `http://localhost:7860` | Disaster chat |
| `GROQ_API_KEY` | ai-engine, ai-centre | — | Enables real LLM responses |
| `GOOGLE_API_KEY` | ai-engine | — | Optional embeddings fallback |

---

## Database commands

```bash
cd webapp
npx prisma db push      # apply schema
npm run db:seed         # load demo emergencies + volunteers
npx prisma studio       # browse data visually (optional)
```

---

## Docker

```bash
# Just Postgres (recommended for local dev)
docker compose up -d postgres

# Full stack
docker compose up --build
```

---

## Production build

```bash
cd webapp
npm run build
npm start
```

Set `DATABASE_URL`, `AI_ENGINE_URL`, and `AI_CENTRE_URL` in your deployment environment.

---

## Something broke?

We've hit these too. Here's what usually fixes it:

| Symptom | Likely fix |
|---------|------------|
| `DATABASE_URL` not found | Create `webapp/.env` with your Postgres URL — Prisma ignores `.env.local` |
| Port 3000 / 8000 / 7860 in use | `./scripts/stop-all.sh`, then restart |
| AI Engine shows offline | Add `GROQ_API_KEY` to `.env`, or ignore it — mocks kick in automatically |
| CSS build error after pull | Restart the dev server (Turbopack cache quirk) |
| Empty dashboard | Run `cd webapp && npm run db:seed` |

Still stuck? Open an issue — we'd rather fix the docs than leave you guessing.

---

## Built with

| Layer | Stack |
|-------|-------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, Motion, Leaflet |
| **Backend** | Next.js API routes, Prisma ORM, PostgreSQL 16 |
| **AI Engine** | Python, FastAPI, LangGraph, FAISS, Groq |
| **AI Centre** | Python, FastAPI, Groq (`llama-3.3-70b-versatile`) |

---

## Standing on the shoulders of

ReliefAI started as three projects that deserved to work together:

| Origin | Now lives in | Contribution |
|--------|--------------|--------------|
| **reliefai_v3** | `webapp/` | Landing, citizen flow, ops dashboard |
| **Releif.ai** | `ai-engine/` | LangGraph agentic flood analysis |
| **AI-centre** | `ai-centre/` | Disaster management chat |

---

## License

MIT — see [LICENSE](LICENSE). Use it, fork it, improve it. If ReliefAI helps even one person get help faster, it was worth building.

---

<div align="center">

**Predict. Respond. Recover.**

*Built for the moments when software actually matters.*

</div>
