# 06. SaaS 전환 코드 리뷰 보고서

## 1. 요약

| 항목 | 값 |
|------|-----|
| 검증일 | 2026-03-30 |
| 전체 품질 점수 | **72 / 100** |
| 필수 수정 (Red) | 5건 |
| 권장 수정 (Yellow) | 8건 |
| 양호 (Green) | 14건 |

### 점수 상세

| 카테고리 | 배점 | 득점 | 비고 |
|----------|------|------|------|
| DB 스키마 | 20 | 17 | 신규 테이블 양호, 기존 테이블 마이그레이션 일부 누락 |
| 테넌트 유틸리티 | 15 | 14 | 코드 품질 우수, 타입 안전 |
| 신규 API | 20 | 16 | 핵심 CRUD 정상, 인증/보안 이슈 |
| 기존 API 마이그레이션 | 15 | 8 | 6개만 완료, 7개 이상 미완료 |
| 미들웨어 | 10 | 8 | 서브도메인 추출 로직 정상, 테넌트 DB 조회 미연결 |
| 프론트엔드 | 10 | 7 | Provider/i18n 구조 양호, 미구현 페이지 다수 |
| 배포/DevOps | 10 | 7 | 와일드카드 배포 설정 완료, 환경변수 하드코딩 이슈 |
| **합계** | **100** | **72** | |

---

## 2. 코드 리뷰 결과 (파일별)

### 2.1 DB 스키마 (`src/lib/db/schema.ts`)

#### 신규 테이블

| 테이블 | 평가 | 비고 |
|--------|------|------|
| `tenants` | 양호 | 필드 설계 완전, 인덱스 4개, slug UNIQUE |
| `tenantMembers` | 양호 | (tenantId, clerkUserId) 복합 UNIQUE, FK CASCADE |
| `saasSubscriptions` | 양호 | Stripe 필드 완비, 상태 enum 적절 |
| `saasInvoices` | 양호 | 센트 단위 금액, status enum 적절 |

#### 기존 테이블 변경 (tenantId 추가)

| 테이블 | 평가 | 비고 |
|--------|------|------|
| `courses` | 양호 | `.default(1).references(() => tenants.id)` + 인덱스 |
| `posts` | 양호 | 동일 패턴 |
| `works` | 양호 | 동일 패턴 |
| `inquiries` | 양호 | 동일 패턴 |
| `leads` | 양호 | 복합 유니크 `(tenantId, email)` 적용 |
| `settings` | 양호 | 복합 유니크 `(tenantId, key)` 적용 |
| `heroImages` | 양호 | tenantId + 인덱스 |
| `snsAccounts` | 양호 | tenantId + 인덱스 |
| `distributors` | 양호 | 복합 유니크 `(tenantId, email)` 적용 |
| `kanbanProjects` | 양호 | tenantId + 인덱스 |

#### 이슈

- 권장 수정 `snsScheduledPosts`, `snsPostHistory`, `distributorActivityLog`, `distributorResources`, `subscriptionPlans`, `payments`, `invoices`, `kanbanColumns`, `kanbanTasks`, `notifications` 등 10개 이상 테이블에 tenantId가 아직 추가되지 않음. 설계서에는 47개 테이블에 추가 예정이나 실제 구현은 10개 정도만 완료.

---

### 2.2 테넌트 유틸리티 (`src/lib/tenant/`)

#### `context.ts`

| 항목 | 평가 | 비고 |
|------|------|------|
| `getTenantIdFromRequest` | 양호 | x-tenant-id 헤더 파싱, NaN/음수 방어 |
| `getTenantSlugFromRequest` | 양호 | 단순 헤더 조회 |
| `getTenantBySlug` | 양호 | active 상태 필터 적용 |
| `getTenantById` | 양호 | |
| `getTenantMembership` | 양호 | active 상태 필터 적용 |
| `getPlanLimits` | 양호 | fallback to free |
| `PLAN_LIMITS` | 권장 수정 | `Infinity`는 JSON 직렬화 시 `null`로 변환됨. 프론트엔드에서 -1로 처리하고 있으나 일관성 부족 |

#### `middleware.ts` (테넌트 미들웨어 유틸리티)

