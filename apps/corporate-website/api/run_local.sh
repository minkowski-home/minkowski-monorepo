#!/usr/bin/env bash
# Helper script to launch the marketing FastAPI backend from the repo root.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

export API_PORT="${API_PORT:-8000}"
export MONGODB_URI="${MONGODB_URI:-mongodb://127.0.0.1:27017}"
export MONGODB_DB="${MONGODB_DB:-minkowski_corporate}"
export ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-http://localhost:5173}"

if ! command -v uv >/dev/null 2>&1; then
  echo "uv is required to run the backend. Install it from https://github.com/astral-sh/uv." >&2
  exit 1
fi

cd "$BACKEND_DIR"
uv sync --frozen >/dev/null
exec uv run uvicorn app.main:app --reload --port "$API_PORT"
