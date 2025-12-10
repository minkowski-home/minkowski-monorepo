#!/usr/bin/env bash
# Boots the Design Your Space FastAPI backend with sensible defaults.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

export API_PORT="${API_PORT:-8001}"
export DATABASE_URL="${DATABASE_URL:-sqlite:///./design-your-space.db}"
export ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-http://localhost:5174}"

cd "$BACKEND_DIR"
if [ -f .venv/bin/activate ]; then
  source .venv/bin/activate
fi
python -m pip install -r requirements.txt >/dev/null 2>&1 || true
exec uvicorn app.main:app --reload --port "$API_PORT"
