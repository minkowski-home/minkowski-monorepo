# Minkowski Monorepo

This repository houses all Minkowski apps, services, shared packages, and infrastructure in a single workspace. Frontends remain Vite-based, every backend is FastAPI, and the data stack is staged to evolve from local Postgres into BigQuery and, eventually, a cloud data lake.

## Layout
- `apps/` – User-facing products (corporate marketing site and 3D planner), each with a React frontend and FastAPI API.
- `services/` – Platform, ingestion, transformations, and analytics services that feed the data stack.
- `packages/` – Shared JS/TS, Python, and asset packages to keep code and media reusable.
- `infra/` – Terraform, Kubernetes overlays, and GitHub automation.
- `observability/` – Dashboards, alerts, and SLO artifacts.
- `docs/` – Product briefs, architecture notes, and runbooks.
- `env/` – Non-secret configuration overlays for local/dev/stage (prod is injected via infra).
- `tests/` – Cross-cutting E2E and contract tests.

## Getting Started
1. Install Node 18+ and Python 3.11+.
2. From each app/service folder, run the existing install commands (e.g., `npm install`, `pip install -r requirements.txt`).
3. Copy the relevant `.env.example` files to `.env` for local dev; secrets stay out of git.

## Notes
- Real datasets stay in managed storage; the `samples/` folder is only for tiny fixtures.
- Shared FastAPI, data utilities, and config presets live under `packages/`.
- CI/CD workflows belong in `.github/workflows/`; infra should manage prod secrets via your secret manager.
