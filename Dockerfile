# ─────────────────────────────────────────────────────────
# Vortex Workspace — Production Dockerfile
# ─────────────────────────────────────────────────────────
# Multi-stage build for minimal image size

# ── Stage 1: Build ───────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev
RUN npx prisma generate

# ── Stage 2: Runtime ─────────────────────────────────────
FROM node:22-alpine AS runtime

WORKDIR /app

# Security: non-root user
RUN addgroup -g 1001 -S vortex && \
    adduser -S vortex -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY . .

# Build Tailwind CSS
RUN npx tailwindcss -i src/styles/input.css -o public/css/style.css --minify

# Create logs directory
RUN mkdir -p logs && chown -R vortex:vortex /app

USER vortex

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
