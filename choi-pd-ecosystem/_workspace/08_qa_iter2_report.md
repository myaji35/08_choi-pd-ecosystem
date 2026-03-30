# 08. Iteration 2 QA 재검증 보고서

## 1. 요약

| 항목 | Iteration 1 | Iteration 2 | 변화 |
|------|-------------|-------------|------|
| 전체 품질 점수 | **72 / 100** | **82 / 100** | +10 |
| 필수 수정 (Red) | 5건 | 0건 | 모두 해결 |
| 권장 수정 (Yellow) | 8건 | 3건 (잔여) | 5건 해결 |
| 양호 (Green) | 14건 | 19건 | +5 |

### 90+ 달성 여부: **미달 (82점)**

---

## 2. 점수 상세 비교

| 카테고리 | 배점 | Iter1 | Iter2 | 변화 | 근거 |
|----------|------|-------|-------|------|------|
| DB 스키마 | 20 | 17 | 17 | 0 | 50/78 테이블 tenantId 적용 (64%). 28개 누락 (비디오, 멤버, 조직, 채팅 등) |
| 테넌트 유틸리티 | 15 | 14 | 15 | +1 | Y-001(Infinity→999999) 수정 완료. Y-002('use client' 제거) 완료. types.ts 깔끔. |
| 신규 API | 20 | 16 | 18 | +2 | /api/tenants, /api/subscriptions, /api/onboarding 정상 동작. slug 중복 체크 구현(Y-005) |
| 기존 API 마이그레이션 | 15 | 8 | 12 | +4 | 29/136 API에 tenantId 적용 (21%). 핵심 13개 마이그레이션 완료. 107개 미적용 |
| 미들웨어 | 10 | 8 | 9 | +1 | Y-008(chopd 외 테넌트 rewrite 수정) 완료. 서브도메인→x-tenant-slug 주입 정상 |
| 프론트엔드 | 10 | 7 | 8 | +1 | 4개 페이지 정상 (onboarding:200, pd/settings:307, admin/tenants:307, admin/subscriptions:307). Y-006(useTenant null 체크) 완료. i18n 직업군 4개 |
| 배포/DevOps | 10 | 7 | 8 | +1 | Y-003(publicUrl 환경변수) 적용. BASE_DOMAIN 환경변수화. Dockerfile/Coolify/Vercel 설정 유지 |
| **합계** | **100** | **72** | **82** | **+10** | |

---

## 3. 테스트 결과

### 3.1 Iteration 1 필수 수정 재확인

| ID | 항목 | 결과 | 상세 |
|----|------|------|------|
| R-001 | /api/tenants 인증 | PASS | 인증 없이 → 401, 인증 있이 → 200 |
| R-002 | DB 스키마 tenantId | PASS | 50개 비즈니스 테이블에 tenantId 추가 |
| R-003 | 미들웨어 테넌트 해석 | PASS | extractTenantSlug 정상, x-tenant-slug 헤더 주입 |
| R-004 | useTenant 에러 처리 | PASS | context undefined 시 throw Error |
| R-005 | API tenantId 필터링 | PASS | 마이그레이션된 API에서 tenantId 필터링 확인 |

### 3.2 신규 마이그레이션 API 테스트

| API | 인증 | 기대 | 결과 | 상태 |
|-----|------|------|------|------|
| GET /api/pd/kanban/tasks?projectId=1 | dev_user | 200 | 200 | PASS |
| GET /api/pd/kanban/tasks (파라미터 없이) | dev_user | 400 | 400 | PASS (projectId 필수 검증 정상) |
| GET /api/pd/inquiries | dev_user | 200 | 200 | PASS |
| GET /api/admin/resources | dev_user | 200 | 200 | PASS |
| GET /api/admin/payments | dev_user | 200 | 200 | PASS |
| GET /api/admin/invoices | dev_user | 200 | 200 | PASS |
| GET /api/notifications | dev_user | 200 | 200 | PASS |
| GET /api/admin/analytics | dev_user | 200 | 200 | PASS |

**tenantId 적용 확인**: 위 7개 API 모두 tenantId 참조 코드 확인 (5~8회/파일)

### 3.3 프론트엔드 페이지 테스트

| 페이지 | 기대 | 결과 | 상태 |
|--------|------|------|------|
| /onboarding | 200 | 200 | PASS |
| /pd/settings | 307 (로그인 리다이렉트) | 307 | PASS |
| /admin/tenants | 307 | 307 | PASS |
| /admin/subscriptions | 307 | 307 | PASS |

### 3.4 미들웨어 테스트

| 테스트 | 기대 | 결과 | 상태 |
|--------|------|------|------|
| 기본 도메인 / | 200 | 200 | PASS |
| /chopd 접근 | 200 | 200 | PASS |
| /api/tenants/by-slug/chopd | 테넌트 조회 | TENANT_NOT_FOUND | WARN (DB에 chopd 레코드 미존재, 기본값 fallback으로 동작) |

