/**
 * 테넌트 멤버 관리 API
 *
 * POST /api/tenants/:id/members — 멤버 초대
 * GET  /api/tenants/:id/members — 멤버 목록
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tenantMembers, tenants } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getPlanLimits } from '@/lib/tenant/context';

type RouteParams = { params: Promise<{ id: string }> };

// 유효한 역할 목록
const VALID_ROLES = ['owner', 'admin', 'member', 'guest'] as const;

// POST /api/tenants/:id/members — 멤버 초대
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const tenantId = parseInt(id, 10);

    if (isNaN(tenantId)) {
      return NextResponse.json(
        { error: '유효하지 않은 테넌트 ID입니다.', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email, role, name } = body;

    // 필수 필드 검증
    if (!email) {
      return NextResponse.json(
        { error: '이메일은 필수입니다.', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // 역할 검증
    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: '유효하지 않은 역할입니다.', code: 'INVALID_ROLE' },
        { status: 400 }
      );
    }

    // 테넌트 존재 확인 및 플랜 제한 체크
    const tenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .get();

    if (!tenant) {
      return NextResponse.json(
        { error: '테넌트를 찾을 수 없습니다.', code: 'TENANT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // 플랜 제한 확인 (팀 멤버 수)
    const limits = getPlanLimits(tenant.plan);
    const currentMembers = await db
      .select()
      .from(tenantMembers)
      .where(and(
        eq(tenantMembers.tenantId, tenantId),
        eq(tenantMembers.status, 'active')
      ))
      .all();

    if (limits.maxTeamMembers !== Infinity && currentMembers.length >= limits.maxTeamMembers + 1) {
      // +1은 소유자 포함
      return NextResponse.json(
        { error: '팀 멤버 수 한도를 초과했습니다. 플랜을 업그레이드하세요.', code: 'PLAN_LIMIT_EXCEEDED' },
        { status: 403 }
      );
    }

    // 중복 초대 확인 (이메일 기준)
    const existing = await db
      .select()
      .from(tenantMembers)
      .where(and(
        eq(tenantMembers.tenantId, tenantId),
        eq(tenantMembers.email, email)
      ))
      .get();

    if (existing) {
      return NextResponse.json(
        { error: '이미 등록된 멤버입니다.', code: 'MEMBER_ALREADY_EXISTS' },
        { status: 409 }
      );
    }

    // 멤버 초대 생성
    const invitedBy = request.headers.get('x-clerk-user-id') || 'dev_user';
    const newMember = await db.insert(tenantMembers).values({
      tenantId,
      clerkUserId: `pending_${email}`, // Clerk 가입 전이면 placeholder
      email,
      name: name || null,
      role: role || 'member',
      status: 'invited',
      invitedBy,
      invitedAt: new Date(),
    }).returning().get();

    return NextResponse.json({
      id: newMember.id,
      email: newMember.email,
      role: newMember.role,
      status: newMember.status,
      invitedAt: newMember.invitedAt,
    }, { status: 201 });

  } catch (error) {
    console.error('멤버 초대 실패:', error);
    return NextResponse.json(
      { error: '멤버 초대에 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// GET /api/tenants/:id/members — 멤버 목록 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const tenantId = parseInt(id, 10);

    if (isNaN(tenantId)) {
      return NextResponse.json(
        { error: '유효하지 않은 테넌트 ID입니다.', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const members = await db
      .select()
      .from(tenantMembers)
      .where(eq(tenantMembers.tenantId, tenantId))
      .orderBy(desc(tenantMembers.createdAt))
      .all();

    return NextResponse.json({
      members: members.map(m => ({
        id: m.id,
        clerkUserId: m.clerkUserId,
        email: m.email,
        name: m.name,
        role: m.role,
        status: m.status,
        lastActiveAt: m.lastActiveAt,
        joinedAt: m.joinedAt,
        invitedAt: m.invitedAt,
      })),
      total: members.length,
    });

  } catch (error) {
    console.error('멤버 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '멤버 목록 조회에 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
