#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$(cd "$FRONTEND_DIR/../api/backend" && pwd)"

if [ -f "$FRONTEND_DIR/.env" ]; then
  # shellcheck disable=SC1091
  source "$FRONTEND_DIR/.env"
fi

if ! command -v uv >/dev/null 2>&1; then
  echo "uv is required to start the FastAPI backend. Install it from https://github.com/astral-sh/uv." >&2
  exit 1
fi

export MONGODB_URI="${MONGODB_URI:-mongodb://127.0.0.1:27017}"
export MONGODB_DB="${MONGODB_DB:-minkowski_design_test}"
export ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-http://localhost:5173}"
export VITE_API_TARGET="${VITE_API_TARGET:-http://127.0.0.1:8000}"

exec uv run --project "$BACKEND_DIR" --frozen uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
