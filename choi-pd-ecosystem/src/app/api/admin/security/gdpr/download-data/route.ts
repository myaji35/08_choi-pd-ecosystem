/**
 * Epic 21: GDPR 개인정보 다운로드 API
 * GET /api/admin/security/gdpr/download-data?userEmail=xxx&userType=xxx
 *
 * GDPR Article 15: Right of Access
 * 사용자의 모든 개인정보를 JSON 형태로 제공
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { distributors, leads, inquiries, distributorActivityLog, payments, invoices } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { logAudit, maskEmail, maskPhone } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userEmail = searchParams.get('userEmail');
    const userType = searchParams.get('userType') as 'distributor' | 'lead' | 'inquiry';
    const requesterId = searchParams.get('requesterId'); // Admin who requested

    if (!userEmail || !userType) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let userData: any = {
      email: userEmail,
      userType,
      exportedAt: new Date().toISOString(),
      notice: 'This file contains all personal data we have stored about you.',
    };

    if (userType === 'distributor') {
      // Distributor 데이터 수집
      const [distributor] = await db
        .select()
        .from(distributors)
        .where(eq(distributors.email, userEmail));

      if (!distributor) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      // 활동 로그
      const activityLogs = await db
        .select()
        .from(distributorActivityLog)
        .where(eq(distributorActivityLog.distributorId, distributor.id));

      // 결제 내역
      const paymentHistory = await db
        .select()
        .from(payments)
        .where(eq(payments.distributorId, distributor.id));

      // 영수증
      const invoiceList = await db
        .select()
        .from(invoices)
        .where(eq(invoices.distributorId, distributor.id));

      userData = {
        ...userData,
        personalInfo: {
          id: distributor.id,
          name: distributor.name,
          email: distributor.email,
          phone: distributor.phone,
          businessType: distributor.businessType,
          region: distributor.region,
          status: distributor.status,
          subscriptionPlan: distributor.subscriptionPlan,
          subscriptionStartDate: distributor.subscriptionStartDate,
          subscriptionEndDate: distributor.subscriptionEndDate,
          createdAt: distributor.createdAt,
          updatedAt: distributor.updatedAt,
        },
        activityLogs: activityLogs.map((log) => ({
          id: log.id,
          type: log.activityType,
          description: log.description,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          createdAt: log.createdAt,
          metadata: log.metadata ? JSON.parse(log.metadata) : null,
        })),
        payments: paymentHistory.map((payment) => ({
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
        })),
        invoices: invoiceList.map((invoice) => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount,
          taxAmount: invoice.taxAmount,
          totalAmount: invoice.totalAmount,
          status: invoice.status,
          dueDate: invoice.dueDate,
          paidAt: invoice.paidAt,
          createdAt: invoice.createdAt,
        })),
      };
    } else if (userType === 'lead') {
      // 뉴스레터 구독자 데이터
      const [lead] = await db
        .select()
        .from(leads)
        .where(eq(leads.email, userEmail));

      if (!lead) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      userData = {
        ...userData,
        personalInfo: {
          id: lead.id,
          email: lead.email,
          subscribedAt: lead.subscribedAt,
        },
      };
    } else if (userType === 'inquiry') {
      // 문의 내역
      const inquiryList = await db
        .select()
        .from(inquiries)
        .where(eq(inquiries.email, userEmail));

      userData = {
        ...userData,
        inquiries: inquiryList.map((inq) => ({
          id: inq.id,
          name: inq.name,
          email: inq.email,
          phone: inq.phone,
          message: inq.message,
          type: inq.type,
          status: inq.status,
          createdAt: inq.createdAt,
        })),
      };
    }

    // Audit log
    if (requesterId) {
      await logAudit({
        userId: requesterId,
        userType: 'admin',
        action: 'GDPR_EXPORT',
        resource: 'user_data',
        resourceId: userEmail,
        metadata: { userType },
      });
    }

    // JSON 파일로 다운로드
    return new NextResponse(JSON.stringify(userData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="user_data_${userEmail}_${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Failed to export user data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export user data' },
      { status: 500 }
    );
  }
}