### 3.5 Onboarding 플로우 테스트

| 테스트 | 결과 | 상태 |
|--------|------|------|
| slug 'test123' 사용 가능 여부 | `{"available":true}` | PASS |
| slug 'chopd' 중복 체크 | `{"available":false,"reason":"예약된 slug입니다.","suggestion":"chopd-my"}` | PASS |
| 인증 없이 onboarding API | 401 | PASS |

### 3.6 SaaS API 추가 테스트

| API | 결과 | 상태 |
|-----|------|------|
| GET /api/subscriptions (인증) | 200 | PASS |
| POST /api/tenants (인증) | 201 | PASS |
| GET /api/tenants (인증) | 200 (`{"tenants":[],"total":0}` 또는 목록) | PASS |

---

## 4. 권장 수정 해결 현황

| ID | 항목 | Iter1 | Iter2 | 비고 |
|----|------|-------|-------|------|
| Y-001 | Infinity → 999999 | 미해결 | **해결** | context.ts에서 999999 사용. 단, members/route.ts(76행)에 `Infinity` 1건 잔존 |
| Y-002 | 'use client' 제거 | 미해결 | **해결** | API route 내 'use client' 0건, types.ts에서도 제거 |
| Y-003 | publicUrl 환경변수 | 미해결 | **해결** | NEXT_PUBLIC_APP_URL, BASE_DOMAIN 환경변수 사용 |
| Y-004 | DB 마이그레이션 실행 | 미해결 | 부분해결 | 스키마 정의는 추가되었으나 실제 ALTER TABLE 마이그레이션 파일 미확인 |
| Y-005 | slug DB 유니크 체크 | 미해결 | **해결** | onboarding API에서 예약어 + DB 중복 체크 구현 |
| Y-006 | useTenant null 체크 | 미해결 | **해결** | context undefined 시 Error throw |
| Y-007 | deprecated 표시 | 미해결 | **해결** | tenant/middleware.ts에 @deprecated 주석 |
| Y-008 | 미들웨어 chopd rewrite | 미해결 | **해결** | chopd 전용 rewrite, 일반 테넌트는 x-tenant-slug만 주입 |

---

## 5. 잔여 이슈

### 5.1 감점 요인 (90점 미달 원인)

#### [HIGH] DB 스키마 tenantId 커버리지: 64% (50/78)
- **누락 28개 테이블**: organizations(9), videos(8), members(8), chat(3)
- 이들 중 videos/members/chat은 실제 사용 빈도 높은 기능으로, 데이터 격리 없이 프로덕션 배포 시 테넌트 간 데이터 유출 가능
- **감점**: -3점 (DB 스키마 카테고리)

#### [HIGH] API tenantId 마이그레이션: 21% (29/136)
- 마이그레이션된 13개 API는 정상 동작하나, 나머지 107개 API는 tenantId 필터링 없음
- 특히 `/api/admin/*`, `/api/pd/*` 하위 API 다수가 tenantId 미적용
- **감점**: -3점 (기존 API 마이그레이션 카테고리)

#### [MEDIUM] API 인증 미들웨어 간극
- 미들웨어가 `/admin/*`, `/pd/*` 페이지는 세션 체크하지만, `/api/admin/*`, `/api/pd/*` API는 미들웨어 레벨에서 체크하지 않음
- 각 API 핸들러 내부에서 개별 인증 처리에 의존 → 누락 위험
- **현재 상태**: `/api/admin/payments`, `/api/admin/resources`, `/api/pd/inquiries` 등이 인증 없이 200 반환 (dev mode 특성이나, 프로덕션에서도 동일할 경우 보안 이슈)
- **감점**: -2점 (신규 API / 미들웨어)

#### [LOW] Y-001 잔여: Infinity 1건
- `src/app/api/tenants/[id]/members/route.ts:76`에 `Infinity` 1건 잔존
- context.ts는 999999로 수정 완료되어 실제 도달하지 않을 가능성 높지만 코드 일관성 부족
- **감점**: -0.5점

#### [LOW] i18n 직업군 키 수 불일치
- pd.json: 4개 키, educator/realtor/shopowner.json: 5개 키
- pd.json에 키 1개 누락 가능성
- **감점**: -0.5점

### 5.2 개선 제안 (Iteration 3)

1. **DB 스키마**: 나머지 28개 테이블에 tenantId 추가 (특히 videos, members, chat 계열 우선)
2. **API 마이그레이션**: 최소 핵심 비즈니스 API 50개+ tenantId 적용
3. **API 인증 미들웨어**: `/api/admin/*`, `/api/pd/*` 패턴에 대한 미들웨어 레벨 인증 체크 추가
4. **i18n**: pd.json 키 수를 다른 직업군과 동일하게 맞춤
5. **Infinity 잔여**: members/route.ts의 Infinity를 999999로 통일

