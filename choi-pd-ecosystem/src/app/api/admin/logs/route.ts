import { NextRequest, NextResponse } from 'next/server';
import { getLogs, getSystemMetrics, getSystemHealth, clearLogs, exportLogs } from '@/lib/monitoring';

// GET /api/admin/logs - Get system logs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get('level') as any;
    const category = searchParams.get('category') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const sinceParam = searchParams.get('since');
    const format = searchParams.get('format') || 'json';

    const since = sinceParam ? new Date(sinceParam) : undefined;

    const logs = getLogs({ level, category, limit, since });

    // Export format
    if (format === 'text') {
      const exported = exportLogs({ level, category, since });
      return new NextResponse(exported, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="logs-${new Date().toISOString()}.json"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      logs,
      count: logs.length,
    });
  } catch (error) {
    console.error('Failed to get logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get logs' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/logs - Clear logs
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const beforeParam = searchParams.get('before');

    const before = beforeParam ? new Date(beforeParam) : undefined;
    const deletedCount = clearLogs(before);

    return NextResponse.json({
      success: true,
      message: `Cleared ${deletedCount} log entries`,
      deletedCount,
    });
  } catch (error) {
    console.error('Failed to clear logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear logs' },
      { status: 500 }
    );
  }
}
