import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userBulkImportLogs, organizationMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Process CSV bulk import
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      organizationId,
      importedBy,
      fileName,
      csvData
    } = body;

    // Validation
    if (!organizationId || !importedBy || !fileName || !csvData || !Array.isArray(csvData)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields or invalid data format' },
        { status: 400 }
      );
    }

    const totalRows = csvData.length;

    // Create import log
    const [importLog] = await db.insert(userBulkImportLogs).values({
      organizationId,
      importedBy,
      fileName,
      fileUrl: null,
      totalRows,
      successCount: 0,
      failureCount: 0,
      status: 'processing',
      startedAt: new Date()
    }).returning();

    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];
    const results: any[] = [];

    // Process each row
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];

      try {
        // Validate email
        if (!row.email || !isValidEmail(row.email)) {
          throw new Error('Invalid or missing email');
        }

        // Check if user already exists
        const existing = await db.select()
          .from(organizationMembers)
          .where(eq(organizationMembers.userEmail, row.email));

        if (existing.length > 0) {
          throw new Error('User already exists');
        }

        // Insert new member
        await db.insert(organizationMembers).values({
          organizationId,
          userId: `temp-${Date.now()}-${i}`, // Temporary user ID
          userEmail: row.email,
          userName: row.name || null,
          role: (row.role as any) || 'member',
          jobTitle: row.jobTitle || null,
          department: row.department || null,
          status: 'invited',
          invitedBy: importedBy,
          invitedAt: new Date()
        });

        successCount++;
        results.push({
          row: i + 1,
          email: row.email,
          status: 'success'
        });
      } catch (error: any) {
        failureCount++;
        const errorMsg = `Row ${i + 1} (${row.email || 'unknown'}): ${error.message}`;
        errors.push(errorMsg);
        results.push({
          row: i + 1,
          email: row.email || 'unknown',
          status: 'failed',
          error: error.message
        });
      }
    }

    // Update import log
    await db.update(userBulkImportLogs)
      .set({
        successCount,
        failureCount,
        status: failureCount === 0 ? 'completed' : 'completed_with_errors',
        errors: errors.length > 0 ? JSON.stringify(errors) : null,
        results: JSON.stringify(results),
        completedAt: new Date()
      })
      .where(eq(userBulkImportLogs.id, importLog.id));

    return NextResponse.json({
      success: true,
      data: {
        importLogId: importLog.id,
        totalRows,
        successCount,
        failureCount,
        errors: errors.length > 0 ? errors : null,
        results
      }
    });
  } catch (error: any) {
    console.error('Error processing bulk import:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get bulk import logs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId') || undefined;

    let query = db.select().from(userBulkImportLogs);

    if (organizationId) {
      query = query.where(eq(userBulkImportLogs.organizationId, parseInt(organizationId))) as any;
    }

    const logs = await query;

    // Parse JSON fields
    const parsed = logs.map((log) => ({
      ...log,
      errors: log.errors ? JSON.parse(log.errors) : null,
      results: log.results ? JSON.parse(log.results) : null
    }));

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error fetching import logs:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
