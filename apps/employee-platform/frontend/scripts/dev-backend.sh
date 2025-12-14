#!/usr/bin/env bash
set -euo pipefail

FRONTEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$FRONTEND_DIR/../api"

exec "$API_DIR/run_local.sh"
