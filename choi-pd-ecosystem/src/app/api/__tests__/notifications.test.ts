/**
 * @jest-environment node
 */

/**
 * Tests for Notifications API
 * GET (list + filter), POST (create), PATCH (mark read)
 */

const mockAll = jest.fn().mockResolvedValue([]);
const mockGet = jest.fn().mockResolvedValue({ count: 0 });
const mockRun = jest.fn().mockResolvedValue(undefined);
const mockReturningGet = jest.fn().mockResolvedValue({ id: 1, title: 'Test', userType: 'admin' });

jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              all: (...args: any[]) => (global as any).__mockAll(...args),
            }),
          }),
          get: (...args: any[]) => (global as any).__mockGet(...args),
        }),
      }),
    }),
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockReturnValue({
          get: (...args: any[]) => (global as any).__mockReturningGet(...args),
        }),
      }),
    }),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          run: (...args: any[]) => (global as any).__mockRun(...args),
        }),
      }),
    }),
  },
}));

jest.mock('@/lib/tenant/context', () => ({
  getTenantIdFromRequest: jest.fn().mockReturnValue(1),
}));

jest.mock('@/lib/tenant/query-helpers', () => ({
  tenantFilter: jest.fn().mockReturnValue(true),
  withTenantId: jest.fn((data: any, tenantId: number) => ({ ...data, tenantId })),
}));

import { GET, POST, PATCH } from '../notifications/route';
import { NextRequest } from 'next/server';

beforeAll(() => {
  (global as any).__mockAll = mockAll;
  (global as any).__mockGet = mockGet;
  (global as any).__mockReturningGet = mockReturningGet;
  (global as any).__mockRun = mockRun;
});

function createRequest(method: string, url: string, body?: Record<string, unknown>): NextRequest {
  const opts: any = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  return new NextRequest(new URL(url, 'http://localhost:3011'), opts);
}

describe('Notifications API', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/notifications', () => {
    it('should return notifications list', async () => {
      mockAll.mockResolvedValueOnce([{ id: 1, title: 'Welcome' }]);
      const res = await GET(createRequest('GET', '/api/notifications?userType=admin'));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('notifications');
      expect(data).toHaveProperty('unreadCount');
    });
  });

  describe('POST /api/notifications', () => {
    it('should create notification with valid data', async () => {
      const res = await POST(createRequest('POST', '/api/notifications', {
        userType: 'admin',
        category: 'system',
        title: '시스템 알림',
        message: '새 수요자가 등록되었습니다.',
      }));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const res = await POST(createRequest('POST', '/api/notifications', {
        userType: 'admin',
      }));
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing');
    });
  });

  describe('PATCH /api/notifications', () => {
    it('should mark specific notifications as read', async () => {
      const res = await PATCH(createRequest('PATCH', '/api/notifications', {
        notificationIds: [1, 2, 3],
      }));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('3');
    });

    it('should mark all as read for user type', async () => {
      const res = await PATCH(createRequest('PATCH', '/api/notifications', {
        markAllAsRead: true,
        userType: 'admin',
      }));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toContain('All');
    });

    it('should reject when no IDs provided', async () => {
      const res = await PATCH(createRequest('PATCH', '/api/notifications', {}));
      const data = await res.json();

      expect(res.status).toBe(400);
    });
  });
});
