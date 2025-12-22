# AI Agents Service

FastAPI service that exposes shared AI agent endpoints for product apps.

## Requirements
- Python 3.11+
- `uv` CLI

## Setup
- Install dependencies: `uv sync --project services/ai-agents`
- Copy `.env.example` → `.env` inside `services/ai-agents/`
- Run locally: `uv run --project services/ai-agents uvicorn app.main:app --reload --port ${AI_PORT:-9000}`

## Endpoints
- `GET /health`
- `GET /agents`
- `POST /agents/{agent_id}/run`