| 항목 | 평가 | 비고 |
|------|------|------|
| `extractTenantSlug` | 양호 | 포트 제거, localhost 제외, www 제외 로직 |
| `isSuperAdminDomain` | 양호 | |
| `isCustomDomain` | 양호 | |
| `injectTenantHeaders` | 권장 수정 | response 헤더에 설정하지만 미들웨어에서는 request 헤더에 설정해야 함. 실제 사용하는 `src/middleware.ts`와 이 파일의 역할이 중복됨 |

#### `query-helpers.ts`

| 항목 | 평가 | 비고 |
|------|------|------|
| `tenantFilter` | 양호 | 단순 eq 래퍼 |
| `withTenantCondition` | 양호 | AND 결합 지원 |
| `withTenantId` | 양호 | INSERT 헬퍼 |

#### `types.ts`

| 항목 | 평가 | 비고 |
|------|------|------|
| 타입 정의 | 양호 | Tenant, TenantContextValue 등 완비 |
| `'use client'` | 권장 수정 | types.ts에 `'use client'` 불필요 (서버에서도 임포트 가능해야 함) |

#### `TenantProvider.tsx`

| 항목 | 평가 | 비고 |
|------|------|------|
| 기본 테넌트 fallback | 양호 | chopd는 API 호출 없이 하드코딩 |
| 에러 처리 | 양호 | 에러 시 기본 테넌트 fallback |
| API 경로 | 필수 수정 | `/api/tenants/by-slug/${slug}` 엔드포인트가 존재하지 않음. 404 반환됨 |

#### `useTenant.ts`

| 항목 | 평가 | 비고 |
|------|------|------|
| Context 사용 | 권장 수정 | context가 `undefined`가 아니라 초기값이 항상 존재하므로 `if (!context)` 체크가 작동하지 않음 |

---

### 2.3 신규 API

#### `POST /api/tenants` (테넌트 생성)

| 항목 | 평가 | 비고 |
|------|------|------|
| 입력 검증 | 양호 | slug 정규식, profession enum 체크 |
| slug 중복 확인 | 양호 | DB 조회 |
| 멤버 자동 생성 | 양호 | owner 역할로 자동 등록 |
| 인증 | 필수 수정 | `x-clerk-user-id` 헤더 또는 'dev_user' fallback. 프로덕션에서 미인증 사용자가 테넌트 무한 생성 가능 |
| 이메일 | 권장 수정 | `body.email || \`${clerkUserId}@placeholder.com\`` — placeholder 이메일은 프로덕션에서 문제될 수 있음 |
| publicUrl | 권장 수정 | `impd.io`가 하드코딩. `BASE_DOMAIN` 환경변수 사용해야 함 |

#### `GET /api/tenants` (테넌트 목록)

| 항목 | 평가 | 비고 |
|------|------|------|
| 멤버십 기반 조회 | 양호 | JOIN으로 사용자의 테넌트만 반환 |
| 인증 | 필수 수정 | 위와 동일. dev_user fallback |

#### `GET/PATCH/DELETE /api/tenants/:id`

| 항목 | 평가 | 비고 |
|------|------|------|
| ID 검증 | 양호 | NaN 체크 |
| GET branding/limits | 양호 | 플랜 제한 포함 |
| PATCH allowedFields | 양호 | 화이트리스트 방식으로 수정 가능 필드 제한 |
| PATCH 권한 체크 | 필수 수정 | 아무 사용자나 PATCH/DELETE 가능. 소유자/SuperAdmin 체크 없음 |
| DELETE 기본 테넌트 보호 | 양호 | id=1 삭제 방지 |

#### `POST/GET /api/tenants/:id/members`

| 항목 | 평가 | 비고 |
|------|------|------|
| 플랜 제한 체크 | 양호 | maxTeamMembers + 1(소유자) 비교 |
| 중복 초대 방지 | 양호 | email 기준 체크 |
| clerkUserId placeholder | 권장 수정 | `pending_${email}` 형태가 실제 Clerk 가입 후 업데이트 로직 부재 |

#### `GET/POST /api/onboarding`

