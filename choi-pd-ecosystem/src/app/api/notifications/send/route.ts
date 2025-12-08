import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email';

// POST /api/notifications/send - 알림 발송
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // 알림 타입 검증
    const validTypes = [
      'payment_complete',
      'new_inquiry',
      'subscription_expiring',
      'distributor_approved',
    ];

    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    let emailSent = false;

    switch (type) {
      case 'payment_complete':
        if (!data.to || !data.customerName || !data.amount || !data.planName || !data.invoiceNumber) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields for payment_complete' },
            { status: 400 }
          );
        }
        const paymentEmail = emailTemplates.paymentComplete({
          customerName: data.customerName,
          amount: data.amount,
          planName: data.planName,
          invoiceNumber: data.invoiceNumber,
        });
        emailSent = await sendEmail({
          to: data.to,
          subject: paymentEmail.subject,
          html: paymentEmail.html,
        });
        break;

      case 'new_inquiry':
        if (!data.to || !data.inquiryId || !data.name || !data.email || !data.type || !data.message) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields for new_inquiry' },
            { status: 400 }
          );
        }
        const inquiryEmail = emailTemplates.newInquiry({
          inquiryId: data.inquiryId,
          name: data.name,
          email: data.email,
          type: data.type,
          message: data.message,
        });
        emailSent = await sendEmail({
          to: data.to,
          subject: inquiryEmail.subject,
          html: inquiryEmail.html,
        });
        break;

      case 'subscription_expiring':
        if (!data.to || !data.customerName || !data.planName || !data.expiryDate || !data.daysRemaining) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields for subscription_expiring' },
            { status: 400 }
          );
        }
        const expiringEmail = emailTemplates.subscriptionExpiring({
          customerName: data.customerName,
          planName: data.planName,
          expiryDate: data.expiryDate,
          daysRemaining: data.daysRemaining,
        });
        emailSent = await sendEmail({
          to: data.to,
          subject: expiringEmail.subject,
          html: expiringEmail.html,
        });
        break;

      case 'distributor_approved':
        if (!data.to || !data.name || !data.email || !data.planName) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields for distributor_approved' },
            { status: 400 }
          );
        }
        const approvedEmail = emailTemplates.distributorApproved({
          name: data.name,
          email: data.email,
          planName: data.planName,
        });
        emailSent = await sendEmail({
          to: data.to,
          subject: approvedEmail.subject,
          html: approvedEmail.html,
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown notification type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: emailSent,
      message: emailSent
        ? 'Notification sent successfully'
        : 'Notification queued (email service not configured)',
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
