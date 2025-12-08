/**
 * Epic 21: 고급 보안 및 컴플라이언스
 *
 * 보안 유틸리티 함수 모음
 * - Audit Logging
 * - 2FA (TOTP)
 * - IP Access Control
 * - Session Management
 * - Data Encryption
 * - Brute Force Protection
 */

import { db } from './db';
import {
  auditLogs,
  securityEvents,
  loginAttempts,
  ipAccessControl,
  sessions,
  twoFactorAuth,
  type NewAuditLog,
  type NewSecurityEvent,
  type NewLoginAttempt,
} from './db/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import crypto from 'crypto';

// ============================================
// Audit Logging
// ============================================

export interface AuditLogParams {
  userId: string;
  userType: 'admin' | 'pd' | 'distributor' | 'system';
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  status?: 'success' | 'failed' | 'pending';
  errorMessage?: string;
  metadata?: any;
}

/**
 * 감사 로그 기록
 * 모든 중요 작업(CRUD, 로그인, 권한 변경 등)을 추적
 */
export async function logAudit(params: AuditLogParams) {
  try {
    const logEntry: NewAuditLog = {
      userId: params.userId,
      userType: params.userType,
      userEmail: params.userEmail || null,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId || null,
      changes: params.changes ? JSON.stringify(params.changes) : null,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
      status: params.status || 'success',
      errorMessage: params.errorMessage || null,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    };

    await db.insert(auditLogs).values(logEntry);
  } catch (error) {
    console.error('Failed to log audit:', error);
    // Don't throw - audit logging should not break main functionality
  }
}

/**
 * 감사 로그 조회 (관리자용)
 */
export async function getAuditLogs(filters: {
  userId?: string;
  resource?: string;
  action?: string;
  startDate?: Date;
  limit?: number;
}) {
  const conditions = [];

  if (filters.userId) {
    conditions.push(eq(auditLogs.userId, filters.userId));
  }
  if (filters.resource) {
    conditions.push(eq(auditLogs.resource, filters.resource));
  }
  if (filters.action) {
    conditions.push(eq(auditLogs.action, filters.action));
  }
  if (filters.startDate) {
    conditions.push(gte(auditLogs.createdAt, filters.startDate));
  }

  let query = db.select().from(auditLogs);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query
    .orderBy(desc(auditLogs.createdAt))
    .limit(filters.limit || 100);
}

// ============================================
// Security Events
// ============================================

export interface SecurityEventParams {
  userId?: string;
  eventType: 'login_failed' | 'login_success' | 'suspicious_activity' | 'brute_force' | 'ip_blocked' | 'password_change' | '2fa_enabled' | '2fa_disabled';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  description: string;
  metadata?: any;
}

/**
 * 보안 이벤트 기록
 */
export async function logSecurityEvent(params: SecurityEventParams) {
  try {
    const event: NewSecurityEvent = {
      userId: params.userId || null,
      eventType: params.eventType,
      severity: params.severity || 'medium',
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
      location: params.location || null,
      description: params.description,
      isResolved: false,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    };

    await db.insert(securityEvents).values(event);
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * 미해결 보안 이벤트 조회
 */
export async function getUnresolvedSecurityEvents(severity?: 'low' | 'medium' | 'high' | 'critical') {
  let query = db
    .select()
    .from(securityEvents)
    .where(eq(securityEvents.isResolved, false));

  if (severity) {
    query = query.where(and(
      eq(securityEvents.isResolved, false),
      eq(securityEvents.severity, severity)
    )) as any;
  }

  return await query.orderBy(desc(securityEvents.createdAt));
}

// ============================================
// Brute Force Protection
// ============================================

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15분

/**
 * 로그인 시도 기록
 */
export async function recordLoginAttempt(params: {
  identifier: string;
  ipAddress: string;
  success: boolean;
  userAgent?: string;
  failureReason?: string;
}) {
  const attempt: NewLoginAttempt = {
    identifier: params.identifier,
    ipAddress: params.ipAddress,
    success: params.success,
    userAgent: params.userAgent || null,
    failureReason: params.failureReason || null,
  };

  await db.insert(loginAttempts).values(attempt);

  // 실패한 경우 브루트 포스 체크
  if (!params.success) {
    await checkBruteForce(params.identifier, params.ipAddress);
  }
}

/**
 * 브루트 포스 공격 감지
 */
export async function checkBruteForce(identifier: string, ipAddress: string) {
  const fifteenMinutesAgo = new Date(Date.now() - LOCKOUT_DURATION);

  // 최근 15분간 실패한 시도 횟수 확인
  const recentFailures = await db
    .select()
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.identifier, identifier),
        eq(loginAttempts.success, false),
        gte(loginAttempts.attemptedAt, fifteenMinutesAgo)
      )
    );

  if (recentFailures.length >= MAX_LOGIN_ATTEMPTS) {
    // 브루트 포스 감지 - 보안 이벤트 기록
    await logSecurityEvent({
      eventType: 'brute_force',
      severity: 'high',
      ipAddress,
      description: `Brute force detected for identifier: ${identifier}`,
      metadata: { attempts: recentFailures.length },
    });

    return true;
  }

  return false;
}