| 항목 | 평가 | 비고 |
|------|------|------|
| 예약어 차단 | 양호 | RESERVED_SLUGS 배열 20개 |
| slug 형식 검증 | 양호 | 정규식 일관 |
| 대안 slug 제안 | 권장 수정 | `Math.random() * 99`로 제안 — 제안된 slug도 이미 존재할 가능성. DB 체크 필요 |

#### `GET/POST /api/subscriptions`

| 항목 | 평가 | 비고 |
|------|------|------|
| Free 플랜 fallback | 양호 | 구독 없으면 Free 반환 |
| Stripe placeholder | 양호 | 명시적으로 "준비 중" 메시지 |
| 가격 ID 매핑 | 양호 | 환경변수 fallback |

---

### 2.4 기존 API 마이그레이션

#### 마이그레이션 완료 (tenantId 필터 적용)

| API | 평가 | 비고 |
|-----|------|------|
| `GET/POST /api/pd/courses` | 양호 | tenantFilter + withTenantId |
| `GET/POST /api/pd/newsletter` | 양호 | tenantFilter + withTenantId |
| `GET/POST /api/pd/sns-accounts` | 양호 | tenantFilter (GET), tenantId 직접 주입 (POST) |
| `POST /api/admin/hero-images` | 양호 | tenantFilter + withTenantId |
| `GET /api/pd/kanban/projects` | 양호 | tenantFilter |

#### 마이그레이션 미완료 (tenantId 필터 없음)

| API | 평가 | 비고 |
|-----|------|------|
| `GET /api/courses` (공개) | 필수 수정 | tenantId 필터 없이 전체 데이터 노출. 다른 테넌트 과정이 혼재됨 |
| `GET/PUT/DELETE /api/pd/courses/[id]` | 필수 수정 | 개별 과정 수정/삭제에 tenantId 체크 없음. 타 테넌트 데이터 수정 가능 |
| `GET/PUT/DELETE /api/pd/sns-accounts/[id]` | 필수 수정 | 동일 이슈 |
| `POST /api/pd/newsletter/send` | 권장 수정 | tenantId 미적용 |
| `GET/POST/PUT /api/admin/distributors` | 필수 수정 | 핵심 비즈니스 데이터에 tenantId 필터 없음 |
| `GET/PUT /api/admin/distributors/[id]` | 필수 수정 | 동일 |
| `POST /api/admin/distributors/[id]/approve` | 필수 수정 | 동일 |
| `POST /api/admin/distributors/[id]/reject` | 필수 수정 | 동일 |
| `GET /api/admin/analytics` | 권장 수정 | tenantId 필터 없음 |
| `POST/PATCH /api/pd/kanban/tasks` | 권장 수정 | tenantId 필터 없음 |
| `POST /api/pd/kanban/columns` | 권장 수정 | tenantId 필터 없음 |

---

### 2.5 미들웨어 (`src/middleware.ts`)

