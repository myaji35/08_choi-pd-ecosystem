/**
 * System Monitoring Utilities
 * Tracks system health, performance, and errors
 */

import { logger as structuredLogger } from './logger';

export interface SystemLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  metadata?: Record<string, any>;
  userId?: number;
  ipAddress?: string;
}

export interface SystemMetrics {
  timestamp: Date;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
    avgResponseTime: number;
  };
  database: {
    connections: number;
    queries: number;
    avgQueryTime: number;
  };
}

// ─── In-memory metrics counters (reset on restart) ─────────────────
const startTime = Date.now();

/** Per-path request counts */
const requestCounts = new Map<string, number>();
let totalRequests = 0;
let successfulRequests = 0;
let failedRequests = 0;
/** Running average response time in ms (exponential moving average) */
let avgResponseTime = 0;
const EMA_ALPHA = 0.1; // smoothing factor

/** DB query counter */
let dbQueryCount = 0;
let dbQueryTotalMs = 0;

/**
 * Track an incoming request. Call from API routes or instrumentation.
 * @param path  - request pathname (e.g. "/api/health")
 * @param statusCode - HTTP status of the response
 * @param durationMs - wall-clock response time in ms
 */
export function trackRequest(path: string, statusCode: number, durationMs: number): void {
  totalRequests++;
  requestCounts.set(path, (requestCounts.get(path) || 0) + 1);

  if (statusCode >= 200 && statusCode < 400) {
    successfulRequests++;
  } else {
    failedRequests++;
  }

  // Exponential moving average for response time
  avgResponseTime = avgResponseTime === 0
    ? durationMs
    : avgResponseTime * (1 - EMA_ALPHA) + durationMs * EMA_ALPHA;
}

/**
 * Track a DB query execution. Call from the DB wrapper.
 * @param durationMs - query execution time in ms
 */
export function trackDbQuery(durationMs: number): void {
  dbQueryCount++;
  dbQueryTotalMs += durationMs;
}

/**
 * Get a snapshot of all collected metrics.
 */
export function getMetrics() {
  return {
    uptime: Math.round((Date.now() - startTime) / 1000),
    requests: {
      total: totalRequests,
      successful: successfulRequests,
      failed: failedRequests,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
      byPath: Object.fromEntries(requestCounts),
    },
    database: {
      connections: 1, // SQLite single connection
      queries: dbQueryCount,
      avgQueryTime: dbQueryCount > 0
        ? Math.round((dbQueryTotalMs / dbQueryCount) * 100) / 100
        : 0,
    },
  };
}

/**
 * Reset all counters (useful for testing).
 */
export function resetMetrics(): void {
  requestCounts.clear();
  totalRequests = 0;
  successfulRequests = 0;
  failedRequests = 0;
  avgResponseTime = 0;
  dbQueryCount = 0;
  dbQueryTotalMs = 0;
}

// ─── In-memory log storage (for development) ──────────────────────
// In production, use a proper logging service (e.g., Winston, Pino)
const logs: SystemLog[] = [];
const MAX_LOGS = 1000;

/**
 * Log a system event
 */
export function log(
  level: SystemLog['level'],
  category: string,
  message: string,
  metadata?: Record<string, any>,
  userId?: number
): void {
  const logEntry: SystemLog = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    level,
    category,
    message,
    metadata,
    userId,
  };

  logs.push(logEntry);

  // Keep only last MAX_LOGS entries
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }

  // Also log to console
  if (level === 'error') {
    console.error(`[${level.toUpperCase()}] [${category}] ${message}`, metadata || '');
  } else if (level === 'warn') {
    console.warn(`[${level.toUpperCase()}] [${category}] ${message}`, metadata || '');
  } else {
    structuredLogger.info(`[${category}] ${message}`, metadata ? { metadata } : undefined);
  }
}

/**
 * Get recent logs
 */
export function getLogs(options?: {
  level?: SystemLog['level'];
  category?: string;
  limit?: number;
  since?: Date;
}): SystemLog[] {
  let filtered = [...logs];

  if (options?.level) {
    filtered = filtered.filter(log => log.level === options.level);
  }

  if (options?.category) {
    filtered = filtered.filter(log => log.category === options.category);
  }

  if (options?.since) {
    filtered = filtered.filter(log => log.timestamp >= options.since!);
  }

  if (options?.limit) {
    filtered = filtered.slice(-options.limit);
  }

  return filtered.reverse();
}