---

## 6. 카테고리별 세부 분석

### 6.1 DB 스키마 (17/20)

**양호 사항**:
- 신규 테이블 4개 (tenants, tenantMembers, saasSubscriptions, saasInvoices) 설계 우수
- 50개 기존 테이블에 tenantId + FK + 인덱스 일괄 적용
- leads, settings에 (tenantId, email/key) 복합 유니크 적용

**감점 사항**:
- 28개 테이블 tenantId 미적용 (-3점)
  - 조직: organizations, organizationBranding, teams, organizationMembers, ssoConfigurations
  - 지원: supportTickets, supportTicketComments, slaMetrics, userBulkImportLogs
  - 비디오: videos, videoChapters, videoSubtitles, watchHistory, liveStreams, videoComments, videoPlaylists, playlistVideos
  - 멤버: members, memberPortfolioItems, memberServices, memberPosts, memberInquiries, memberReviews, memberBookings
  - 채팅: chatConversations, chatMessages, memberMemories, memberUploads

### 6.2 테넌트 유틸리티 (15/15) - 만점

- context.ts: getTenantIdFromRequest, getPlanLimits 등 완비
- PLAN_LIMITS: Infinity → 999999 수정 완료
- TenantProvider: 기본 테넌트 fallback, refresh 콜백 지원
- useTenant: undefined 체크 후 Error throw
- types.ts: 'use client' 제거 완료
- query-helpers.ts: tenantFilter, withTenantCondition, withTenantId 유틸 완비

### 6.3 신규 API (18/20)

- /api/tenants: CRUD + 인증 보호 (401 미인증)
- /api/tenants/by-slug/[slug]: 슬러그 기반 조회
- /api/tenants/[id]/members: 멤버 관리 + 플랜 제한 체크
- /api/subscriptions: 구독 관리
- /api/onboarding: slug 중복 + 예약어 체크
- 감점: API 인증 일부 간극 (-2)

### 6.4 기존 API 마이그레이션 (12/15)

- 마이그레이션 완료 (13개): kanban/tasks, kanban/projects, inquiries, resources, payments, invoices, notifications, analytics, courses, distributors, sns-accounts, newsletter, hero-images
- 모두 tenantId 필터링 확인 (5~8회 참조/파일)
- 감점: 107개 미적용 (-3)

### 6.5 미들웨어 (9/10)

- extractTenantSlug: localhost, chopd, 일반 서브도메인 분기 정상
- chopd → /chopd rewrite (레거시 호환)
- 일반 테넌트 → x-tenant-slug 헤더만 주입 (Y-008 수정 확인)
- /admin/*, /pd/* 페이지 인증 체크 정상
- 감점: API 레벨 인증 위임 구조 (-1)

### 6.6 프론트엔드 (8/10)

- onboarding 페이지: 200 정상 렌더링
- pd/settings: 307 리다이렉트 정상
- admin/tenants, admin/subscriptions: 307 정상
- useTenant 훅: null 안전 처리
- i18n: 4개 직업군 (pd, shopowner, realtor, educator)
- 감점: i18n 키 불일치, 추가 페이지 미확인 (-2)

### 6.7 배포/DevOps (8/10)

- Dockerfile, .coolify.yml, vercel.json 모두 존재
- BASE_DOMAIN 환경변수화 (Y-003)
- .env.example에 BASE_DOMAIN 기본값 설정
- deprecated 파일에 @deprecated 주석 (Y-007)
- 감점: 와일드카드 DNS/SSL 설정 미확인, drizzle 마이그레이션 파일 추가 미확인 (-2)

---

## 7. 결론

Iteration 2에서 **+10점 (72→82)** 개선되었으나, **90점 목표에 8점 부족**합니다.

주요 병목:
1. **DB tenantId 커버리지 64%** — 비디오/멤버/채팅/조직 계열 28개 테이블 누락
2. **API tenantId 마이그레이션 21%** — 136개 중 29개만 적용
3. **API 인증 미들웨어 간극** — /api/admin/*, /api/pd/* 인증 보호 불완전

90점 달성 최소 조건:
- DB tenantId 80%+ (63개 이상)
- API 마이그레이션 50%+ (68개 이상)
- API 인증 미들웨어 체계화

| 달성 지표 | 현재 | 90점 기준 | Gap |
|-----------|------|-----------|-----|
| DB tenantId | 64% (50/78) | 80%+ | -16% |
| API 마이그레이션 | 21% (29/136) | 50%+ | -29% |
| 프론트엔드 페이지 | 4개 확인 | 6개+ | -2 |
| i18n 직업군 | 4개 | 5개+ | -1 |

---

*검증일: 2026-03-30*
*검증 서버: http://localhost:3008 (Next.js 16.0.7, webpack mode)*
*검증 도구: curl, 코드 정적 분석*
