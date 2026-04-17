import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payments, distributors, distributorActivityLog } from '@/lib/db/schema';
import { and, desc, gte, lte, type SQL } from 'drizzle-orm';
import { getTenantIdFromRequest } from '@/lib/tenant/context';
import { tenantFilter } from '@/lib/tenant/query-helpers';

export const dynamic = 'force-dynamic';

type ReportType = 'payments' | 'distributors' | 'activity';

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function rowsToCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(',');
  const body = rows
    .map((row) => columns.map((col) => toCsvValue(row[col])).join(','))
    .join('\n');
  return `${header}\n${body}\n`;
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = (searchParams.get('type') || 'payments') as ReportType;
  const from = parseDate(searchParams.get('from'));
  const to = parseDate(searchParams.get('to'));

  const tenantId = getTenantIdFromRequest(request);

  try {
    let csv = '';
    let filename = '';

    if (type === 'payments') {
      const conditions: SQL[] = [tenantFilter(payments.tenantId, tenantId)];
      if (from) conditions.push(gte(payments.createdAt, from));
      if (to) conditions.push(lte(payments.createdAt, to));
      const rows = await db
        .select()
        .from(payments)
        .where(and(...conditions))
        .orderBy(desc(payments.createdAt))
        .all();

      const columns = [
        'id',
        'distributorId',
        'planId',
        'amount',
        'currency',
        'status',
        'paymentMethod',
        'transactionId',
        'paidAt',
        'createdAt',
      ];
      csv = rowsToCsv(rows as Record<string, unknown>[], columns);
      filename = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (type === 'distributors') {
      const rows = await db
        .select()
        .from(distributors)
        .where(tenantFilter(distributors.tenantId, tenantId))
        .orderBy(desc(distributors.createdAt))
        .all();

      const columns = [
        'id',
        'name',
        'email',
        'phone',
        'businessType',
        'region',
        'status',
        'subscriptionPlan',
        'totalRevenue',
        'createdAt',
      ];
      csv = rowsToCsv(rows as Record<string, unknown>[], columns);
      filename = `distributors-${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (type === 'activity') {
      const conditions: SQL[] = [tenantFilter(distributorActivityLog.tenantId, tenantId)];
      if (from) conditions.push(gte(distributorActivityLog.createdAt, from));
      if (to) conditions.push(lte(distributorActivityLog.createdAt, to));
      const rows = await db
        .select()
        .from(distributorActivityLog)
        .where(and(...conditions))
        .orderBy(desc(distributorActivityLog.createdAt))
        .limit(5000)
        .all();

      const columns = [
        'id',
        'distributorId',
        'activityType',
        'description',
        'ipAddress',
        'createdAt',
      ];
      csv = rowsToCsv(rows as Record<string, unknown>[], columns);
      filename = `activity-${new Date().toISOString().slice(0, 10)}.csv`;
    } else {
      return NextResponse.json(
        { success: false, error: 'Unknown report type' },
        { status: 400 }
      );
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[reports/download] failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export report' },
      { status: 500 }
    );
  }
}