/**
 * Get system metrics
 */
export function getSystemMetrics(): SystemMetrics {
  const memoryUsage = process.memoryUsage();
  const metrics = getMetrics();

  return {
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: {
      used: memoryUsage.heapUsed,
      total: memoryUsage.heapTotal,
      percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
    },
    requests: {
      total: metrics.requests.total,
      successful: metrics.requests.successful,
      failed: metrics.requests.failed,
      avgResponseTime: metrics.requests.avgResponseTime,
    },
    database: {
      connections: metrics.database.connections,
      queries: metrics.database.queries,
      avgQueryTime: metrics.database.avgQueryTime,
    },
  };
}

/**
 * Check system health
 */
export function getSystemHealth(): {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
  message: string;
} {
  const metrics = getSystemMetrics();
  const checks: Record<string, boolean> = {
    memory: metrics.memory.percentage < 90,
    uptime: metrics.uptime > 60, // Running for at least 1 minute
  };

  const allHealthy = Object.values(checks).every(v => v);
  const someUnhealthy = Object.values(checks).some(v => !v);

  return {
    status: allHealthy ? 'healthy' : someUnhealthy ? 'degraded' : 'unhealthy',
    checks,
    message: allHealthy
      ? 'All systems operational'
      : someUnhealthy
        ? 'Some systems degraded'
        : 'System unhealthy',
  };
}

/**
 * Clear old logs
 */
export function clearLogs(before?: Date): number {
  if (!before) {
    const count = logs.length;
    logs.length = 0;
    return count;
  }

  const initialLength = logs.length;
  const filtered = logs.filter(log => log.timestamp >= before);
  logs.length = 0;
  logs.push(...filtered);

  return initialLength - logs.length;
}

/**
 * Export logs to JSON
 */
export function exportLogs(options?: {
  level?: SystemLog['level'];
  category?: string;
  since?: Date;
}): string {
  const logsToExport = getLogs(options);
  return JSON.stringify(logsToExport, null, 2);
}

/**
 * Helper functions for common log categories
 */
export const logger = {
  auth: (message: string, metadata?: Record<string, any>, userId?: number) =>
    log('info', 'auth', message, metadata, userId),
  api: (message: string, metadata?: Record<string, any>) =>
    log('info', 'api', message, metadata),
  database: (message: string, metadata?: Record<string, any>) =>
    log('info', 'database', message, metadata),
  payment: (message: string, metadata?: Record<string, any>, userId?: number) =>
    log('info', 'payment', message, metadata, userId),
  error: (message: string, error?: Error, metadata?: Record<string, any>) =>
    log('error', 'system', message, { ...metadata, error: error?.message, stack: error?.stack }),
};

// ─── API Route Wrapper ────────────────────────────────────────────
/**
 * Wraps a Next.js API route handler to automatically track request metrics.
 *
 * Usage:
 *   import { withTracking } from '@/lib/monitoring';
 *   export const GET = withTracking(async (request: Request) => { ... });
 */
export function withTracking(
  handler: (request: Request, context?: any) => Promise<Response>,
): (request: Request, context?: any) => Promise<Response> {
  return async (request: Request, context?: any) => {
    const start = Date.now();
    const url = new URL(request.url);
    let response: Response;
    try {
      response = await handler(request, context);
    } catch (err) {
      const duration = Date.now() - start;
      trackRequest(url.pathname, 500, duration);
      throw err;
    }
    const duration = Date.now() - start;
    trackRequest(url.pathname, response.status, duration);
    return response;
  };
}

// ─── DB Query Wrapper ─────────────────────────────────────────────
/**
 * Wraps an async DB operation to track query count and duration.
 *
 * Usage:
 *   import { trackedQuery } from '@/lib/monitoring';
 *   const result = await trackedQuery(() => db.select().from(users));
 */
export async function trackedQuery<T>(queryFn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    return await queryFn();
  } finally {
    trackDbQuery(Date.now() - start);
  }
}
