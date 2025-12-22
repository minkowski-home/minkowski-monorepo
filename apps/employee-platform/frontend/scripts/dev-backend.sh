#!/usr/bin/env bash
set -euo pipefail

FRONTEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$FRONTEND_DIR/../api/server"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to start the Node.js backend." >&2
  exit 1
fi

exec npm --prefix "$BACKEND_DIR" run dev