| 항목 | 평가 | 비고 |
|------|------|------|
| 서브도메인 추출 | 양호 | BASE_DOMAIN 환경변수 기반 |
| x-tenant-slug 주입 | 양호 | requestHeaders에 설정 |
| chopd 레거시 호환 | 양호 | chopd.* → slug='chopd' |
| app 서브도메인 | 양호 | 슈퍼어드민용 통과 처리 |
| chopd 외 테넌트 rewrite | 양호 | `/chopd${pathname}`으로 rewrite |
| 일반 테넌트 라우트 | 권장 수정 | 모든 테넌트가 `/chopd` prefix로 rewrite됨. 설계서의 `/t/{slug}` 패턴과 불일치. 현재는 chopd 전용 레이아웃만 사용 가능 |
| 인증 체크 | 양호 | /admin/*, /pd/* 경로에서 세션 쿠키 확인 |

---

### 2.6 프론트엔드

#### `Header.tsx`

| 항목 | 평가 | 비고 |
|------|------|------|
| useTenant 사용 | 양호 | 테넌트 로고/색상 반영 |
| useTranslation 사용 | 양호 | 네비게이션 라벨 i18n 적용 |

#### `LayoutShell.tsx`

| 항목 | 평가 | 비고 |
|------|------|------|
| /onboarding 제외 | 양호 | 온보딩은 사이드바 없는 독립 레이아웃 |
| /dashboard 포함 | 양호 | 사이드바 레이아웃 적용 |

#### `pd/dashboard/page.tsx`

| 항목 | 평가 | 비고 |
|------|------|------|
| useTenant, useTranslation | 양호 | i18n 라벨 사용 |

#### i18n (`src/lib/i18n/`)

| 항목 | 평가 | 비고 |
|------|------|------|
| deepMerge | 양호 | 중첩 객체 병합 로직 |
| getNestedValue | 양호 | dot-notation 키 조회 |
| 타입 안전성 | 양호 | NestedKeyOf 제네릭 타입 |
| 미구현 직업군 | 양호 | 빈 객체 fallback → base.json 사용 |
| TranslationProvider | 양호 | useTenant 의존, profession 기반 |

#### 미구현 프론트엔드 페이지

| 페이지 | 상태 |
|--------|------|
| `/onboarding/page.tsx` | 미확인 (파일 미존재) |
| `/pd/settings/page.tsx` | 미확인 (파일 미존재) |
| `/admin/tenants/page.tsx` | 미확인 (파일 미존재) |
| `/admin/subscriptions/page.tsx` | 미확인 (파일 미존재) |

---

### 2.7 배포 (`bin/deploy`)

| 항목 | 평가 | 비고 |
|------|------|------|
| 와일드카드 도메인 등록 | 양호 | kamal-proxy에 *.impd.*.nip.io 등록 |
| BASE_DOMAIN 환경변수 | 양호 | 컨테이너에 전달 |
| JWT_SECRET 동적 생성 | 필수 수정 | 배포마다 `openssl rand`로 새 시크릿 생성. 기존 세션 모두 무효화됨. 고정값 사용 필요 |
| ENCRYPTION_KEY 동적 생성 | 필수 수정 | 동일 이슈. 암호화된 데이터 접근 불가능해짐 |
| 헬스체크 | 양호 | 최대 90초 대기, HTTP 200 확인 |
| 이미지 정리 | 양호 | 최근 3개만 유지 |

### 2.8 설정 (`next.config.js`)

| 항목 | 평가 | 비고 |
|------|------|------|
| allowedDevOrigins | 양호 | *.impd.*.nip.io 허용 |
| serverRuntimeConfig | 양호 | BASE_DOMAIN 전달 |
| publicRuntimeConfig | 양호 | 클라이언트에도 전달 |
| ignoreBuildErrors | 권장 수정 | TypeScript 에러 무시. 타입 오류로 인한 런타임 버그 가능성 |

---

## 3. API 테스트 결과

| # | 엔드포인트 | 메서드 | HTTP 상태 | 결과 | 비고 |
|---|-----------|--------|----------|------|------|
| 1 | `/api/health` | GET | 200 | PASS | memory: critical (96%) — 개발 환경 특성 |
| 2 | `/api/onboarding` | GET | 200 | PASS | professions 6개, plans 3개 |
| 3 | `/api/onboarding` | POST | 200 | PASS | slug 가용성 확인 정상 |
| 4 | `/api/tenants` | POST | 201 | PASS | 테넌트 생성 + 멤버 자동 등록 |
| 5 | `/api/tenants` | POST (중복) | 409 | PASS | TENANT_SLUG_TAKEN |
| 6 | `/api/tenants` | GET | 200 | PASS | 사용자 테넌트 목록 |
| 7 | `/api/tenants/1` | GET | 200 | PASS | branding + limits 포함 |
| 8 | `/api/tenants/1/members` | GET | 200 | PASS | owner 1명 |
| 9 | `/api/subscriptions` | GET | 200 | PASS | Free 플랜 정보 |
| 10 | `/api/subscriptions` | POST | 200 | PASS | Stripe placeholder |
| 11 | `/api/courses` | GET | 200 | PASS | 빈 배열 (tenantId 필터 없음) |
| 12 | `/api/pd/courses` | GET | 200 | PASS | tenantId=1 필터 적용 |
| 13 | `/api/pd/newsletter` | GET | 200 | PASS | tenantId=1 필터 적용 |
| 14 | `/api/pd/sns-accounts` | GET | 200 | PASS | tenantId=1 필터 적용 |
| 15 | `/api/pd/kanban/tasks` | GET | 200 | PASS | 빈 배열 (tenantId 필터 없음) |
| 16 | `/api/subscriptions/current` | GET | 404 | FAIL | 라우트 미존재 (HTML 반환) |

---

## 4. 발견된 이슈 분류

### 필수 수정 (5건)

| # | 이슈 | 파일 | 설명 | 위험도 |
|---|------|------|------|--------|
| R-001 | 인증 미적용 | `api/tenants/route.ts`, `api/tenants/[id]/route.ts` | 모든 테넌트 API에 인증 체크가 없음. `x-clerk-user-id || 'dev_user'` fallback으로 프로덕션에서 미인증 사용자가 테넌트 CRUD 가능 | 치명적 |
| R-002 | 기존 API tenantId 미적용 | `api/courses/route.ts`, `api/admin/distributors/route.ts` 외 7개+ | 공개 API와 admin API에 tenantId 필터가 없어 테넌트 간 데이터 유출 가능 | 높음 |
| R-003 | 개별 리소스 API 권한 누락 | `api/pd/courses/[id]/route.ts`, `api/pd/sns-accounts/[id]/route.ts` | 리소스 수정/삭제 시 해당 리소스가 현재 테넌트 소유인지 확인하지 않음. IDOR 취약점 | 높음 |
| R-004 | TenantProvider API 미존재 | `TenantProvider.tsx` | `/api/tenants/by-slug/${slug}` 엔드포인트가 구현되어 있지 않아 chopd 외 테넌트 로드 실패 | 높음 |
| R-005 | 배포 시 시크릿 재생성 | `bin/deploy` | JWT_SECRET, ENCRYPTION_KEY가 배포마다 새로 생성되어 기존 세션/암호화 데이터 무효화 | 높음 |

### 권장 수정 (8건)

| # | 이슈 | 파일 | 설명 |
|---|------|------|------|
| Y-001 | PLAN_LIMITS의 Infinity | `context.ts` | JSON 직렬화 시 null. -1 또는 큰 정수로 통일 권장 |
| Y-002 | types.ts에 'use client' | `types.ts` | 서버 컴포넌트에서 임포트 시 불필요한 제약 |
| Y-003 | publicUrl 하드코딩 | `api/tenants/route.ts` | `impd.io`가 하드코딩. BASE_DOMAIN 환경변수 사용 필요 |
| Y-004 | placeholder 이메일 | `api/tenants/route.ts` | `${clerkUserId}@placeholder.com` 프로덕션에서 부적절 |
| Y-005 | slug 제안 중복 가능성 | `api/onboarding/route.ts` | 제안된 slug의 DB 중복 체크 미수행 |
| Y-006 | useTenant context 체크 | `useTenant.ts` | createContext 초기값이 있어 null 체크 무의미 |
| Y-007 | 미들웨어 중복 파일 | `lib/tenant/middleware.ts` vs `src/middleware.ts` | 동일 기능 두 곳에 구현. lib/tenant/middleware.ts는 실제로 사용되지 않음 |
| Y-008 | 모든 테넌트 → chopd rewrite | `src/middleware.ts` | 다른 테넌트 slug도 `/chopd` prefix로 rewrite. 테넌트별 분리 불가 |

### 양호 (14건)

| 파일/기능 | 비고 |
|-----------|------|
| DB 스키마 신규 테이블 4개 | 설계서와 일치, 인덱스 완비 |
| DB 스키마 기존 테이블 tenantId 10개 | default(1), FK 참조, 복합 인덱스 |
| tenantFilter / withTenantId 헬퍼 | 간결하고 타입 안전 |
| getTenantIdFromRequest | NaN 방어, 기본값 fallback |
| extractTenantSlug (middleware.ts) | localhost 제외, www 제외, app 제외 |
| onboarding API | 예약어 차단, slug 검증 |
| 구독 API | Stripe placeholder 명시 |
| 멤버 API 플랜 제한 체크 | maxTeamMembers + owner 계산 |
| i18n deepMerge | 중첩 객체 병합 정상 |
| i18n 직업군 오버라이드 | pd, shopowner 두 개 구현 |
| Header 테넌트 브랜딩 | 로고, 색상, 네비 라벨 반영 |
| LayoutShell 온보딩 제외 | 올바른 경로 분기 |
| deploy 와일드카드 설정 | kamal-proxy 등록 정상 |
| next.config.js BASE_DOMAIN | serverRuntimeConfig + publicRuntimeConfig |

---

## 5. 구현 완료율

### 설계서 대비 구현 현황

| 카테고리 | 설계 항목 | 구현 완료 | 완료율 |
|----------|----------|----------|--------|
| 신규 테이블 | 4개 (tenants, tenantMembers, saasSubscriptions, saasInvoices) | 4개 | 100% |
| 기존 테이블 tenantId | 47개 (설계서 기준) | 10개 | 21% |
| 신규 API | 6개 (tenants CRUD, onboarding, subscriptions) | 6개 | 100% |
| 기존 API 마이그레이션 | ~40개 (설계서 기준) | 6개 | 15% |
| 미들웨어 서브도메인 | 1개 | 1개 (부분) | 70% |
| 프론트엔드 Provider | TenantProvider, TranslationProvider | 2개 | 100% |
| 프론트엔드 페이지 | onboarding, settings, admin/tenants, admin/subscriptions | 0개 | 0% |
| i18n JSON | 6개 직업군 | 2개 (pd, shopowner) | 33% |
| 배포 설정 | 와일드카드, BASE_DOMAIN | 완료 | 100% |

### 전체 구현 완료율: **약 45%** (Phase 1 기반 작업 + Phase 2 일부)

---

## 6. 권장 수정 우선순위

### 즉시 수정 (프로덕션 배포 전 필수)

1. **R-001**: 테넌트 API에 인증 미들웨어 적용 (세션 쿠키 또는 Clerk JWT 검증)
2. **R-005**: `bin/deploy`에서 JWT_SECRET, ENCRYPTION_KEY를 환경변수 파일 또는 Docker 시크릿으로 분리
3. **R-002**: 공개 courses API에 tenantId 필터 추가
4. **R-003**: 개별 리소스 API에 `WHERE id = ? AND tenant_id = ?` 조건 추가 (IDOR 방지)

### 다음 스프린트

5. **R-004**: `/api/tenants/by-slug/[slug]/route.ts` 엔드포인트 구현
6. **Y-008**: 미들웨어에서 테넌트별 라우트 분리 (chopd 외 테넌트 지원)
7. **Y-003, Y-004**: 하드코딩된 값 환경변수로 교체
8. 미마이그레이션 API 일괄 tenantId 적용 (admin/distributors 우선)

---

## 7. 종합 평가

### 강점
- DB 스키마 설계가 견고하며 설계서와 일치도가 높음
- 테넌트 유틸리티 (context.ts, query-helpers.ts)가 깔끔하고 재사용 가능
- i18n 구조가 확장 가능하며 직업군별 JSON 오버라이드 패턴이 우수
- 배포 스크립트의 와일드카드 서브도메인 설정이 올바름
- API 에러 응답이 일관되며 코드 체계가 명확함 (TENANT_SLUG_TAKEN 등)

### 약점
- **인증/인가 체계가 프로덕션 준비 안 됨** (가장 큰 위험)
- 기존 API 마이그레이션이 15% 수준으로 테넌트 간 데이터 유출 가능
- 프론트엔드 페이지가 미구현 (온보딩, 설정, 슈퍼어드민)
- 미들웨어가 모든 테넌트를 chopd로 rewrite하여 실질적 멀티테넌트 불가
- 배포 시 시크릿 재생성 문제

### 결론

SaaS 전환의 **기반 인프라** (DB 스키마, 테넌트 유틸리티, i18n, 배포 설정)는 설계서를 충실히 반영하여 구현되었으며, 코드 품질이 양호합니다.

그러나 **프로덕션 배포에는 아직 부적합**합니다. 인증 부재, 데이터 격리 미완료, 프론트엔드 미구현이 주요 blocker입니다. Phase 1 완료 선언 전에 R-001 ~ R-005 이슈를 반드시 해결해야 합니다.
