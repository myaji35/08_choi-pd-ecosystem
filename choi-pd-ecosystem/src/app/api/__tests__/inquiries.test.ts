/**
 * @jest-environment node
 */

/**
 * Tests for Inquiries API endpoint
 * B2B/B2G lead capture - business critical
 */

// Mock DB
jest.mock('@/lib/db', () => ({
  db: {
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{
          id: 1,
          name: '홍길동',
          email: 'test@example.com',
          phone: '010-1234-5678',
          message: '교육 프로그램 문의드립니다. 자세한 내용을 알고 싶습니다.',
          type: 'b2b',
          status: 'pending',
          tenantId: 1,
        }]),
      }),
    }),
  },
}));

// Mock tenant context
jest.mock('@/lib/tenant/context', () => ({
  getTenantIdFromRequest: jest.fn().mockReturnValue(1),
}));

jest.mock('@/lib/tenant/query-helpers', () => ({
  withTenantId: jest.fn((data: any, tenantId: number) => ({ ...data, tenantId })),
}));

import { POST } from '../inquiries/route';
import { NextRequest } from 'next/server';

function createInquiryRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(new URL('http://localhost:3011/api/inquiries'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Inquiries API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/inquiries', () => {
    const validInquiry = {
      name: '홍길동',
      email: 'test@example.com',
      phone: '010-1234-5678',
      message: '교육 프로그램 문의드립니다. 자세한 내용을 알고 싶습니다.',
      type: 'b2b',
    };

    it('should create inquiry with valid data', async () => {
      const req = createInquiryRequest(validInquiry);
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.message).toContain('접수');
    });

    it('should reject when name is too short', async () => {
      const req = createInquiryRequest({ ...validInquiry, name: 'A' });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed');
    });

    it('should reject invalid email format', async () => {
      const req = createInquiryRequest({ ...validInquiry, email: 'not-an-email' });
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it('should reject when message is too short', async () => {
      const req = createInquiryRequest({ ...validInquiry, message: '짧은' });
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it('should reject invalid inquiry type', async () => {
      const req = createInquiryRequest({ ...validInquiry, type: 'invalid' });
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it('should accept contact type', async () => {
      const req = createInquiryRequest({ ...validInquiry, type: 'contact' });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should accept inquiry without phone (optional)', async () => {
      const { phone, ...withoutPhone } = validInquiry;
      const req = createInquiryRequest(withoutPhone);
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const req = createInquiryRequest({});
      const res = await POST(req);

      expect(res.status).toBe(400);
    });
  });
});
