/**
 * @jest-environment node
 */

/**
 * Tests for Admin Distributors API
 * Core business — distributor registration, validation, duplicate check
 */

const mockDistAll = jest.fn().mockResolvedValue([]);
const mockDistGet = jest.fn().mockResolvedValue(undefined);
const mockDistReturning = jest.fn().mockResolvedValue([{
  id: 1, name: '테스트 유통사', email: 'dist@example.com', businessType: 'retail', status: 'pending',
}]);

jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          all: (...args: any[]) => (global as any).__mockDistAll(...args),
          get: (...args: any[]) => (global as any).__mockDistGet(...args),
        }),
      }),
    }),
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: (...args: any[]) => (global as any).__mockDistReturning(...args),
      }),
    }),
  },
}));

jest.mock('@/lib/tenant/context', () => ({
  getTenantIdFromRequest: jest.fn().mockReturnValue(1),
}));

import { GET, POST } from '../admin/distributors/route';
import { NextRequest } from 'next/server';

beforeAll(() => {
  (global as any).__mockDistAll = mockDistAll;
  (global as any).__mockDistGet = mockDistGet;
  (global as any).__mockDistReturning = mockDistReturning;
});

function createRequest(method: string, url: string, body?: Record<string, unknown>): NextRequest {
  const opts: any = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  return new NextRequest(new URL(url, 'http://localhost:3011'), opts);
}

describe('Admin Distributors API', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/admin/distributors', () => {
    it('should return distributor list', async () => {
      mockDistAll.mockResolvedValueOnce([
        { id: 1, name: 'A유통', status: 'active' },
        { id: 2, name: 'B유통', status: 'pending' },
      ]);
      const res = await GET(createRequest('GET', '/api/admin/distributors'));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.distributors).toHaveLength(2);
    });

    it('should filter by status', async () => {
      mockDistAll.mockResolvedValueOnce([{ id: 1, name: 'A유통', status: 'active' }]);
      const res = await GET(createRequest('GET', '/api/admin/distributors?status=active'));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.distributors).toHaveLength(1);
    });
  });

  describe('POST /api/admin/distributors', () => {
    const validDistributor = {
      name: '테스트 유통사',
      email: 'dist@example.com',
      businessType: 'retail',
    };

    it('should create distributor with valid data', async () => {
      const res = await POST(createRequest('POST', '/api/admin/distributors', validDistributor));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.distributor).toHaveProperty('id');
    });

    it('should reject missing required fields', async () => {
      const res = await POST(createRequest('POST', '/api/admin/distributors', { name: 'Test' }));
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('Required');
    });

    it('should reject duplicate email', async () => {
      mockDistGet.mockResolvedValueOnce({ id: 1, email: 'dist@example.com' });

      const res = await POST(createRequest('POST', '/api/admin/distributors', validDistributor));
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.error).toContain('already exists');
    });

    it('should accept optional fields', async () => {
      const res = await POST(createRequest('POST', '/api/admin/distributors', {
        ...validDistributor,
        phone: '010-9999-8888',
        region: '서울',
        notes: '테스트 메모',
      }));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
