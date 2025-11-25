#!/usr/bin/env bash
set -euo pipefail

if [ -f .env ]; then
  # shellcheck disable=SC1091
  source .env
fi

export MONGODB_URI="${MONGODB_URI:-mongodb://127.0.0.1:27017}"
export MONGODB_DB="${MONGODB_DB:-minkowski_design_test}"
export ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-http://localhost:5173}"
export VITE_API_TARGET="${VITE_API_TARGET:-http://127.0.0.1:8000}"
export PYTHONPATH="${PYTHONPATH:-backend}"

exec uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
