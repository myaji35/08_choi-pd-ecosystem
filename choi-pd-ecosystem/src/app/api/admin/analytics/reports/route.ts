import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customReports } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// Create custom report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      description,
      reportType,
      dataSource,
      columns,
      filters,
      groupBy,
      orderBy,
      chartType,
      chartConfig,
      schedule,
      recipients,
      isPublic,
      createdBy
    } = body;

    // Validation
    if (!name || !reportType || !dataSource || !columns || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [report] = await db.insert(customReports).values({
      name,
      description: description || null,
      reportType,
      dataSource,
      columns: JSON.stringify(columns),
      filters: filters ? JSON.stringify(filters) : null,
      groupBy: groupBy ? JSON.stringify(groupBy) : null,
      orderBy: orderBy ? JSON.stringify(orderBy) : null,
      chartType: chartType || null,
      chartConfig: chartConfig ? JSON.stringify(chartConfig) : null,
      schedule: schedule ? JSON.stringify(schedule) : null,
      recipients: recipients ? JSON.stringify(recipients) : null,
      isPublic: isPublic || false,
      createdBy
    }).returning();

    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    console.error('Error creating custom report:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get custom reports
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reportType = searchParams.get('reportType') || undefined;
    const isPublic = searchParams.get('isPublic') || undefined;

    let query = db.select().from(customReports);
    const conditions: any[] = [];

    if (reportType) {
      conditions.push(eq(customReports.reportType, reportType as any));
    }

    if (isPublic !== undefined) {
      conditions.push(eq(customReports.isPublic, isPublic === 'true'));
    }

    if (conditions.length > 0) {
      const { and } = await import('drizzle-orm');
      query = query.where(and(...conditions)) as any;
    }

    const reports = await query.orderBy(desc(customReports.createdAt));

    // Parse JSON fields
    const parsedReports = reports.map((report) => ({
      ...report,
      columns: report.columns ? JSON.parse(report.columns) : null,
      filters: report.filters ? JSON.parse(report.filters) : null,
      groupBy: report.groupBy ? JSON.parse(report.groupBy) : null,
      orderBy: report.orderBy ? JSON.parse(report.orderBy) : null,
      chartConfig: report.chartConfig ? JSON.parse(report.chartConfig) : null,
      schedule: report.schedule ? JSON.parse(report.schedule) : null,
      recipients: report.recipients ? JSON.parse(report.recipients) : null
    }));

    return NextResponse.json({ success: true, data: parsedReports });
  } catch (error: any) {
    console.error('Error fetching custom reports:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
