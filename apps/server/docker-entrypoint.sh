#!/bin/sh
set -e

echo "[entrypoint] Starting server (AUTO_MIGRATE=${AUTO_MIGRATE:-false})..."

if [ "${AUTO_MIGRATE}" = "true" ]; then
  if [ -z "$DATABASE_URL" ]; then
    echo "[entrypoint] DATABASE_URL is not set; skipping migrations."
  else
    if [ -x "/usr/bin/npx" ] || [ -x "/usr/local/bin/npx" ] || [ -x "/bin/npx" ]; then
      echo "[entrypoint] Running: prisma migrate deploy"
      npx prisma migrate deploy || echo "[entrypoint] Prisma migrate deploy failed or prisma CLI missing; continuing."
    else
      # Fallback: attempt to run prisma CLI directly from node_modules
      if [ -f "./node_modules/prisma/build/index.js" ]; then
        echo "[entrypoint] Running prisma via node_modules fallback"
        node ./node_modules/prisma/build/index.js migrate deploy || echo "[entrypoint] Fallback migrate failed; continuing."
      else
        echo "[entrypoint] Prisma CLI not available; skipping migrations."
      fi
    fi
  fi
else
  echo "[entrypoint] AUTO_MIGRATE is disabled; skipping migrations."
fi

echo "[entrypoint] Launching API server..."
exec node dist/index.js