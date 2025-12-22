#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$(cd "$FRONTEND_DIR/../api/server" && pwd)"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to start the Node.js backend." >&2
  exit 1
fi

exec npm --prefix "$BACKEND_DIR" run dev
