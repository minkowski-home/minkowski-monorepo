# Employee Platform Backend

This directory hosts the FastAPI backend for the employee platform. The service mirrors the tooling from `apps/corporate-website/api/backend`, using `uv` for dependency management.

## Next steps
- Implement FastAPI modules under `app/` (e.g., `app/main.py`, `app/routes/`).
- Keep shared settings/environment variables in `.env` (copy from `.env.example`).
- Use `uv sync` to install dependencies and `uv run uvicorn app.main:app --reload` once the app exists.
