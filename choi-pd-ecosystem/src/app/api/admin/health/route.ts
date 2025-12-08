import { NextRequest, NextResponse } from 'next/server';
import { getSystemHealth, getSystemMetrics } from '@/lib/monitoring';

// GET /api/admin/health - Get system health status
export async function GET(request: NextRequest) {
  try {
    const health = getSystemHealth();
    const metrics = getSystemMetrics();

    return NextResponse.json({
      success: true,
      health,
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get system health:', error);
    return NextResponse.json(
      {
        success: false,
        health: {
          status: 'unhealthy',
          checks: {},
          message: 'Failed to get health status',
        },
        error: 'Failed to get system health',
      },
      { status: 500 }
    );
  }
}
