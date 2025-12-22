# Corporate Website API (Node.js)

Node.js + TypeScript backend for the Design Sense Test. It proxies AI routes to the FastAPI service in `services/ai-agents`.

## Setup
- `npm install`
- Copy `.env.example` → `.env`
- `npm run dev`

## Endpoints
- `GET /health`
- `GET /api/design-test/questions`
- `GET /api/design-test/supplemental`
- `POST /api/design-test/submit`
- `GET /api/ai/health`
- `GET /api/ai/agents`
- `POST /api/ai/agents/{agentId}/run`
