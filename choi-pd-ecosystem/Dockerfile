# Multi-stage Dockerfile for Next.js production deployment
# Optimized for Coolify and general Docker environments

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
# Install production dependencies
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set production environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3011

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy database directory structure (will be mounted as volume)
RUN mkdir -p data && chown -R nextjs:nodejs data

# Copy uploads directory structure (will be mounted as volume)
RUN mkdir -p public/uploads && chown -R nextjs:nodejs public/uploads

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3011

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3011/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]