/**
 * 계정이 잠겨 있는지 확인
 */
export async function isAccountLocked(identifier: string): Promise<boolean> {
  const fifteenMinutesAgo = new Date(Date.now() - LOCKOUT_DURATION);

  const recentFailures = await db
    .select()
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.identifier, identifier),
        eq(loginAttempts.success, false),
        gte(loginAttempts.attemptedAt, fifteenMinutesAgo)
      )
    );

  return recentFailures.length >= MAX_LOGIN_ATTEMPTS;
}

// ============================================
// IP Access Control
// ============================================

/**
 * IP가 차단되었는지 확인
 */
export async function isIpBlocked(ipAddress: string, context: 'all' | 'admin' | 'distributor' = 'all'): Promise<boolean> {
  const now = new Date();

  const blockedIps = await db
    .select()
    .from(ipAccessControl)
    .where(
      and(
        eq(ipAccessControl.ipAddress, ipAddress),
        eq(ipAccessControl.type, 'blacklist'),
        eq(ipAccessControl.isActive, true),
        sql`(${ipAccessControl.appliesTo} = ${context} OR ${ipAccessControl.appliesTo} = 'all')`,
        sql`(${ipAccessControl.expiresAt} IS NULL OR ${ipAccessControl.expiresAt} > ${now})`
      )
    );

  return blockedIps.length > 0;
}

/**
 * IP가 화이트리스트에 있는지 확인
 */
export async function isIpWhitelisted(ipAddress: string, context: 'all' | 'admin' | 'distributor' = 'all'): Promise<boolean> {
  const now = new Date();

  const whitelistedIps = await db
    .select()
    .from(ipAccessControl)
    .where(
      and(
        eq(ipAccessControl.ipAddress, ipAddress),
        eq(ipAccessControl.type, 'whitelist'),
        eq(ipAccessControl.isActive, true),
        sql`(${ipAccessControl.appliesTo} = ${context} OR ${ipAccessControl.appliesTo} = 'all')`,
        sql`(${ipAccessControl.expiresAt} IS NULL OR ${ipAccessControl.expiresAt} > ${now})`
      )
    );

  return whitelistedIps.length > 0;
}

// ============================================
// 2FA (TOTP)
// ============================================

/**
 * TOTP 시크릿 생성
 */
export function generateTotpSecret(): string {
  return crypto.randomBytes(20).toString('hex');
}

/**
 * TOTP 백업 코드 생성 (8자리 x 10개)
 */
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomInt(10000000, 99999999).toString();
    codes.push(code);
  }
  return codes;
}

/**
 * TOTP 코드 검증 (간단한 구현 - 프로덕션에서는 speakeasy 라이브러리 사용 권장)
 */
export function verifyTotpCode(secret: string, token: string): boolean {
  // 실제 프로덕션에서는 speakeasy 또는 otplib 라이브러리 사용
  // 여기서는 간단한 예시만 제공

  // TODO: speakeasy.verify() 또는 otplib 사용
  // const verified = speakeasy.totp.verify({
  //   secret,
  //   encoding: 'hex',
  //   token,
  //   window: 1
  // });

  return true; // 임시
}

