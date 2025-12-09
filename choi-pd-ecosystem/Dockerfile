# Multi-stage Dockerfile for Next.js production deployment
# Optimized for Coolify and general Docker environments
# Version: 2.0 - Stability Enhanced

# =============================================================================
# Stage 1: Dependencies - 의존성 설치
# =============================================================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (dev + prod) for build stage
RUN npm ci --legacy-peer-deps && npm cache clean --force

# =============================================================================
# Stage 2: Builder - 애플리케이션 빌드
# =============================================================================
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat curl

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

# Copy source code
COPY . .

# Build arguments for environment configuration
ARG DOCKER_BUILD=true
ARG NODE_ENV=production

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=true
ENV NODE_ENV=production

# Build the Next.js application with standalone output
RUN npm run build

# Verify build output exists
RUN test -d .next/standalone || (echo "ERROR: standalone output not found" && exit 1)
RUN test -d .next/static || (echo "ERROR: static files not found" && exit 1)

# =============================================================================
# Stage 3: Runner - 프로덕션 실행 환경
# =============================================================================
FROM node:20-alpine AS runner

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3011
ENV HOSTNAME="0.0.0.0"

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create persistent data directories
RUN mkdir -p data public/uploads logs && \
    chown -R nextjs:nodejs data public/uploads logs

# Set proper permissions
RUN chmod -R 755 /app && \
    chmod -R 770 data public/uploads logs

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3011

# Health check - 안정적인 헬스체크 설정
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD curl -f http://localhost:3011/api/health || exit 1

# Use dumb-init for proper signal handling (graceful shutdown)
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]