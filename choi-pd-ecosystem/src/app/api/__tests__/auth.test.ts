/**
 * @jest-environment node
 */

/**
 * Integration tests for Authentication API endpoints
 * Tests login, logout, me, and password change functionality
 */

// Mock jose module
jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock-jwt-token'),
  })),
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
  },
}));

// Mock db
const mockDbSelect = jest.fn();
const mockDbInsert = jest.fn();
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => mockDbSelect()),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => mockDbInsert()),
    })),
  },
}));

// Mock schema (just need the table references)
jest.mock('@/lib/db/schema', () => ({
  adminUsers: { username: 'username' },
  loginAttempts: {},
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
}));

// Set JWT_SECRET for tests
process.env.JWT_SECRET = 'test-secret-key-for-unit-tests-only';

import { POST as loginPOST } from '../auth/login/route';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

const mockBcryptCompare = bcrypt.compare as jest.Mock;

function createRequest(body: Record<string, unknown>, method = 'POST'): NextRequest {
  return new NextRequest(new URL('http://localhost:3011/api/auth/login'), {
    method,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

// Ensure dev mode is off for most tests
const originalDevMode = process.env.NEXT_PUBLIC_DEV_MODE;

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.NEXT_PUBLIC_DEV_MODE;
  mockDbInsert.mockResolvedValue(undefined);
});

afterAll(() => {
  if (originalDevMode !== undefined) {
    process.env.NEXT_PUBLIC_DEV_MODE = originalDevMode;
  }
});

describe('Authentication API', () => {
  describe('POST /api/auth/login', () => {
    it('should return 400 when username is missing', async () => {
      const req = createRequest({ password: 'test' });
      const res = await loginPOST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('required');
    });

    it('should return 400 when password is missing', async () => {
      const req = createRequest({ username: 'admin' });
      const res = await loginPOST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 401 for non-existent user', async () => {
      mockDbSelect.mockResolvedValue([]);

      const req = createRequest({ username: 'wrong', password: 'wrong' });
      const res = await loginPOST(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid');
    });

    it('should return 401 for wrong password', async () => {
      mockDbSelect.mockResolvedValue([{
        id: 1,
        username: 'admin',
        password: '$2a$10$hashedpassword',
        role: 'superadmin',
      }]);
      mockBcryptCompare.mockResolvedValue(false);

      const req = createRequest({ username: 'admin', password: 'wrongpass' });
      const res = await loginPOST(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid');
    });

    it('should return 200 with JWT token for valid admin credentials', async () => {
      mockDbSelect.mockResolvedValue([{
        id: 1,
        username: 'admin',
        password: '$2a$10$hashedpassword',
        role: 'superadmin',
      }]);
      mockBcryptCompare.mockResolvedValue(true);

      const req = createRequest({ username: 'admin', password: 'admin123' });
      const res = await loginPOST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toEqual({
        id: 1,
        username: 'admin',
        role: 'superadmin',
      });
    });

    it('should set httpOnly cookie on successful login', async () => {
      mockDbSelect.mockResolvedValue([{
        id: 1,
        username: 'admin',
        password: '$2a$10$hashedpassword',
        role: 'superadmin',
      }]);
      mockBcryptCompare.mockResolvedValue(true);

      const req = createRequest({ username: 'admin', password: 'admin123' });
      const res = await loginPOST(req);

      const setCookie = res.headers.get('set-cookie');
      expect(setCookie).toContain('admin-token');
      expect(setCookie).toContain('HttpOnly');
    });

    it('should record login attempts on failure', async () => {
      mockDbSelect.mockResolvedValue([]);

      const req = createRequest({ username: 'hacker', password: 'guess' });
      await loginPOST(req);

      // loginAttempts insert should have been called
      expect(mockDbInsert).toHaveBeenCalled();
    });

    it('should record login attempts on success', async () => {
      mockDbSelect.mockResolvedValue([{
        id: 1,
        username: 'admin',
        password: '$2a$10$hashedpassword',
        role: 'superadmin',
      }]);
      mockBcryptCompare.mockResolvedValue(true);

      const req = createRequest({ username: 'admin', password: 'admin123' });
      await loginPOST(req);

      expect(mockDbInsert).toHaveBeenCalled();
    });
  });

  describe('Login validation rules', () => {
    it('should reject empty string credentials', async () => {
      const req = createRequest({ username: '', password: '' });
      const res = await loginPOST(req);

      expect(res.status).toBe(400);
    });

    it('should handle malformed JSON gracefully', async () => {
      const req = new NextRequest(new URL('http://localhost:3011/api/auth/login'), {
        method: 'POST',
        body: 'not-json',
        headers: { 'Content-Type': 'application/json' },
      });
      const res = await loginPOST(req);

      expect(res.status).toBe(500);
    });
  });

  describe('Dev mode bypass', () => {
    it('should bypass auth when NEXT_PUBLIC_DEV_MODE is true', async () => {
      process.env.NEXT_PUBLIC_DEV_MODE = 'true';

      const req = createRequest({ username: 'anything', password: 'anything' });
      const res = await loginPOST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.username).toBe('dev-admin');
    });
  });
});
