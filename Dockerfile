# syntax=docker/dockerfile:1

# ----------------------------------------------------------------------------
# AKKC – production image for the Next.js application.
# Multi-stage build: install deps, build, then a minimal runtime that only
# carries the standalone server output. No secrets are baked into the image —
# all configuration is injected at runtime via environment variables.
# ----------------------------------------------------------------------------

# ---- Stage 1: dependencies -------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
# Only copy manifests first so this layer is cached unless deps change.
COPY package.json package-lock.json ./
RUN npm ci

# ---- Stage 2: build --------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# This app reads every env var (Supabase URL/key, app URL, SMTP) ONLY on the
# server at runtime — none are referenced in client components — so nothing
# needs to be inlined at build time. The image is fully config-free; all values
# are injected from .env at runtime via docker-compose. One image, any env.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Stage 3: runtime ------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as an unprivileged user.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone server + static assets + public files.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

# Lightweight container healthcheck — hits the app's own HTTP port.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
