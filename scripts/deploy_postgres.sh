#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   deploy_postgres.sh <containerName> <image_full> <dbContainerName> <dbVolumeName> <networkName> <hostPort> <dbHostPort>
# Example:
#   deploy_postgres.sh server-app-main server:main-abc123 postgres-db-main postgres-data-main net-main 3000 5432

if [ "$#" -ne 7 ]; then
  echo "Usage: $0 <containerName> <image_full> <dbContainerName> <dbVolumeName> <networkName> <hostPort> <dbHostPort>" >&2
  exit 1
fi

containerName="$1"
image_full="$2"
dbContainerName="$3"
dbVolumeName="$4"
networkName="$5"
hostPort="$6"
dbHostPort="$7"

# Ensure network exists
docker network inspect "$networkName" >/dev/null 2>&1 || docker network create "$networkName"

# Remove existing containers if any
docker rm -f "$containerName" || true
docker rm -f "$dbContainerName" || true

# Map DB port if required
if [ "$dbHostPort" = "0" ]; then
  DB_PORT_FLAG=""
else
  DB_PORT_FLAG="-p ${dbHostPort}:5432"
fi

# Start Postgres
docker run -d \
  --name "$dbContainerName" \
  --restart unless-stopped \
  --network "$networkName" \
  ${DB_PORT_FLAG} \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=appdb \
  -v "${dbVolumeName}:/var/lib/postgresql/data" \
  postgres:15

# Wait until Postgres is ready
set -x
for i in $(seq 1 30); do
  if docker exec "$dbContainerName" pg_isready -U postgres -d postgres; then
    echo "[deploy] Postgres accepting connections"; break; fi
  sleep 2
done
set +x

# Ensure target database exists (idempotent)
if ! docker exec "$dbContainerName" sh -lc "psql -U postgres -tAc \"SELECT 1 FROM pg_database WHERE datname='appdb'\" | grep -q 1"; then
  echo "[deploy] Creating database 'appdb'"
  docker exec "$dbContainerName" sh -lc "createdb -U postgres appdb"
else
  echo "[deploy] Database 'appdb' already exists"
fi

# Map app port: if hostPort==0, let Docker choose random host port but still expose 3000
if [ "$hostPort" = "0" ]; then
  PORT_FLAG="-p 3000"
else
  PORT_FLAG="-p ${hostPort}:3000"
fi

# Start application
docker run -d \
  --name "$containerName" \
  --restart unless-stopped \
  --network "$networkName" \
  ${PORT_FLAG} \
  -e NODE_ENV=production \
  -e JWT_SECRET=dev-secret \
  -e DATA_SOURCE=postgres \
  -e DATABASE_URL="postgresql://postgres:postgres@${dbContainerName}:5432/appdb?schema=public" \
  -e AUTO_MIGRATE=true \
  "$image_full"

# Verify image matches
docker inspect -f '{{ .Config.Image }}' "$containerName" | grep -q "$image_full" || {
  echo "Container image verification failed" >&2; exit 1; }

# Show recent logs and run explicit migrations + seed
docker logs --since 5s "$containerName" || true
docker exec "$containerName" sh -lc 'npx prisma migrate deploy'

# Conditionally seed only when the User table is empty (first-time init)
echo "[deploy] Checking if seeding is required..."
TABLE_EXISTS=$(docker exec "$dbContainerName" sh -lc 'psql -U postgres -d appdb -tAc "SELECT to_regclass(\"\"User\"\") IS NOT NULL"' | tr -d '[:space:]' || true)
if [ "$TABLE_EXISTS" = "t" ]; then
  USER_COUNT=$(docker exec "$dbContainerName" sh -lc 'psql -U postgres -d appdb -tAc "SELECT COUNT(*) FROM \"User\""' | tr -d '[:space:]' || echo 0)
else
  USER_COUNT=0
fi

if [ "$USER_COUNT" = "0" ]; then
  echo "[deploy] User table empty; running seed script."
  docker exec "$containerName" sh -lc 'node scripts/seed.js'
else
  echo "[deploy] User table has $USER_COUNT rows; skip seed to preserve data."
fi

echo "[deploy] Completed Postgres deployment for container: $containerName"

