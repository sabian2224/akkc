#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# AKKC – deploy / update helper for the Hostinger VPS.
# Run from the project directory on the server (e.g. /opt/apps/akkc).
#
#   ./deploy.sh           Pull latest code, rebuild the image, restart.
#   ./deploy.sh --no-pull  Rebuild & restart without git pull (local changes).
#   ./deploy.sh logs       Follow the app logs.
#   ./deploy.sh status     Show container status & health.
#   ./deploy.sh down       Stop and remove the app container.
# ---------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")"

# Pick `docker compose` (v2) or `docker-compose` (v1), whichever exists.
if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
else
  DC="docker-compose"
fi

cmd="${1:-deploy}"

case "$cmd" in
  logs)   exec $DC logs -f --tail=100 ;;
  status) $DC ps; echo; docker inspect --format '{{.State.Health.Status}}' akkc-app 2>/dev/null || true; exit 0 ;;
  down)   exec $DC down ;;
esac

# Guard: refuse to run without a real .env present.
if [ ! -f .env ]; then
  echo "ERROR: .env not found. Copy .env.example to .env and fill in the secrets first." >&2
  exit 1
fi

# Ensure the shared NPM network exists (idempotent).
docker network inspect npm_network >/dev/null 2>&1 || docker network create npm_network

if [ "$cmd" != "--no-pull" ]; then
  echo ">> Pulling latest code..."
  git pull --ff-only
fi

echo ">> Building image & restarting (zero downtime where possible)..."
$DC up -d --build

echo ">> Pruning dangling images..."
docker image prune -f >/dev/null 2>&1 || true

echo ">> Status:"
$DC ps
echo
echo "Done. Follow logs with: ./deploy.sh logs"
