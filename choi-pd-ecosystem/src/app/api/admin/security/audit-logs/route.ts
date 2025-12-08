/**
 * Epic 21: 감사 로그 API
 * GET /api/admin/security/audit-logs - 감사 로그 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || undefined;
    const resource = searchParams.get('resource') || undefined;
    const action = searchParams.get('action') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;

    const logs = await getAuditLogs({
      userId,
      resource,
      action,
      startDate,
      limit,
    });

    // Parse JSON fields
    const parsedLogs = logs.map((log) => ({
      ...log,
      changes: log.changes ? JSON.parse(log.changes) : null,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
    }));

    return NextResponse.json({
      success: true,
      data: parsedLogs,
      count: parsedLogs.length,
    });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
