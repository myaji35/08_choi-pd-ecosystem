/**
 * System Monitoring Utilities
 * Tracks system health, performance, and errors
 */

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

// In-memory log storage (for development)
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
  const logMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  logMethod(`[${level.toUpperCase()}] [${category}] ${message}`, metadata || '');
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

  return {
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: {
      used: memoryUsage.heapUsed,
      total: memoryUsage.heapTotal,
      percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
    },
    requests: {
      total: 0, // TODO: Track with middleware
      successful: 0,
      failed: 0,
      avgResponseTime: 0,
    },
    database: {
      connections: 1, // SQLite uses single connection
      queries: 0, // TODO: Track with DB middleware
      avgQueryTime: 0,
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
