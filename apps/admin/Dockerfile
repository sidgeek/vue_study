# ---- Build stage ----
FROM node:20 AS builder
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy sources
COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY src ./src

# Build with Vite (reads VITE_* env at build time)
# You can override VITE_API_BASE via build args
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}
RUN npm run build


# ---- Runtime stage (Nginx) ----
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Copy built assets
COPY --from=builder /app/dist .

# Replace default Nginx conf to support SPA history fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]