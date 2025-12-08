/**
 * Epic 21: IP 접근 제어 API
 * GET /api/admin/security/ip-control - IP 목록 조회
 * POST /api/admin/security/ip-control - IP 추가 (화이트리스트/블랙리스트)
 * DELETE /api/admin/security/ip-control/:id - IP 제거
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ipAccessControl, type NewIpAccessControl } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { logAudit } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'whitelist' | 'blacklist' | null;

    let query = db.select().from(ipAccessControl);

    if (type) {
      query = query.where(eq(ipAccessControl.type, type)) as any;
    }

    const ips = await query;

    return NextResponse.json({
      success: true,
      data: ips,
      count: ips.length,
    });
  } catch (error) {
    console.error('Failed to fetch IP control list:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch IP control list' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ipAddress,
      type,
      reason,
      appliesTo = 'all',
      expiresAt,
      createdBy,
    }: NewIpAccessControl = body;

    if (!ipAddress || !type || !reason || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [newEntry] = await db
      .insert(ipAccessControl)
      .values({
        ipAddress,
        type,
        reason,
        appliesTo,
        expiresAt: expiresAt || null,
        createdBy,
        isActive: true,
      })
      .returning();

    // Log audit
    await logAudit({
      userId: createdBy,
      userType: 'admin',
      action: 'CREATE',
      resource: 'ip_access_control',
      resourceId: newEntry.id.toString(),
      changes: { type, ipAddress, reason },
    });

    return NextResponse.json({
      success: true,
      data: newEntry,
      message: `IP ${type === 'whitelist' ? 'whitelisted' : 'blacklisted'} successfully`,
    });
  } catch (error: any) {
    console.error('Failed to add IP control:', error);

    if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json(
        { success: false, error: 'IP address already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add IP control' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing IP control ID' },
        { status: 400 }
      );
    }

    await db.delete(ipAccessControl).where(eq(ipAccessControl.id, parseInt(id)));

    return NextResponse.json({
      success: true,
      message: 'IP control entry deleted',
    });
  } catch (error) {
    console.error('Failed to delete IP control:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete IP control' },
      { status: 500 }
    );
  }
}
