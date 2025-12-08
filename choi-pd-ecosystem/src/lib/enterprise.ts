/**
 * Epic 25: 엔터프라이즈 기능 및 화이트라벨
 *
 * 엔터프라이즈 유틸리티 함수 모음
 * - Organization Management
 * - White-label Branding
 * - Team Management
 * - CSV Bulk Import
 * - SLA Monitoring
 */

import { db } from './db';
import {
  organizations,
  organizationBranding,
  teams,
  organizationMembers,
  ssoConfigurations,
  supportTickets,
  supportTicketComments,
  slaMetrics,
  userBulkImportLogs,
  type NewOrganization,
  type NewOrganizationBranding,
  type NewTeam,
  type NewOrganizationMember,
  type NewSupportTicket,
  type NewSlaMetric,
} from './db/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { logAudit } from './security';

// ============================================
// Organization Management
// ============================================

/**
 * 조직 생성
 */
export async function createOrganization(data: Omit<NewOrganization, 'createdAt' | 'updatedAt'>) {
  // Slug 자동 생성 (이미 제공된 경우 사용)
  const slug = data.slug || slugify(data.name);

  const [organization] = await db
    .insert(organizations)
    .values({
      ...data,
      slug,
    })
    .returning();

  // 기본 브랜딩 설정 생성
  await db.insert(organizationBranding).values({
    organizationId: organization.id,
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#10b981',
    fontFamily: 'Inter',
  });

  // Audit log
  await logAudit({
    userId: 'system',
    userType: 'system',
    action: 'CREATE',
    resource: 'organization',
    resourceId: organization.id.toString(),
    changes: { name: data.name, slug },
  });

  return organization;
}

/**
 * 조직 조회
 */
export async function getOrganization(organizationId: number) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId));

  if (!org) return null;

  // 브랜딩 정보도 함께 가져오기
  const [branding] = await db
    .select()
    .from(organizationBranding)
    .where(eq(organizationBranding.organizationId, organizationId));

  return { ...org, branding };
}

/**
 * 조직 slug로 조회
 */
export async function getOrganizationBySlug(slug: string) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, slug));

  if (!org) return null;

  const [branding] = await db
    .select()
    .from(organizationBranding)
    .where(eq(organizationBranding.organizationId, org.id));

  return { ...org, branding };
}

/**
 * 조직 목록 조회
 */
export async function getOrganizations(filters?: {
  status?: 'trial' | 'active' | 'suspended' | 'cancelled';
  plan?: 'basic' | 'premium' | 'enterprise' | 'custom';
}) {
  let query = db.select().from(organizations);

  if (filters?.status) {
    query = query.where(eq(organizations.subscriptionStatus, filters.status)) as any;
  }

  return await query.orderBy(desc(organizations.createdAt));
}

/**
 * 조직 업데이트
 */
export async function updateOrganization(
  organizationId: number,
  data: Partial<Omit<NewOrganization, 'id' | 'createdAt'>>,
  updatedBy: string
) {
  await db
    .update(organizations)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, organizationId));

  await logAudit({
    userId: updatedBy,
    userType: 'admin',
    action: 'UPDATE',
    resource: 'organization',
    resourceId: organizationId.toString(),
    changes: data,
  });
}

// ============================================
// White-label Branding
// ============================================

/**
 * 브랜딩 설정 조회
 */
export async function getBranding(organizationId: number) {
  const [branding] = await db
    .select()
    .from(organizationBranding)
    .where(eq(organizationBranding.organizationId, organizationId));

  // Parse JSON fields
  if (branding && branding.metadata) {
    return {
      ...branding,
      metadata: JSON.parse(branding.metadata),
    };
  }

  return branding;
}

/**
 * 브랜딩 설정 업데이트
 */
export async function updateBranding(
  organizationId: number,
  data: Partial<Omit<NewOrganizationBranding, 'id' | 'organizationId' | 'createdAt'>>,
  updatedBy: string
) {
  const updateData: any = {
    ...data,
    updatedAt: new Date(),
  };

  // Metadata가 객체인 경우 JSON 문자열로 변환
  if (data.metadata && typeof data.metadata === 'object') {
    updateData.metadata = JSON.stringify(data.metadata);
  }

  await db
    .update(organizationBranding)
    .set(updateData)
    .where(eq(organizationBranding.organizationId, organizationId));

  await logAudit({
    userId: updatedBy,
    userType: 'admin',
    action: 'UPDATE',
    resource: 'organization_branding',
    resourceId: organizationId.toString(),
    changes: data,
  });
}

/**
 * CSS 변수 생성 (브랜딩 색상 적용)
 */
