/**
 * 문의(B2B/B2G/일반) 접수 알림 파이프라인
 *
 * 채널 (가용한 것부터 시도, 실패해도 전체는 실패시키지 않음):
 * 1. 관리자 이메일 알림 (Resend) — ADMIN_NOTIFY_EMAILS 콤마 구분
 * 2. 문의자 자동 회신 이메일 — FROM_EMAIL 설정 시만
 * 3. Webhook (선택) — INQUIRY_WEBHOOK_URL (Slack/Discord 포맷)
 *
 * 환경변수:
 *   RESEND_API_KEY
 *   ADMIN_NOTIFY_EMAILS   ex: "admin@impd.co.kr,ops@impd.co.kr"
 *   FROM_EMAIL            ex: "noreply@impd.co.kr" (기본값 "noreply@impd.co.kr")
 *   INQUIRY_WEBHOOK_URL   ex: Slack Incoming Webhook URL
 */

export interface InquiryPayload {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  type: 'b2b' | 'contact';
  createdAt?: Date | null;
}

interface NotifyResult {
  adminEmail: 'sent' | 'skipped' | 'failed';
  autoReply: 'sent' | 'skipped' | 'failed';
  webhook: 'sent' | 'skipped' | 'failed';
  errors: string[];
}

async function sendViaResend(
  apiKey: string,
  from: string,
  to: string | string[],
  subject: string,
  html: string
): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body.slice(0, 200)}`);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function notifyInquiry(inquiry: InquiryPayload): Promise<NotifyResult> {
  const result: NotifyResult = {
    adminEmail: 'skipped',
    autoReply: 'skipped',
    webhook: 'skipped',
    errors: [],
  };

  const apiKey = process.env.RESEND_API_KEY;
  const adminList = (process.env.ADMIN_NOTIFY_EMAILS ?? '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  const fromEmail = process.env.FROM_EMAIL ?? 'noreply@impd.co.kr';
  const webhookUrl = process.env.INQUIRY_WEBHOOK_URL;

  const typeLabel = inquiry.type === 'b2b' ? 'B2B/기관' : '일반 문의';
  const safeName = escapeHtml(inquiry.name);
  const safeEmail = escapeHtml(inquiry.email);
  const safePhone = escapeHtml(inquiry.phone ?? '');
  const safeMessage = escapeHtml(inquiry.message).replace(/\n/g, '<br/>');

  // 1. 관리자 알림
  if (apiKey && adminList.length > 0) {
    try {
      await sendViaResend(
        apiKey,
        fromEmail,
        adminList,
        `[imPD 신규 ${typeLabel}] ${safeName} (${safeEmail})`,
        `<div style="font-family:sans-serif;max-width:600px;">
          <h2 style="color:#16325C;">신규 문의 접수</h2>
          <table style="border-collapse:collapse;width:100%;margin:16px 0;">
            <tr><td style="padding:8px;background:#F3F2F2;width:100px;"><b>유형</b></td><td style="padding:8px;">${typeLabel}</td></tr>
            <tr><td style="padding:8px;background:#F3F2F2;"><b>이름</b></td><td style="padding:8px;">${safeName}</td></tr>
            <tr><td style="padding:8px;background:#F3F2F2;"><b>이메일</b></td><td style="padding:8px;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
            <tr><td style="padding:8px;background:#F3F2F2;"><b>전화</b></td><td style="padding:8px;">${safePhone || '-'}</td></tr>
            <tr><td style="padding:8px;background:#F3F2F2;vertical-align:top;"><b>내용</b></td><td style="padding:8px;">${safeMessage}</td></tr>
          </table>
          <p style="color:#666;font-size:12px;">ID: ${inquiry.id} / 접수: ${inquiry.createdAt?.toISOString?.() ?? 'just now'}</p>
        </div>`
      );
      result.adminEmail = 'sent';
    } catch (err) {
      result.adminEmail = 'failed';
      result.errors.push(`admin-email: ${(err as Error).message}`);
    }
  }

  // 2. 문의자 자동 회신
  if (apiKey) {
    try {
      await sendViaResend(
        apiKey,
        fromEmail,
        inquiry.email,
        '[imPD] 문의가 정상 접수되었습니다',
        `<div style="font-family:sans-serif;max-width:600px;">
          <h2 style="color:#16325C;">${safeName}님, 문의 주셔서 감사합니다.</h2>
          <p>접수하신 문의 내용은 담당자 확인 후 영업일 기준 1~2일 이내 회신드리겠습니다.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
          <p style="color:#666;">접수 내용:<br/><span style="color:#333;">${safeMessage}</span></p>
          <p style="color:#999;font-size:12px;margin-top:32px;">본 메일은 발신전용입니다.</p>
        </div>`
      );
      result.autoReply = 'sent';
    } catch (err) {
      result.autoReply = 'failed';
      result.errors.push(`auto-reply: ${(err as Error).message}`);
    }
  }

  // 3. Webhook (Slack/Discord/Custom)
  if (webhookUrl) {
    try {
      const text = `*신규 ${typeLabel}*\n이름: ${inquiry.name}\n이메일: ${inquiry.email}\n전화: ${inquiry.phone ?? '-'}\n내용:\n${inquiry.message}`;
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`webhook ${res.status}`);
      result.webhook = 'sent';
    } catch (err) {
      result.webhook = 'failed';
      result.errors.push(`webhook: ${(err as Error).message}`);
    }
  }

  return result;
}