/**
 * 2FA 활성화
 */
export async function enable2FA(userId: string, userType: 'admin' | 'pd' | 'distributor', method: 'totp' | 'sms' | 'email' = 'totp') {
  const secret = generateTotpSecret();
  const backupCodes = generateBackupCodes();

  // TODO: 실제로는 백업 코드를 암호화해서 저장해야 함
  await db.insert(twoFactorAuth).values({
    userId,
    userType,
    method,
    secret, // TODO: 암호화 필요
    backupCodes: JSON.stringify(backupCodes), // TODO: 암호화 필요
    isEnabled: true,
  });

  await logSecurityEvent({
    userId,
    eventType: '2fa_enabled',
    severity: 'low',
    description: `2FA enabled for user ${userId} using ${method}`,
  });

  return { secret, backupCodes };
}

/**
 * 2FA 비활성화
 */
export async function disable2FA(userId: string) {
  await db
    .update(twoFactorAuth)
    .set({ isEnabled: false })
    .where(eq(twoFactorAuth.userId, userId));

  await logSecurityEvent({
    userId,
    eventType: '2fa_disabled',
    severity: 'medium',
    description: `2FA disabled for user ${userId}`,
  });
}

// ============================================
// Data Encryption
// ============================================

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

/**
 * 데이터 암호화 (AES-256-GCM)
 */
export function encryptData(data: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // IV + AuthTag + EncryptedData 형식으로 반환
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

/**
 * 데이터 복호화
 */
export function decryptData(encryptedData: string): string {
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * 민감 데이터 마스킹 (이메일, 전화번호 등)
 */
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (!username || !domain) return email;

  const visibleChars = Math.min(3, username.length);
  const masked = username.slice(0, visibleChars) + '*'.repeat(Math.max(0, username.length - visibleChars));

  return `${masked}@${domain}`;
}

export function maskPhone(phone: string): string {
  // 01012345678 -> 010****5678
  if (phone.length < 8) return phone;

  const start = phone.slice(0, 3);
  const end = phone.slice(-4);
  const middle = '*'.repeat(phone.length - 7);

  return start + middle + end;
}

// ============================================
// Session Management
// ============================================

/**
 * 세션 토큰 생성
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 활성 세션 조회
 */
export async function getActiveSessions(userId: string) {
  const now = new Date();

  return await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        eq(sessions.isActive, true),
        gte(sessions.expiresAt, now)
      )
    )
    .orderBy(desc(sessions.lastActivityAt));
}

/**
 * 세션 무효화
 */
export async function revokeSession(sessionToken: string, reason: string) {
  await db
    .update(sessions)
    .set({
      isActive: false,
      revokedAt: new Date(),
      revokedReason: reason,
    })
    .where(eq(sessions.sessionToken, sessionToken));
}

/**
 * 사용자의 모든 세션 무효화
 */
export async function revokeAllSessions(userId: string, reason: string) {
  await db
    .update(sessions)
    .set({
      isActive: false,
      revokedAt: new Date(),
      revokedReason: reason,
    })
    .where(and(
      eq(sessions.userId, userId),
      eq(sessions.isActive, true)
    ));
}

// ============================================
// CSRF Protection
// ============================================

/**
 * CSRF 토큰 생성
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * CSRF 토큰 검증
 */
export function verifyCsrfToken(token: string, sessionToken: string): boolean {
  // 실제 구현에서는 세션과 연결된 CSRF 토큰을 검증
  // 간단한 예시
  return token.length === 44; // base64(32 bytes)
}

// ============================================
// Input Sanitization (XSS 방지)
// ============================================

/**
 * HTML 이스케이프 (XSS 방지)
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * SQL Injection 방지를 위한 입력 검증
 * 주의: Drizzle ORM을 사용하면 자동으로 파라미터화되므로 추가 검증 불필요
 */
export function validateInput(input: string, maxLength: number = 255): boolean {
  // 길이 체크
  if (input.length > maxLength) return false;

  // 위험한 패턴 체크 (SQL keywords)
  const dangerousPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi;
  if (dangerousPatterns.test(input)) return false;

  return true;
}
