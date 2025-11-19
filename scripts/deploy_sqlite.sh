#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   deploy_sqlite.sh <containerName> <image_full> <networkName> <hostPort> <dataVolumeName>
# Example:
#   deploy_sqlite.sh server-app-main server:main-abc123 net-main 3000 server-dev-data-main

if [ "$#" -ne 5 ]; then
  echo "Usage: $0 <containerName> <image_full> <networkName> <hostPort> <dataVolumeName>" >&2
  exit 1
fi

containerName="$1"
image_full="$2"
networkName="$3"
hostPort="$4"
dataVolumeName="$5"

# Ensure network exists
docker network inspect "$networkName" >/dev/null 2>&1 || docker network create "$networkName"

# Remove existing container if any
docker rm -f "$containerName" || true

# Map app port: if hostPort==0, let Docker choose random host port but still expose 3000
if [ "$hostPort" = "0" ]; then
  PORT_FLAG="-p 3000"
else
  PORT_FLAG="-p ${hostPort}:3000"
fi

# Start application (SQLite datasource)
JWT_SECRET_VAL="${JWT_SECRET:-}"
if [ -z "$JWT_SECRET_VAL" ]; then
  echo "[deploy] ERROR: JWT_SECRET is not set. Provide via CI credentials." >&2
  exit 1
fi
docker run -d \
  --name "$containerName" \
  --restart unless-stopped \
  --network "$networkName" \
  ${PORT_FLAG} \
  -e NODE_ENV=production \
  -e JWT_SECRET \
  -e DATA_SOURCE=file \
  -e DATABASE_URL="file:/app/dev-data/dev.db" \
  -e AUTO_MIGRATE=false \
  -v "${dataVolumeName}:/app/dev-data" \
  "$image_full"

# Verify image matches
docker inspect -f '{{ .Config.Image }}' "$containerName" | grep -q "$image_full" || {
  echo "Container image verification failed" >&2; exit 1; }

# Initialize schema and seed data for SQLite datasource
docker exec "$containerName" sh -lc 'npx prisma db push --skip-generate'
docker exec "$containerName" sh -lc 'node scripts/seed.js'

# Show recent logs for visibility
docker logs --since 5s "$containerName" || true

echo "[deploy] Completed SQLite deployment for container: $containerName"