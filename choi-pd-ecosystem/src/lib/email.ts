/**
 * Email Utility for imPD Platform
 *
 * This module provides email sending functionality.
 * For production, integrate with Resend or SendGrid.
 * For development, logs emails to console.
 */

const IS_DEV_MODE = process.env.NODE_ENV === 'development';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using configured email service
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (IS_DEV_MODE) {
      // Development mode: Log email to console
      console.log('📧 [DEV MODE] Email would be sent:');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('HTML:', options.html);
      return true;
    }

    // Production mode: Use Resend or SendGrid
    // TODO: Implement actual email sending with Resend
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'noreply@impd.com',
    //     to: options.to,
    //     subject: options.subject,
    //     html: options.html,
    //   }),
    // });

    console.warn('⚠️ Email sending not configured for production. Set up Resend or SendGrid.');
    return false;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Email Templates
 */

export const emailTemplates = {
  // 결제 완료 이메일
  paymentComplete: (data: {
    customerName: string;
    amount: number;
    planName: string;
    invoiceNumber: string;
  }) => ({
    subject: `[imPD] 결제 완료 - ${data.planName} 플랜`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .amount { font-size: 32px; font-weight: bold; color: #667eea; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>결제가 완료되었습니다!</h1>
          </div>
          <div class="content">
            <p>안녕하세요, ${data.customerName}님!</p>
            <p><strong>imPD</strong> 플랫폼을 이용해 주셔서 감사합니다.</p>

            <div class="info-box">
              <h3>결제 정보</h3>
              <p><strong>구독 플랜:</strong> ${data.planName}</p>
              <p><strong>결제 금액:</strong> <span class="amount">₩${data.amount.toLocaleString()}</span></p>
              <p><strong>영수증 번호:</strong> ${data.invoiceNumber}</p>
            </div>

            <p>구독이 활성화되었으며, 이제 모든 기능을 사용하실 수 있습니다.</p>
            <p>문의사항이 있으시면 언제든지 연락주세요.</p>
          </div>
          <div class="footer">
            <p>© 2025 imPD. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // 신규 문의 알림 (관리자용)
  newInquiry: (data: {
    inquiryId: number;
    name: string;
    email: string;
    type: string;
    message: string;
  }) => ({
    subject: `[imPD 알림] 신규 문의 접수 - ${data.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
          .message-box { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔔 신규 문의가 접수되었습니다</h2>
          </div>
          <div class="content">
            <div class="info-box">
              <p><strong>문의 ID:</strong> #${data.inquiryId}</p>
              <p><strong>이름:</strong> ${data.name}</p>
              <p><strong>이메일:</strong> ${data.email}</p>
              <p><strong>문의 유형:</strong> ${data.type === 'b2b' ? 'B2B 문의' : '일반 문의'}</p>
            </div>

            <div class="message-box">
              <h4>문의 내용:</h4>
              <p>${data.message}</p>
            </div>

            <p style="margin-top: 20px;">
              <a href="http://localhost:3011/pd/inquiries" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                문의 관리하기
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // 구독 만료 예정 알림
  subscriptionExpiring: (data: {
    customerName: string;
    planName: string;
    expiryDate: string;
    daysRemaining: number;
  }) => ({
    subject: `[imPD] 구독 만료 예정 알림 - ${data.daysRemaining}일 남음`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning-box { background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0; }
          .cta-button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ 구독 만료 예정</h1>
          </div>
          <div class="content">
            <p>안녕하세요, ${data.customerName}님!</p>

            <div class="warning-box">
              <h3>구독 정보</h3>
              <p><strong>플랜:</strong> ${data.planName}</p>
              <p><strong>만료일:</strong> ${data.expiryDate}</p>
              <p><strong>남은 기간:</strong> ${data.daysRemaining}일</p>
            </div>

            <p>구독이 곧 만료됩니다. 서비스를 계속 이용하시려면 갱신해 주세요.</p>

            <a href="http://localhost:3011/admin/subscription-plans" class="cta-button">
              구독 갱신하기
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // 분양자 승인 알림
  distributorApproved: (data: {
    name: string;
    email: string;
    planName: string;
  }) => ({
    subject: `[imPD] 분양 신청이 승인되었습니다!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 축하합니다!</h1>
            <p>분양 신청이 승인되었습니다</p>
          </div>
          <div class="content">
            <p>안녕하세요, ${data.name}님!</p>

            <div class="success-box">
              <h3>승인 정보</h3>
              <p><strong>이메일:</strong> ${data.email}</p>
              <p><strong>구독 플랜:</strong> ${data.planName}</p>
            </div>

            <p>이제 imPD 플랫폼의 모든 기능을 사용하실 수 있습니다.</p>
            <p>로그인하여 리소스를 다운로드하고 비즈니스를 시작하세요!</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

/**
 * Send inquiry confirmation email
 */
export async function sendInquiryConfirmationEmail(data: {
  email: string;
  name: string;
  type: string;
}): Promise<void> {
  const template = emailTemplates.newInquiry({
    inquiryId: Date.now(),
    name: data.name,
    email: data.email,
    type: data.type,
    message: '문의가 접수되었습니다.'
  });
  await sendEmail({
    to: data.email,
    subject: '문의가 접수되었습니다',
    html: template.html
  });
}

/**
 * Send newsletter to subscribers
 */
export async function sendNewsletter(data: {
  subject: string;
  content: string;
  subscribers: { email: string; id?: string }[];
}): Promise<void> {
  // Send to all subscribers in batches
  const batchSize = 50;
  for (let i = 0; i < data.subscribers.length; i += batchSize) {
    const batch = data.subscribers.slice(i, i + batchSize);

    await Promise.all(
      batch.map(subscriber =>
        sendEmail({
          to: subscriber.email,
          subject: data.subject,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #1a73e8; color: white; padding: 20px; }
                .content { padding: 20px; background: white; }
                .footer { padding: 10px; text-align: center; color: #666; }
                .unsubscribe { color: #1a73e8; text-decoration: none; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${data.subject}</h1>
                </div>
                <div class="content">
                  ${data.content}
                </div>
                <div class="footer">
                  <p>이 이메일을 원하지 않으시면 <a href="#" class="unsubscribe">구독 취소</a>를 클릭하세요.</p>
                </div>
              </div>
            </body>
            </html>
          `
        })
      )
    );

    // Add delay between batches to avoid rate limiting
    if (i + batchSize < data.subscribers.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