export function generateCssVariables(branding: any): string {
  return `
    :root {
      --primary-color: ${branding.primaryColor || '#3b82f6'};
      --secondary-color: ${branding.secondaryColor || '#8b5cf6'};
      --accent-color: ${branding.accentColor || '#10b981'};
      --font-family: ${branding.fontFamily || 'Inter'}, sans-serif;
    }
  `;
}

// ============================================
// Team Management
// ============================================

/**
 * 팀 생성
 */
export async function createTeam(data: Omit<NewTeam, 'createdAt' | 'updatedAt'>, createdBy: string) {
  const [team] = await db.insert(teams).values(data).returning();

  await logAudit({
    userId: createdBy,
    userType: 'admin',
    action: 'CREATE',
    resource: 'team',
    resourceId: team.id.toString(),
    changes: { name: data.name, organizationId: data.organizationId },
  });

  return team;
}

/**
 * 조직의 팀 목록 조회 (계층 구조 포함)
 */
export async function getTeams(organizationId: number) {
  const allTeams = await db
    .select()
    .from(teams)
    .where(
      and(
        eq(teams.organizationId, organizationId),
        eq(teams.isActive, true)
      )
    );

  // 계층 구조 구성
  const teamMap = new Map(allTeams.map(team => [team.id, { ...team, children: [] as any[] }]));
  const rootTeams: any[] = [];

  allTeams.forEach(team => {
    if (team.parentTeamId) {
      const parent = teamMap.get(team.parentTeamId);
      if (parent) {
        parent.children.push(teamMap.get(team.id));
      }
    } else {
      rootTeams.push(teamMap.get(team.id));
    }
  });

  return rootTeams;
}

/**
 * 팀 멤버 추가
 */
export async function addTeamMember(
  organizationId: number,
  userId: string,
  teamId: number,
  role: 'owner' | 'admin' | 'manager' | 'member' | 'guest',
  invitedBy: string
) {
  const memberData: NewOrganizationMember = {
    organizationId,
    userId,
    userEmail: '', // TODO: Clerk에서 가져오기
    role,
    teamId,
    invitedBy,
    invitedAt: new Date(),
    status: 'invited',
  };

  const [member] = await db.insert(organizationMembers).values(memberData).returning();

  await logAudit({
    userId: invitedBy,
    userType: 'admin',
    action: 'CREATE',
    resource: 'organization_member',
    resourceId: member.id.toString(),
    changes: { userId, teamId, role },
  });

  return member;
}

/**
 * 조직 멤버 목록 조회
 */
export async function getOrganizationMembers(organizationId: number, filters?: {
  teamId?: number;
  role?: string;
  status?: string;
}) {
  let query = db
    .select()
    .from(organizationMembers)
    .where(eq(organizationMembers.organizationId, organizationId));

  if (filters?.teamId) {
    query = query.where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.teamId, filters.teamId)
      )
    ) as any;
  }

  return await query.orderBy(desc(organizationMembers.createdAt));
}

// ============================================
// CSV Bulk Import
// ============================================

interface CsvRow {
  email: string;
  name?: string;
  role?: string;
  teamId?: number;
  jobTitle?: string;
  department?: string;
}

/**
 * CSV 파일에서 사용자 대량 임포트
 */
export async function bulkImportUsers(
  organizationId: number,
  csvData: CsvRow[],
  importedBy: string,
  fileName: string
) {
  const totalRows = csvData.length;
  let successCount = 0;
  let failureCount = 0;
  const errors: string[] = [];
  const results: any[] = [];

  // 로그 생성
  const [importLog] = await db
    .insert(userBulkImportLogs)
    .values({
      organizationId,
      importedBy,
      fileName,
      totalRows,
      status: 'processing',
      startedAt: new Date(),
    })
    .returning();

  try {
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];

      try {
        // 이메일 검증
        if (!row.email || !isValidEmail(row.email)) {
          throw new Error('Invalid email');
        }

        // 중복 확인
        const existing = await db
          .select()
          .from(organizationMembers)
          .where(
            and(
              eq(organizationMembers.organizationId, organizationId),
              eq(organizationMembers.userEmail, row.email)
            )
          );

        if (existing.length > 0) {
          throw new Error('User already exists');
        }

        // 멤버 추가
        await db.insert(organizationMembers).values({
          organizationId,
          userId: `temp-${Date.now()}-${i}`, // TODO: Clerk 연동 시 실제 userId
          userEmail: row.email,
          userName: row.name || null,
          role: (row.role as any) || 'member',
          teamId: row.teamId || null,
          jobTitle: row.jobTitle || null,
          department: row.department || null,
          invitedBy: importedBy,
          invitedAt: new Date(),
          status: 'invited',
        });

        successCount++;
        results.push({ row: i + 1, email: row.email, status: 'success' });
      } catch (error: any) {
        failureCount++;
        errors.push(`Row ${i + 1}: ${error.message}`);
        results.push({ row: i + 1, email: row.email, status: 'failed', error: error.message });
      }
    }

    // 로그 업데이트
    await db
      .update(userBulkImportLogs)
      .set({
        successCount,
        failureCount,
        status: 'completed',
        errors: JSON.stringify(errors),
        results: JSON.stringify(results),
        completedAt: new Date(),
      })
      .where(eq(userBulkImportLogs.id, importLog.id));

    return { successCount, failureCount, errors, results };
  } catch (error: any) {
    // 치명적 오류 발생 시
    await db
      .update(userBulkImportLogs)
      .set({
        status: 'failed',
        errors: JSON.stringify([error.message]),
        completedAt: new Date(),
      })
      .where(eq(userBulkImportLogs.id, importLog.id));

    throw error;
  }
}

