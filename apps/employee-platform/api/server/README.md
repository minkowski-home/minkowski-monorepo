# Employee Platform API (Node.js)

Node.js + TypeScript backend scaffold for the employee platform. It proxies AI routes to the FastAPI service in `services/ai-agents`.

## Setup
- `npm install`
- Copy `.env.example` → `.env`
- `npm run dev`

## Endpoints
- `GET /health`
- `GET /api/ai/health`
- `GET /api/ai/agents`
- `POST /api/ai/agents/{agentId}/run`
