#!/usr/bin/env bash
set -euo pipefail

# Reproduce Netlify-like dependency install in a clean Linux Node 22 environment.
docker run --rm \
  -v "$PWD":/app \
  -w /app \
  node:22.22.2-bookworm \
  bash -lc '
    node -v
    npm -v
    npm config set registry https://registry.npmjs.org/
    npm ci --prefer-online --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
  '
