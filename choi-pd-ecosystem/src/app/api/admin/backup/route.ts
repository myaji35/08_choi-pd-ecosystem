import { NextRequest, NextResponse } from 'next/server';
import {
  createBackup,
  exportBackupToFile,
  listBackups,
  cleanupOldBackups,
} from '@/lib/backup';

// GET /api/admin/backup - List all backups
export async function GET(request: NextRequest) {
  try {
    const backups = await listBackups();

    return NextResponse.json({
      success: true,
      backups,
      count: backups.length,
    });
  } catch (error) {
    console.error('Failed to list backups:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list backups' },
      { status: 500 }
    );
  }
}

// POST /api/admin/backup - Create a new backup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { filename, cleanup = false, keepCount = 10 } = body;

    // Create backup
    const backup = await createBackup();

    // Export to file
    const filepath = await exportBackupToFile(backup, filename);

    // Cleanup old backups if requested
    let deletedCount = 0;
    if (cleanup) {
      deletedCount = await cleanupOldBackups(keepCount);
    }

    return NextResponse.json({
      success: true,
      message: 'Backup created successfully',
      filepath,
      metadata: backup.metadata,
      deletedOldBackups: deletedCount,
    });
  } catch (error) {
    console.error('Failed to create backup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/backup - Cleanup old backups
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keepCount = parseInt(searchParams.get('keep') || '10');

    const deletedCount = await cleanupOldBackups(keepCount);

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount} old backups`,
      deletedCount,
    });
  } catch (error) {
    console.error('Failed to cleanup backups:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup backups' },
      { status: 500 }
    );
  }
}
