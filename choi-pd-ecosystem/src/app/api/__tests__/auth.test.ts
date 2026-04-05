/**
 * @jest-environment node
 */

/**
 * Integration tests for Authentication API endpoints
 * Tests login, logout, me, and password change functionality
 *
 * ─────────────────────────────────────────────────────────────
 * TEST FIXTURE NOTICE
 * All credentials in this file are synthetic mock values used
 * solely for unit testing. They do NOT reflect real credentials
 * and must NEVER be used in production environments.
 * ─────────────────────────────────────────────────────────────
 */

// ─── Test Fixture Constants ───────────────────────────────────
// These are deliberately fake values for test isolation.
// Changing them here won't affect production security.

/** Fake bcrypt hash stored in the mock DB row — not a real hash */
const TEST_BCRYPT_HASH = '$2y$10$testFixtureHashNotRealXXXXXXXXXXXXXXXXXXXXX';

/** Correct password submitted by the test client (plain text, never real) */
const TEST_CORRECT_PASSWORD = 'test-correct-password-fixture';

/** Wrong password to verify rejection logic */
const TEST_WRONG_PASSWORD = 'test-wrong-password-fixture';

/** Non-existent username to verify 401 path */
const TEST_NONEXISTENT_USER = 'test-nonexistent-user-fixture';

/** JWT secret used only during test execution — not the production secret */
const TEST_JWT_SECRET = 'test-jwt-secret-fixture-for-unit-tests-only-32chars!';

// ─── Mocks ────────────────────────────────────────────────────

// Mock jose module
jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock-jwt-token-fixture'),
  })),
}));

// Mock bcryptjs — compare() result is controlled per test via mockResolvedValue
jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
  },
}));

// Mock db — select/insert are controlled per test via mockDbSelect / mockDbInsert
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

// Mock schema (table reference objects only — no real DB columns needed)
jest.mock('@/lib/db/schema', () => ({
  adminUsers: { username: 'username' },
  loginAttempts: {},
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
}));

// Inject test JWT_SECRET — overridden before each test run
process.env.JWT_SECRET = TEST_JWT_SECRET;

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

      const req = createRequest({ username: TEST_NONEXISTENT_USER, password: TEST_WRONG_PASSWORD });
      const res = await loginPOST(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid');
    });

    it('should return 401 for wrong password', async () => {
      // Mock DB returns a user row; bcrypt compare returns false (wrong password)
      mockDbSelect.mockResolvedValue([{
        id: 1,
        username: 'admin',
        password: TEST_BCRYPT_HASH, // fixture hash — not a real bcrypt hash
        role: 'superadmin',
      }]);
      mockBcryptCompare.mockResolvedValue(false);

      const req = createRequest({ username: 'admin', password: TEST_WRONG_PASSWORD });
      const res = await loginPOST(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid');
    });

    it('should return 200 with JWT token for valid admin credentials', async () => {
      // Mock DB returns a user row; bcrypt compare returns true (correct password)
      mockDbSelect.mockResolvedValue([{
        id: 1,
        username: 'admin',
        password: TEST_BCRYPT_HASH, // fixture hash — not a real bcrypt hash
        role: 'superadmin',
      }]);
      mockBcryptCompare.mockResolvedValue(true);

      const req = createRequest({ username: 'admin', password: TEST_CORRECT_PASSWORD });
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
        password: TEST_BCRYPT_HASH, // fixture hash — not a real bcrypt hash
        role: 'superadmin',
      }]);
      mockBcryptCompare.mockResolvedValue(true);

      const req = createRequest({ username: 'admin', password: TEST_CORRECT_PASSWORD });
      const res = await loginPOST(req);

      const setCookie = res.headers.get('set-cookie');
      expect(setCookie).toContain('admin-token');
      expect(setCookie).toContain('HttpOnly');
    });

    it('should record login attempts on failure', async () => {
      mockDbSelect.mockResolvedValue([]);

      const req = createRequest({ username: TEST_NONEXISTENT_USER, password: TEST_WRONG_PASSWORD });
      await loginPOST(req);

      // loginAttempts insert should have been called
      expect(mockDbInsert).toHaveBeenCalled();
    });

    it('should record login attempts on success', async () => {
      mockDbSelect.mockResolvedValue([{
        id: 1,
        username: 'admin',
        password: TEST_BCRYPT_HASH, // fixture hash — not a real bcrypt hash
        role: 'superadmin',
      }]);
      mockBcryptCompare.mockResolvedValue(true);

      const req = createRequest({ username: 'admin', password: TEST_CORRECT_PASSWORD });
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
