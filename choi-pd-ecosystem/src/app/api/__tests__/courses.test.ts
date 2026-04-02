/**
 * @jest-environment node
 */

/**
 * Tests for Courses API endpoint
 * Education content listing - core business feature
 */

jest.mock('@/lib/db', () => ({
  db: {
    query: {
      courses: {
        findMany: jest.fn().mockResolvedValue([
          { id: 1, title: '스마트폰 창업 기초', type: 'online', published: true, tenantId: 1 },
          { id: 2, title: 'B2B 마케팅 실전', type: 'b2b', published: true, tenantId: 1 },
        ]),
      },
    },
  },
}));

jest.mock('@/lib/tenant/context', () => ({
  getTenantIdFromRequest: jest.fn().mockReturnValue(1),
}));

import { GET } from '../courses/route';
import { NextRequest } from 'next/server';

function createCoursesRequest(queryString = ''): NextRequest {
  return new NextRequest(new URL(`http://localhost:3011/api/courses${queryString}`));
}

describe('Courses API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/courses', () => {
    it('should return course list with success response', async () => {
      const req = createCoursesRequest();
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('should return courses with correct structure', async () => {
      const req = createCoursesRequest();
      const res = await GET(req);
      const data = await res.json();

      const course = data.data[0];
      expect(course).toHaveProperty('id');
      expect(course).toHaveProperty('title');
      expect(course).toHaveProperty('type');
    });

    it('should accept type filter parameter', async () => {
      const req = createCoursesRequest('?type=online');
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      const { db } = require('@/lib/db');
      db.query.courses.findMany.mockRejectedValueOnce(new Error('DB error'));

      const req = createCoursesRequest();
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});
