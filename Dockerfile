# Multi-stage build for Next.js 16
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Copy Prisma schema (required for postinstall prisma generate)
COPY prisma ./prisma

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package files for Prisma installation
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/prisma ./prisma

# Install ONLY Prisma packages (production dependencies)
RUN npm install prisma@6.19.2 @prisma/client@6.19.2

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy generated Prisma client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Create data directory for SQLite (before switching user)
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run schema push on container start and start application
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node server.js"]
