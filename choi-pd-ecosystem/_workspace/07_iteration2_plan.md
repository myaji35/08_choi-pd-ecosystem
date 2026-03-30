# Iteration 2 Plan — QA 리뷰 기반 개선

## 배경

Iteration 1 결과:
- **QA 점수**: 72/100
- **구현 완료율**: 약 45%
- **필수 수정 5건 중 5건 해결 완료** (커밋 8c6b8d0)
- **권장 수정 8건 미해결**
- **기존 API 마이그레이션**: 6/~40개 (15%)
- **기존 테이블 tenantId**: 10/47개 (21%)
- **프론트엔드 페이지**: QA가 미존재로 판단 (파일 확인 필요)

## 목표

- QA 점수 **72 → 90+** 달성
- 구현 완료율 **45% → 85%+** 달성
- 프로덕션 배포 가능 상태 도달

---

## Sprint 1: 데이터 격리 완성 (최우선)

### 1-1. 기존 테이블 tenantId 추가 (37개)

**담당**: backend-dev

설계서(03_db_schema.md)에 명시된 47개 테이블 중 미완료 37개:

**그룹 A — SNS/콘텐츠 (즉시)**
- snsScheduledPosts, snsPostHistory
- distributorActivityLog, distributorResources
- subscriptionPlans, payments, invoices

**그룹 B — 칸반/생산성**
- kanbanColumns, kanbanTasks, notifications

**그룹 C — 보안/인증**
- auditLogs, securityEvents, dataDeletionRequests
- ipAccessControl, twoFactorAuth, loginAttempts
- sessions, passwordHistory

**그룹 D — 분석**
- analyticsEvents, cohorts, cohortUsers
- abTests, abTestParticipants, customReports
- funnels, rfmSegments

**그룹 E — AI**
- aiRecommendations, contentEmbeddings, chatbotConversations
- aiGeneratedContent, contentQualityScores, imageAutoTags
- faqKnowledgeBase, userActivityPatterns

**그룹 F — 자동화/비디오**
- workflows, workflowExecutions, integrations
- webhooks, webhookLogs, automationTemplates
- videos 관련 테이블은 Phase 2로 연기 가능

패턴: `tenantId: integer('tenant_id').default(1).references(() => tenants.id)`

### 1-2. 기존 API tenantId 마이그레이션 (~34개)

**담당**: backend-dev

QA에서 지적된 미마이그레이션 API + 나머지:

**P0 — 데이터 유출 위험**
- `GET/PUT/DELETE /api/pd/courses/[id]` (이미 수정 — 확인)
- `GET/POST/PUT /api/admin/distributors` (이미 수정 — 확인)
- `POST /api/pd/kanban/tasks`
- `POST /api/pd/kanban/columns`
- `GET /api/pd/kanban/projects` (이미 완료 — 확인)

**P1 — 핵심 비즈니스**
- `/api/pd/newsletter/[id]`
- `/api/pd/newsletter/send`
- `/api/pd/sns-accounts/[id]` (이미 수정 — 확인)
- `/api/pd/scheduled-posts`
- `/api/pd/inquiries`
- `/api/admin/resources`
- `/api/admin/payments`
- `/api/admin/invoices`

**P2 — 보조 기능**
- `/api/admin/analytics`
- `/api/admin/activity-log`
- `/api/admin/newsletter`
- `/api/notifications`
- 나머지 admin API

---

## Sprint 2: 미들웨어 + 프론트엔드 완성

### 2-1. 미들웨어 테넌트 라우팅 수정 (Y-008)

**담당**: devops-engineer

**문제**: 모든 테넌트가 `/chopd` prefix로 rewrite됨 → 테넌트별 분리 불가
**해결**:
- chopd 서브도메인 → `/chopd` (기존 유지)
- 일반 테넌트 서브도메인 → `/t/[slug]` prefix로 rewrite
- 또는 테넌트 식별만 하고 같은 라우트 사용 (TenantProvider가 분기)

### 2-2. 프론트엔드 페이지 확인/수정

**담당**: frontend-dev

QA가 "미존재"로 판단한 4개 페이지 확인:
- `/onboarding/page.tsx` — frontend-dev가 생성했다고 보고. 실제 파일 확인
- `/pd/settings/page.tsx` — 동일
- `/admin/tenants/page.tsx` — 동일
- `/admin/subscriptions/page.tsx` — 동일

존재하면 빌드 테스트, 미존재면 구현.

### 2-3. TenantProvider 연동 확인

**담당**: frontend-dev

- `/api/tenants/by-slug/[slug]` 엔드포인트 생성 완료 (R-004 해결)
- TenantProvider가 실제로 API 호출 → 테넌트 로드하는지 E2E 확인

---

## Sprint 3: 권장 수정 + 품질 개선

### 3-1. 코드 품질 (8건)

| # | 이슈 | 수정 방법 |
|---|------|----------|
| Y-001 | PLAN_LIMITS Infinity | `999999`로 변경 |
| Y-002 | types.ts 'use client' | 제거 |
| Y-003 | publicUrl 하드코딩 | `process.env.BASE_DOMAIN` 사용 |
| Y-004 | placeholder 이메일 | Clerk에서 실제 이메일 가져오기 or 필수 입력 |
| Y-005 | slug 제안 중복 가능성 | 제안 후 DB 체크 루프 |
| Y-006 | useTenant context 체크 | createContext 초기값 제거, null 체크 유효화 |
| Y-007 | middleware 중복 | `lib/tenant/middleware.ts` 삭제 또는 통합 |
| Y-008 | chopd rewrite | Sprint 2-1에서 처리 |

### 3-2. i18n 직업군 추가

현재 2개 (pd, shopowner) → 4개 이상:
- `realtor.json` — 부동산
- `educator.json` — 강사/교육자

---

## 에이전트 투입 계획

| Sprint | 에이전트 | 작업 | 병렬 |
|--------|---------|------|------|
| 1 | backend-dev | 테이블 37개 tenantId + API 34개 마이그레이션 | 단독 (DB 변경이라 직렬) |
| 2-1 | devops-engineer | 미들웨어 라우팅 수정 | 2-2와 병렬 |
| 2-2 | frontend-dev | 페이지 확인/수정 + TenantProvider E2E | 2-1과 병렬 |
| 3 | backend-dev + frontend-dev | 권장 수정 8건 | 병렬 |
| 검증 | qa-engineer | 재검증 → 90+ 목표 | 마지막 |

## 완료 기준

- [ ] QA 재검증 점수 90+
- [ ] 기존 테이블 tenantId 추가 47/47 (100%)
- [ ] 기존 API 마이그레이션 40/40 (100%)
- [ ] 프론트엔드 4개 페이지 빌드 + 동작 확인
- [ ] 미들웨어: chopd 외 테넌트 서브도메인 정상 라우팅
- [ ] 권장 수정 8건 해결
- [ ] i18n 직업군 4개 이상
