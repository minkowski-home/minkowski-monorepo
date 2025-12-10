# Minkowski Monorepo

This repository houses the currently active Minkowski apps plus the supporting data work that is already in motion. Frontends remain Vite-based, backends are FastAPI, and the data stack is focused on the immediate Shopify/GA4/ads needs.

## Layout
- `apps/` – User-facing products (corporate marketing site and 3D planner), each with a React frontend and FastAPI API.
- `services/` – Active analytics and ingestion services where data work is being scoped.
- `db/` – DDL/migrations for the warehouse surfaces that power Shopify/GA4/ads reporting.
- `env/` – Non-secret configuration overlays for local/dev/stage.
- `data-contracts/` & `schemas/` – Shared definitions that keep apps and services aligned.
- `samples/` – Tiny fixtures used while the real data sources are wired up.

## Getting Started
1. Install Node 18+ and Python 3.11+.
2. From each app/service folder, run the existing install commands (e.g., `npm install`, `pip install -r requirements.txt`).
3. Copy the relevant `.env.example` files to `.env` for local dev; secrets stay out of git.

## Notes
- Real datasets stay in managed storage; the `samples/` folder is only for tiny fixtures.
- Shared FastAPI, data utilities, and config presets live under `packages/`.
- CI/CD workflows belong in `.github/workflows/`; infra should manage prod secrets via your secret manager.
