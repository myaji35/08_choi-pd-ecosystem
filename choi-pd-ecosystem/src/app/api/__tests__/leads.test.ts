/**
 * @jest-environment node
 */

/**
 * Tests for Newsletter Leads API endpoint
 * Email subscription - key conversion funnel
 */

const mockGet = jest.fn();

jest.mock('@/lib/db', () => {
  const get = jest.fn();
  // Expose the mock so tests can configure it
  (global as any).__mockDbGet = get;
  return {
    db: {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get,
          }),
        }),
      }),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 1, email: 'new@example.com', tenantId: 1 }]),
        }),
      }),
    },
  };
});

jest.mock('@/lib/tenant/context', () => ({
  getTenantIdFromRequest: jest.fn().mockReturnValue(1),
}));

jest.mock('@/lib/tenant/query-helpers', () => ({
  tenantFilter: jest.fn().mockReturnValue(true),
  withTenantId: jest.fn((data: any, tenantId: number) => ({ ...data, tenantId })),
}));

import { POST } from '../leads/route';
import { NextRequest } from 'next/server';

function createLeadRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(new URL('http://localhost:3011/api/leads'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Leads (Newsletter Subscription) API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const dbGet = (global as any).__mockDbGet;
    dbGet.mockResolvedValue(undefined); // No existing subscription by default
  });

  describe('POST /api/leads', () => {
    it('should subscribe with valid email', async () => {
      const req = createLeadRequest({ email: 'new@example.com' });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
    });

    it('should reject invalid email format', async () => {
      const req = createLeadRequest({ email: 'not-valid' });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject empty email', async () => {
      const req = createLeadRequest({ email: '' });
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it('should reject duplicate email subscription', async () => {
      const dbGet = (global as any).__mockDbGet;
      dbGet.mockResolvedValueOnce({ id: 1, email: 'existing@example.com' });

      const req = createLeadRequest({ email: 'existing@example.com' });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('이미 구독');
    });

    it('should reject missing email field', async () => {
      const req = createLeadRequest({});
      const res = await POST(req);

      expect(res.status).toBe(400);
    });
  });
});
