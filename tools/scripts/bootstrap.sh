#!/usr/bin/env bash
# Installs dependencies for frontend + backend services.
set -euo pipefail

pushd apps/design-your-space/frontend >/dev/null
npm install
popd >/dev/null

pushd apps/design-your-space/api/backend >/dev/null
pip install -r requirements.txt
popd >/dev/null
