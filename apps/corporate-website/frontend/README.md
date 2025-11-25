# Design Sense Test (Minkowski)

Taste-first screening tool that exercises brand alignment across seven micro-tests:
brand recognition, interiors, palette discrimination, typography pairing, crop &
composition, styling restraint, and micro-copy tone.

## Frontend (React + Vite)

- Requirements: Node.js 18+
- Install dependencies: `npm install`
- Local dev (frontend + API): `npm run dev` (starts Vite and FastAPI together, expects MongoDB)
- Production build: `npm run build`

## Backend (FastAPI + MongoDB)

- Requirements: Python 3.11+, MongoDB instance
- Create a virtualenv inside `backend/` (e.g. `python -m venv .venv && source .venv/bin/activate`)
- Install requirements: `pip install -r backend/requirements.txt`
- Copy `.env.example` → `.env` and set `MONGODB_URI`, optional `ALLOWED_ORIGINS`, and `API_PORT`
- Start API manually (if not using `npm run dev`): `uvicorn app.main:app --reload --port ${API_PORT:-8000}` (run from `backend/`)
- Seed initial test data: `python -m seed.seed_test_items`
- Or seed with MongoDB Shell (after exporting `MONGODB_URI` / `MONGODB_DB`):
  `mongosh --file backend/seed/seed_design_test.js`

The API exposes:

- `GET /health` – availability check
- `GET /api/design-test/questions` – gated question set (7 images per question, no scores)
- `POST /api/design-test/submit` – accept a full attempt payload, compute scoring, persist applicant + attempt, and return the breakdown for the Results screen

## Environment

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | Connection string to MongoDB (defaults to local instance in example) |
| `MONGODB_DB` | Database name, default `minkowski_design_test` |
| `API_PORT` | Port for the FastAPI server (default `8000`) |
| `ALLOWED_ORIGINS` | Comma-separated list of origins allowed by CORS |
| `VITE_API_TARGET` | Frontend dev proxy target for API calls (defaults to http://127.0.0.1:8000) |
