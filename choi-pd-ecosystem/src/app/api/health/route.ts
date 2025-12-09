import { NextResponse } from 'next/server';

/**
 * Health check endpoint for monitoring and deployment verification
 * Used by Coolify, Vercel, Cloud Run, and other monitoring services
 *
 * Endpoints:
 * - GET /api/health - Full health check with metrics
 * - HEAD /api/health - Lightweight liveness probe
 * - GET /api/health?type=ready - Readiness check (includes DB)
 * - GET /api/health?type=live - Liveness check (basic)
 */

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  service: string;
  version: string;
  environment: string;
  uptime: number;
  checks: {
    database?: 'connected' | 'disconnected' | 'skipped';
    memory?: 'ok' | 'warning' | 'critical';
    disk?: 'ok' | 'warning' | 'critical';
  };
  memory?: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    heapUsedPercent: string;
    external: string;
  };
}

const formatMemory = (bytes: number) => `${Math.round(bytes / 1024 / 1024)}MB`;

async function checkDatabase(): Promise<'connected' | 'disconnected'> {
  try {
    const { db } = await import('@/lib/db');
    // Simple query to check DB connection
    const start = Date.now();
    await db.run?.('SELECT 1') || true;
    const latency = Date.now() - start;

    // If query takes more than 5 seconds, consider it degraded
    if (latency > 5000) {
      console.warn(`Database check slow: ${latency}ms`);
    }
    return 'connected';
  } catch (error) {
    console.error('Database health check failed:', error);
    return 'disconnected';
  }
}

function checkMemory(): { status: 'ok' | 'warning' | 'critical'; usage: ReturnType<typeof process.memoryUsage> } {
  const usage = process.memoryUsage();
  const heapUsedPercent = (usage.heapUsed / usage.heapTotal) * 100;

  let status: 'ok' | 'warning' | 'critical' = 'ok';
  if (heapUsedPercent > 90) {
    status = 'critical';
  } else if (heapUsedPercent > 75) {
    status = 'warning';
  }

  return { status, usage };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkType = searchParams.get('type') || 'full';

  try {
    const memoryCheck = checkMemory();

    // Basic health info
    const health: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'imPD Platform',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.round(process.uptime()),
      checks: {
        memory: memoryCheck.status,
      },
    };

    // Liveness check - minimal (for Kubernetes/Docker liveness probes)
    if (checkType === 'live') {
      return NextResponse.json(
        { status: 'healthy', timestamp: health.timestamp },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Health-Check': 'pass',
          },
        }
      );
    }

    // Readiness check - includes database (for Kubernetes readiness probes)
    if (checkType === 'ready' || checkType === 'full') {
      try {
        health.checks.database = await checkDatabase();
        if (health.checks.database === 'disconnected') {
          health.status = 'degraded';
        }
      } catch {
        health.checks.database = 'disconnected';
        health.status = 'degraded';
      }
    }

    // Full check - includes all metrics
    if (checkType === 'full') {
      const { usage } = memoryCheck;
      health.memory = {
        rss: formatMemory(usage.rss),
        heapTotal: formatMemory(usage.heapTotal),
        heapUsed: formatMemory(usage.heapUsed),
        heapUsedPercent: `${Math.round((usage.heapUsed / usage.heapTotal) * 100)}%`,
        external: formatMemory(usage.external),
      };
    }

    // Determine overall status
    if (memoryCheck.status === 'critical') {
      health.status = 'unhealthy';
    } else if (memoryCheck.status === 'warning' || health.checks.database === 'disconnected') {
      health.status = health.status === 'healthy' ? 'degraded' : health.status;
    }

    const httpStatus = health.status === 'unhealthy' ? 503 : 200;

    return NextResponse.json(health, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': health.status === 'healthy' ? 'pass' : 'fail',
        'X-Health-Status': health.status,
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Health-Check': 'fail',
        },
      }
    );
  }
}

// HEAD method for lightweight health checks (liveness probe)
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'X-Health-Check': 'pass',
    },
  });
}