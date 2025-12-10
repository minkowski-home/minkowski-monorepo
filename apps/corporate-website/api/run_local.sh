#!/usr/bin/env bash
# Helper script to launch the marketing FastAPI backend from the repo root.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

export API_PORT="${API_PORT:-8000}"
export MONGODB_URI="${MONGODB_URI:-mongodb://127.0.0.1:27017}"
export MONGODB_DB="${MONGODB_DB:-minkowski_corporate}" 
export ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-http://localhost:5173}"

cd "$BACKEND_DIR"
if [ -f .venv/bin/activate ]; then
  source .venv/bin/activate
fi

python -m pip install -r requirements.txt >/dev/null 2>&1 || true
exec uvicorn app.main:app --reload --port "$API_PORT"
