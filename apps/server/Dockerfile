# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Prisma engine runtime dependency on alpine
RUN apk add --no-cache openssl

# Install dependencies (incl. dev)
COPY package*.json ./
RUN npm install

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
RUN npm install --omit=dev

# Copy build output
COPY --from=builder /app/dist ./dist

# Ensure Prisma Client exists even without dev deps
# Copy generated Prisma Client and engines
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Copy Prisma schema and scripts required for runtime db push/seed
COPY prisma ./prisma
COPY scripts ./scripts

# Defaults (override via `-e` when running)
ENV PORT=3000 \
    JWT_SECRET=change-me-in-.env \
    DATA_SOURCE=postgres

EXPOSE 3000
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh
CMD ["sh", "./docker-entrypoint.sh"]