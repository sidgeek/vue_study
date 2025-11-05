# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Prisma engine runtime dependency on alpine
RUN apk add --no-cache openssl

# Install dependencies (incl. dev)
COPY package*.json ./
RUN npm ci

# Generate Prisma Client (safe even if DATABASE_URL is not set)
COPY prisma ./prisma
RUN npx prisma generate

# Build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build


# ---- Runtime stage ----
FROM node:20-alpine AS runner
WORKDIR /app

# Prisma engine runtime dependency on alpine
RUN apk add --no-cache openssl

ENV NODE_ENV=production

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build output
COPY --from=builder /app/dist ./dist

# Ensure Prisma Client exists even without dev deps
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Defaults (override via `-e` when running)
ENV PORT=3000 \
    JWT_SECRET=change-me-in-.env \
    DATA_SOURCE=file \
    DATA_FILE_PATH=/app/data/db.json

# Persist file-mode data outside the container filesystem
VOLUME ["/app/data"]

EXPOSE 3000
CMD ["node", "dist/index.js"]