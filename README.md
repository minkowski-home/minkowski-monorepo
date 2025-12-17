# Minkowski Monorepo

Internal monorepo for Minkowski apps, APIs, data work, and shared contracts. This repository is intended for company use only.

## Quickstart (local)

Prereqs:
- Node.js 18+ (npm workspaces)
- Python 3.11+ (projects declare `requires-python = ">=3.11"`)
- `uv` (Python dependency management)

If your system Python is older, install a compatible interpreter via `uv python install 3.11`.

Install:
- JS deps (root workspaces): `npm install`
- Python deps (per project): `uv sync --project apps/corporate-website/api/backend`

Run (example: corporate website):
- Backend: `bash apps/corporate-website/api/run_local.sh`
- Frontend: `npm --workspace apps/corporate-website/frontend run dev`

Local dependencies:
- Some APIs expect backing services (e.g., MongoDB for the corporate website backend). Check the app-local README and `.env.example` in that app’s `api/backend/`.

## Repository Layout

| Path | What lives here |
| --- | --- |
| `apps/` | Product and internal apps (frontends + APIs). See `apps/app-manifest.json`. |
| `packages/` | Shared packages and contracts (e.g., `packages/data-contracts/`). |
| `services/` | Background services and ingestion jobs. |
| `data-lake/` | Data lake scratch space and WIP pipelines. |
| `db/` | Warehouse DDL and migrations (`db/migrations/`). |
| `schemas/` | Shared schemas used across apps/services. |
| `env/` | Non-secret config overlays and environment references. |
| `infra/` | Infrastructure scaffolding (placeholders live here until formalized). |
| `samples/` | Small fixtures for local/dev (no real customer data). |

Ownership is enforced via `CODEOWNERS`.

## Tooling

### JavaScript / Frontends
- Package manager: npm (workspace root: `package.json`)
- Task runner: Turborepo (`turbo.json`)
- Common commands:
  - Lint all wired workspaces: `npm run lint`
  - Test all wired workspaces: `npm run test`
  - Build all wired workspaces: `npm run build`

Notes:
- Not every frontend is wired into the root workspace yet; if `npm install` doesn’t cover a folder, run `npm install` inside that app’s `frontend/` directory.

### Python / APIs & Services
- Dependency management: `uv` with `pyproject.toml` where available.
- Common patterns:
  - Install deps: `uv sync --project <path-to-python-project>`
  - Run commands: `uv run --project <path-to-python-project> <command>`

Notes:
- Some older skeletons may still include `requirements.txt`; prefer migrating them to `pyproject.toml`. If you need to run them temporarily, use `uv`-backed tooling instead of `pip` where possible.

## Environments & Secrets

- Global local defaults: `.env.example` (copy to `.env` as needed).
- App overlays: `env/app/local.env.example` (reference values; do not store secrets here).
- Data endpoints reference: `env/data/warehouse.connections.yaml`.

Rules:
- Do not commit secrets. Use the company secret manager for production/staging values.
- Prefer per-app `.env` files colocated with the service (see each app’s `api/backend/.env.example` where present).

## Apps

`apps/app-manifest.json` is the single source of truth for active apps, ports, and entrypoints. Each app may also include an app-local README under `apps/<slug>/`.

## Making Changes

- Add new apps under `apps/<slug>/` (typically `frontend/` + `api/backend/`).
- Update `apps/app-manifest.json` when adding/removing app entrypoints or changing ports.
- If adding a new frontend that should participate in root installs, add it to the root `package.json` workspaces.
