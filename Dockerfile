# ================================
# STAGE 1: Dependencies
# ================================
FROM oven/bun:1 AS deps
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production

# ================================
# STAGE 2: Builder
# ================================
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install all dependencies including devDependencies
RUN bun install --frozen-lockfile

# Generate Prisma Client
COPY prisma ./prisma/
RUN bunx prisma generate

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN bun run build

# ================================
# STAGE 3: Runner (Production)
# ================================
FROM node:22-alpine AS runner
WORKDIR /app

# Install sqlite3 for database initialization
RUN apk add --no-cache sqlite

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy Prisma files
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy entrypoint and init scripts
COPY entrypoint.sh /app/entrypoint.sh
COPY init-db.js /app/init-db.js
RUN chmod +x /app/entrypoint.sh

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

# Start application
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL=file:/app/data/game2048.db
ENTRYPOINT ["/app/entrypoint.sh"]
