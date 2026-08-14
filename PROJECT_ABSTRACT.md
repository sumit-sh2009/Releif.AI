# ReliefAI — Project Abstract

When floods rise or storms tear through a community, the hardest part isn't always the water or the wind. It's the silence on the other end — the moment someone on a roof realizes nobody may know they're there, while coordinators elsewhere stare at scattered messages and maps that don't agree.

We've watched traditional emergency systems buckle under that pressure. Hotlines jam. Social feeds fill with pleas that never reach the right desk. Dispatchers sort through chaos manually, without a shared picture of who's in danger, who's available to help, and what the weather is doing *right now* in that neighborhood.

**ReliefAI is what we built to close that gap.**

It's an open, unified disaster response platform — not three tools duct-taped together, but one system where citizen reports, volunteer dispatch, and AI-assisted risk analysis actually talk to each other.

---

### For people who need help immediately

In a real emergency, nobody has time to create an account or reset a password. ReliefAI's citizen portal is deliberately public. Anyone can report through a guided wizard, answer clear questions about type, urgency, and location, and receive a tracking code like `RF-7K29X4P1`. That code is their connection to the response — they can check anytime whether their request was verified, a volunteer assigned, or status changed. No login. No app download. Just help, then clarity.

We designed it this way because the person filling out that form might be on a dying phone battery, standing in knee-deep water, helping someone who can't navigate complicated interfaces. Software in those moments should get out of the way.

---

### For coordinators who can't afford to guess

Responders get a live operations console: incident queues sorted by severity, an interactive map showing emergencies and volunteer positions, mission assignment and tracking, and an activity feed keeping the team aligned. Everything persists in PostgreSQL — real data, not a demo that resets on refresh. When a citizen submits a report, it lands in the same queue dispatchers are watching.

Citizens and ops teams use *different* interfaces on purpose. People in crisis shouldn't need an ops login. Teams on the ground shouldn't wade through a marketing page to find their tools.

---

### AI that earns its place

We didn't add AI because it sounds impressive. We added it where it saves minutes — sometimes hours — when minutes are everything.

**Prediction engine:** Built with LangGraph and Python, our pipeline pulls live rainfall and wind data from Open-Meteo, calculates location-specific flood risk scores, and searches a FAISS vector database of flood protocols and disaster guidelines. The output is structured, location-aware guidance coordinators can act on — not vague warnings.

**Personal context, not generic scripts:** Standard advice fails when someone's situation has constraints. ReliefAI extracts critical details from what people write — needing a wheelchair, having pets, requiring medical care — and carries that context forward. When a message says *"I'm in a wheelchair and I have two dogs,"* that isn't background noise. It's information that changes what "safe" means.

**High-speed citizen guidance:** Powered by Groq (openai/gpt-oss-120b), the AI Centre delivers instant first-aid and disaster guidance while coordinators run predictions and dispatch volunteers from the dashboard.

---

### Built to survive the storm — literally

Disaster software that goes dark when an API hiccups isn't disaster software. ReliefAI includes fallback mechanisms at every layer. If external AI services go offline, the platform keeps running with deterministic fallbacks — intake, tracking, and dispatch don't stop. The system degrades gracefully instead of failing silently. That was a design requirement from day one: *build something that still works when everything else is breaking.*

---

### How it came together

ReliefAI grew from three efforts unified into one deployable monorepo: a Next.js frontend and ops console, a LangGraph flood analysis engine, and a disaster management AI service — wired with shared REST APIs, Docker Compose for PostgreSQL, setup scripts, and seed data so anyone can spin up a working demo in minutes.

**Stack:** Next.js 16, React 19, Prisma, PostgreSQL, FastAPI, LangGraph, FAISS, Groq, Leaflet.

---

### The goal, stated plainly

We wanted software that works when it matters most — when networks are unreliable, stress is high, and the person on the other end is scared and waiting.

ReliefAI won't replace professional emergency services. But it can shorten the distance between a cry for help and a coordinated response. In those first hours after disaster strikes, that distance is everything.

**Predict. Respond. Recover.**
