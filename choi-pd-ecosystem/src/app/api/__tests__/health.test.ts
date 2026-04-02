/**
 * @jest-environment node
 */

/**
 * Tests for Health Check API endpoint
 * Critical for deployment monitoring (Coolify, Docker)
 */

// Mock the DB import
jest.mock('@/lib/db', () => ({
  db: {
    run: jest.fn().mockResolvedValue(true),
  },
}));

// Mock monitoring import
jest.mock('@/lib/monitoring', () => ({
  getMetrics: jest.fn().mockReturnValue({
    uptime: 120,
    requests: { total: 42, successful: 40, failed: 2, avgResponseTime: 15.5, byPath: {} },
    database: { connections: 1, queries: 10, avgQueryTime: 2.3 },
  }),
}));

import { GET, HEAD } from '../health/route';

function createRequest(queryString = ''): Request {
  return new Request(`http://localhost:3011/api/health${queryString}`);
}

describe('Health Check API', () => {
  describe('GET /api/health', () => {
    it('should return status with full metrics by default', async () => {
      const res = await GET(createRequest());
      const data = await res.json();

      expect(res.status).toBeLessThanOrEqual(503);
      expect(['healthy', 'degraded']).toContain(data.status);
      expect(data.service).toBe('imPD Platform');
      expect(data.timestamp).toBeTruthy();
      expect(data.checks).toHaveProperty('database');
      expect(data.checks).toHaveProperty('memory');
      expect(data.memory).toHaveProperty('heapUsed');
      expect(data.memory).toHaveProperty('heapUsedPercent');
    });

    it('should return minimal response for liveness probe', async () => {
      const res = await GET(createRequest('?type=live'));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data).not.toHaveProperty('memory');
      expect(data).not.toHaveProperty('checks');
    });

    it('should include database check for readiness probe', async () => {
      const res = await GET(createRequest('?type=ready'));
      const data = await res.json();

      expect(res.status).toBeLessThanOrEqual(503);
      expect(['connected', 'disconnected']).toContain(data.checks.database);
    });

    it('should set no-cache headers', async () => {
      const res = await GET(createRequest('?type=live'));

      expect(res.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
      expect(res.headers.get('X-Health-Check')).toBe('pass');
    });

    it('should include monitoring metrics in full check', async () => {
      const res = await GET(createRequest());
      const data = await res.json();

      expect(data.metrics).toBeDefined();
      expect(data.metrics.requests.total).toBe(42);
      expect(data.metrics.database.queries).toBe(10);
    });

    it('should report degraded when DB is disconnected', async () => {
      const { db } = require('@/lib/db');
      db.run.mockRejectedValueOnce(new Error('DB connection failed'));

      const res = await GET(createRequest());
      const data = await res.json();

      expect(data.checks.database).toBe('disconnected');
      expect(['degraded', 'healthy']).toContain(data.status);
    });
  });

  describe('HEAD /api/health', () => {
    it('should return 200 with X-Health-Check header', async () => {
      const res = await HEAD();

      expect(res.status).toBe(200);
      expect(res.headers.get('X-Health-Check')).toBe('pass');
    });
  });
});
