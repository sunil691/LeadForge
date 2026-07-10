# LeadForge Frontend

Next.js 14 (App Router) + TypeScript + Tailwind + Framer Motion dashboard for the LeadForge FastAPI backend.

## What's here

- `/login`, `/register` — auth pages
- `/dashboard` — leads table with add / advance status / mark lost / delete
- Design: dark "forge" theme — leads are visually "hot" (new), "cooling" (contacted), "set" (converted), or "cold" (lost)

## Setup

```bash
npm install
cp .env.local.example .env.local
# edit .env.local if your backend isn't on localhost:8000
npm run dev
```

Opens on http://localhost:3000

## IMPORTANT — backend needs one fix first

Your FastAPI backend (`app/main.py`) currently has no CORS middleware, so the browser will block every request from this frontend with a CORS error. Add this before `app.include_router(lead_router)`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # add your deployed frontend URL too
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Without this, login/register/leads calls will fail silently in the browser console with a CORS policy error, even though the backend itself is working fine.

## Known gaps in the current backend (for your awareness)

- `app/services/scraper.py` is empty — there's no actual scraping logic yet, so leads must be added manually via this UI or the API until that's built.
- `app/auth/utils.py` is empty — currently unused, but worth cleaning up or removing if nothing imports it.
- `GET /leads/` has no auth requirement, so anyone with the API URL can read all leads. Worth adding `Depends(get_current_user)` there too before this goes live for real customers.
