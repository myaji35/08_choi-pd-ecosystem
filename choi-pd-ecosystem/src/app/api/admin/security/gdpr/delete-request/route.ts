/**
 * Epic 21: GDPR 개인정보 삭제 요청 API
 * POST /api/admin/security/gdpr/delete-request - 삭제 요청 생성
 * GET /api/admin/security/gdpr/delete-request - 삭제 요청 목록
 * PATCH /api/admin/security/gdpr/delete-request/:id - 삭제 요청 승인/거부
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dataDeletionRequests, distributors, leads, inquiries, type NewDataDeletionRequest } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { logAudit } from '@/lib/security';

// GET - 삭제 요청 목록
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | 'completed' | null;

    let query = db.select().from(dataDeletionRequests);

    if (status) {
      query = query.where(eq(dataDeletionRequests.status, status)) as any;
    }

    const requests = await query;

    // Parse metadata
    const parsedRequests = requests.map((req) => ({
      ...req,
      metadata: req.metadata ? JSON.parse(req.metadata) : null,
    }));

    return NextResponse.json({
      success: true,
      data: parsedRequests,
      count: parsedRequests.length,
    });
  } catch (error) {
    console.error('Failed to fetch deletion requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deletion requests' },
      { status: 500 }
    );
  }
}

// POST - 새 삭제 요청 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userEmail, userType, reason }: NewDataDeletionRequest = body;

    if (!userId || !userEmail || !userType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [newRequest] = await db
      .insert(dataDeletionRequests)
      .values({
        userId,
        userEmail,
        userType,
        reason: reason || null,
        status: 'pending',
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newRequest,
      message: 'Data deletion request submitted. We will process it within 30 days.',
    });
  } catch (error) {
    console.error('Failed to create deletion request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create deletion request' },
      { status: 500 }
    );
  }
}

// PATCH - 삭제 요청 처리 (승인/거부/완료)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, action, reviewedBy, notes } = body;

    if (!requestId || !action || !reviewedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 삭제 요청 정보 가져오기
    const [deletionRequest] = await db
      .select()
      .from(dataDeletionRequests)
      .where(eq(dataDeletionRequests.id, requestId));

    if (!deletionRequest) {
      return NextResponse.json(
        { success: false, error: 'Deletion request not found' },
        { status: 404 }
      );
    }

    let newStatus: 'approved' | 'rejected' | 'completed' = 'approved';
    let deletedData: any = null;

    if (action === 'approve') {
      // 실제 데이터 삭제 수행
      if (deletionRequest.userType === 'distributor') {
        // Distributor 데이터 백업
        const [distributor] = await db
          .select()
          .from(distributors)
          .where(eq(distributors.email, deletionRequest.userEmail));

        deletedData = distributor;

        // 관련 데이터 삭제 (CASCADE로 자동 삭제됨)
        await db
          .delete(distributors)
          .where(eq(distributors.email, deletionRequest.userEmail));
      } else if (deletionRequest.userType === 'lead') {
        const [lead] = await db
          .select()
          .from(leads)
          .where(eq(leads.email, deletionRequest.userEmail));

        deletedData = lead;

        await db
          .delete(leads)
          .where(eq(leads.email, deletionRequest.userEmail));
      } else if (deletionRequest.userType === 'inquiry') {
        const inquiryList = await db
          .select()
          .from(inquiries)
          .where(eq(inquiries.email, deletionRequest.userEmail));

        deletedData = inquiryList;

        await db
          .delete(inquiries)
          .where(eq(inquiries.email, deletionRequest.userEmail));
      }

      newStatus = 'completed';
    } else if (action === 'reject') {
      newStatus = 'rejected';
    }

    // 요청 상태 업데이트
    await db
      .update(dataDeletionRequests)
      .set({
        status: newStatus,
        reviewedBy,
        reviewedAt: new Date(),
        deletedAt: newStatus === 'completed' ? new Date() : null,
        notes: notes || null,
        metadata: deletedData ? JSON.stringify(deletedData) : null,
      })
      .where(eq(dataDeletionRequests.id, requestId));

    // Audit log
    await logAudit({
      userId: reviewedBy,
      userType: 'admin',
      action: 'GDPR_DELETE',
      resource: 'data_deletion_request',
      resourceId: requestId.toString(),
      changes: {
        action,
        userEmail: deletionRequest.userEmail,
        userType: deletionRequest.userType,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Data deletion request ${action}d successfully`,
    });
  } catch (error) {
    console.error('Failed to process deletion request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process deletion request' },
      { status: 500 }
    );
  }
}
