# Employee Platform Frontend

React + Vite shell for the internal employee platform. The actual UI has not been implemented yet.

## Scripts
- `npm install` – install JS dependencies.
- `npm run dev` – starts Vite alongside the Node.js backend.

## AI Services (FastAPI)
- Location: `services/ai-agents`
- Start API: `uv run --project services/ai-agents uvicorn app.main:app --reload --port ${AI_PORT:-9000}`
- The Node.js backend proxies AI requests from `/api/ai/*` to `AI_API_BASE_URL`.

Configure environment variables via `.env` (copy from `.env.example`).
