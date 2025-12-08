import { NextResponse } from 'next/server';

/**
 * Health check endpoint for monitoring and deployment verification
 * Used by Vercel, Cloud Run, and other monitoring services
 */
export async function GET() {
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'imPD Platform',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    };

    // Check database connection (optional)
    // Uncomment when database is properly configured
    /*
    try {
      const { db } = await import('@/lib/db');
      await db.select().from(schema.settings).limit(1);
      health.database = 'connected';
    } catch (dbError) {
      health.database = 'disconnected';
      health.status = 'degraded';
    }
    */

    // Memory usage
    const memoryUsage = process.memoryUsage();
    const formatMemory = (bytes: number) => `${Math.round(bytes / 1024 / 1024)}MB`;

    const extendedHealth = {
      ...health,
      memory: {
        rss: formatMemory(memoryUsage.rss),
        heapTotal: formatMemory(memoryUsage.heapTotal),
        heapUsed: formatMemory(memoryUsage.heapUsed),
        external: formatMemory(memoryUsage.external),
      },
    };

    return NextResponse.json(extendedHealth, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'pass',
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

// HEAD method for lightweight health checks
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'X-Health-Check': 'pass',
    },
  });
}