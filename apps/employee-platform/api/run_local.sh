#!/usr/bin/env bash
# Helper script to launch the employee platform Node.js backend.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/server"

export API_PORT="${API_PORT:-8002}"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to run the backend." >&2
  exit 1
fi

exec npm --prefix "$BACKEND_DIR" run dev