// ============================================
// Support Tickets
// ============================================

/**
 * 지원 티켓 생성
 */
export async function createSupportTicket(data: Omit<NewSupportTicket, 'createdAt' | 'updatedAt'>) {
  const [ticket] = await db.insert(supportTickets).values(data).returning();

  await logAudit({
    userId: data.createdBy,
    userType: 'admin',
    action: 'CREATE',
    resource: 'support_ticket',
    resourceId: ticket.id.toString(),
    changes: { subject: data.subject, category: data.category },
  });

  return ticket;
}

/**
 * 조직의 티켓 목록 조회
 */
export async function getSupportTickets(organizationId: number, filters?: {
  status?: string;
  priority?: string;
  category?: string;
}) {
  let query = db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.organizationId, organizationId));

  if (filters?.status) {
    query = query.where(
      and(
        eq(supportTickets.organizationId, organizationId),
        eq(supportTickets.status, filters.status as any)
      )
    ) as any;
  }

  return await query.orderBy(desc(supportTickets.createdAt));
}

/**
 * 티켓에 댓글 추가
 */
export async function addTicketComment(
  ticketId: number,
  authorId: string,
  authorEmail: string,
  authorName: string | null,
  authorType: 'customer' | 'support' | 'system',
  comment: string,
  isInternal: boolean = false
) {
  const [commentRecord] = await db
    .insert(supportTicketComments)
    .values({
      ticketId,
      authorId,
      authorEmail,
      authorName,
      authorType,
      comment,
      isInternal,
    })
    .returning();

  // 티켓 업데이트 시간 갱신
  await db
    .update(supportTickets)
    .set({ updatedAt: new Date() })
    .where(eq(supportTickets.id, ticketId));

  return commentRecord;
}

// ============================================
// SLA Monitoring
// ============================================

/**
 * SLA 메트릭 기록
 */
export async function recordSlaMetric(data: Omit<NewSlaMetric, 'createdAt'>) {
  const isViolation = data.actualValue < data.targetValue;

  const [metric] = await db
    .insert(slaMetrics)
    .values({
      ...data,
      isViolation,
    })
    .returning();

  // 위반 발생 시 알림
  if (isViolation) {
    await logAudit({
      userId: 'system',
      userType: 'system',
      action: 'SLA_VIOLATION',
      resource: 'sla_metric',
      resourceId: metric.id.toString(),
      changes: {
        metricType: data.metricType,
        target: data.targetValue,
        actual: data.actualValue,
      },
    });

    // TODO: 알림 발송 (이메일, Slack 등)
  }

  return metric;
}

/**
 * 조직의 SLA 메트릭 조회
 */
export async function getSlaMetrics(
  organizationId: number,
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
) {
  return await db
    .select()
    .from(slaMetrics)
    .where(
      and(
        eq(slaMetrics.organizationId, organizationId),
        eq(slaMetrics.period, period)
      )
    )
    .orderBy(desc(slaMetrics.periodStart));
}

/**
 * SLA 위반 조회
 */
export async function getSlaViolations(organizationId: number) {
  return await db
    .select()
    .from(slaMetrics)
    .where(
      and(
        eq(slaMetrics.organizationId, organizationId),
        eq(slaMetrics.isViolation, true)
      )
    )
    .orderBy(desc(slaMetrics.createdAt));
}

// ============================================
// Utility Functions
// ============================================

/**
 * 문자열을 URL-friendly slug로 변환
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // 공백과 언더스코어를 하이픈으로
    .replace(/[^\w\-가-힣]+/g, '') // 특수문자 제거 (한글 유지)
    .replace(/\-\-+/g, '-') // 연속된 하이픈 제거
    .replace(/^-+/, '') // 시작 하이픈 제거
    .replace(/-+$/, ''); // 끝 하이픈 제거
}

/**
 * 이메일 유효성 검사
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * CSV 파싱 (간단한 구현)
 */
export function parseCSV(csvText: string): CsvRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row);
  }

  return rows;
}
