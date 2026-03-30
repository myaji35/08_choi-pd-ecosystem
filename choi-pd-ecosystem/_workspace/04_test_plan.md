# 04. SaaS 전환 테스트 계획서

## 1. 개요

| 항목 | 값 |
|------|-----|
| 프로젝트 | imPD SaaS 멀티테넌시 전환 |
| 검증 대상 | Phase 1~2 구현 (DB 스키마, 테넌트 API, i18n, 미들웨어, 프론트엔드) |
| 작성일 | 2026-03-30 |
| QA 엔지니어 | Claude QA (시니어) |
| 테스트 환경 | localhost:3008 (dev), Vultr 158.247.235.31 (prod) |

---

## 2. 테스트 시나리오

### 2.1 멀티테넌시 핵심 (P0 - 필수)

| # | 시나리오 | 설명 | 입력 | 기대 결과 | 상태 |
|---|---------|------|------|----------|------|
| T-001 | 테넌트 생성 | POST /api/tenants | name, slug, profession | 201 + tenant 객체 + tenantMembers(owner) 자동 생성 | PASS |
| T-002 | slug 중복 방지 | POST /api/tenants (기존 slug) | 중복 slug | 409 TENANT_SLUG_TAKEN | PASS |
| T-003 | slug 가용성 확인 | POST /api/onboarding | 새 slug | { available: true } | PASS |
| T-004 | slug 중복 감지 | POST /api/onboarding | 기존 slug | { available: false, suggestion: "..." } | PASS |
| T-005 | 테넌트 목록 조회 | GET /api/tenants | (인증 헤더) | 현재 사용자의 테넌트 목록 | PASS |
| T-006 | 테넌트 상세 조회 | GET /api/tenants/:id | id=1 | 테넌트 + branding + limits 포함 | PASS |
| T-007 | 테넌트 수정 | PATCH /api/tenants/:id | name 변경 | 200 + 업데이트된 객체 | 미테스트 |
| T-008 | 테넌트 삭제 (소프트) | DELETE /api/tenants/:id | id > 1 | status='deleted', 30일 유예 메시지 | 미테스트 |
| T-009 | 기본 테넌트 삭제 방지 | DELETE /api/tenants/1 | id=1 | 403 CANNOT_DELETE_DEFAULT | 미테스트 |
| T-010 | 데이터 격리 (courses) | GET /api/pd/courses (tenantId=1 vs 2) | 다른 테넌트 | 각 테넌트 데이터만 반환 | 미테스트 |
| T-011 | 데이터 격리 (newsletter) | GET /api/pd/newsletter (tenantId=1 vs 2) | 다른 테넌트 | 각 테넌트 데이터만 반환 | 미테스트 |

### 2.2 멤버 관리 (P0 - 필수)

| # | 시나리오 | 설명 | 입력 | 기대 결과 | 상태 |
|---|---------|------|------|----------|------|
| T-020 | 멤버 초대 | POST /api/tenants/:id/members | email, role | 201 + invited 상태 | 미테스트 |
| T-021 | 중복 초대 방지 | POST (같은 email) | 동일 email | 409 MEMBER_ALREADY_EXISTS | 미테스트 |
| T-022 | 멤버 목록 | GET /api/tenants/:id/members | tenantId | 멤버 배열 + total | PASS |
| T-023 | Free 플랜 멤버 제한 | POST (Free 플랜에서 추가 초대) | Free 테넌트 | 403 PLAN_LIMIT_EXCEEDED | 미테스트 |

### 2.3 구독/결제 (P1 - 중요)

| # | 시나리오 | 설명 | 입력 | 기대 결과 | 상태 |
|---|---------|------|------|----------|------|
| T-030 | 현재 구독 조회 | GET /api/subscriptions | (tenantId) | Free 플랜 정보 | PASS |
| T-031 | Checkout 세션 생성 | POST /api/subscriptions | planId=pro | placeholder checkoutUrl | PASS |
| T-032 | 잘못된 플랜 ID | POST /api/subscriptions | planId=invalid | 400 INVALID_PLAN | 미테스트 |
| T-033 | Stripe 웹훅 처리 | POST /api/webhooks/stripe | (향후 Phase 3) | 미구현 | N/A |

### 2.4 온보딩 (P1 - 중요)

| # | 시나리오 | 설명 | 입력 | 기대 결과 | 상태 |
|---|---------|------|------|----------|------|
| T-040 | 직업군 목록 | GET /api/onboarding | - | professions(6개) + plans(3개) | PASS |
| T-041 | 예약어 slug 차단 | POST /api/onboarding | slug='admin' | available: false | 미테스트 |
| T-042 | 짧은 slug 거절 | POST /api/onboarding | slug='ab' | available: false (3자 미만) | 미테스트 |

### 2.5 i18n / 직업군 커스터마이징 (P1 - 중요)

| # | 시나리오 | 설명 | 입력 | 기대 결과 | 상태 |
|---|---------|------|------|----------|------|
| T-050 | base.json 로드 | 기본 라벨 | profession=pd | nav.home = "홈" | 코드 검증 완료 |
| T-051 | PD 직업군 오버라이드 | pd.json 적용 | profession=pd | content.gallery = "모바일 스케치 갤러리" | 코드 검증 완료 |
| T-052 | 쇼핑몰 직업군 오버라이드 | shopowner.json 적용 | profession=shopowner | distributor.title = "입점업체" | 코드 검증 완료 |
| T-053 | 미구현 직업군 fallback | realtor.json 없음 | profession=realtor | base.json 기본값 사용 | 코드 검증 완료 |

### 2.6 서브도메인 미들웨어 (P0 - 필수)

| # | 시나리오 | 설명 | 입력 | 기대 결과 | 상태 |
|---|---------|------|------|----------|------|
| T-060 | localhost 기본 테넌트 | localhost:3008 | Host: localhost | tenantSlug = null (기본 테넌트) | 코드 검증 완료 |
| T-061 | 서브도메인 slug 추출 | chopd.impd.*.nip.io | Host: chopd.impd... | tenantSlug = 'chopd' | 코드 검증 완료 |
| T-062 | app 서브도메인 제외 | app.impd.io | Host: app.impd.io | null (슈퍼어드민) | 코드 검증 완료 |
| T-063 | x-tenant-slug 헤더 주입 | 서브도메인 요청 | 테넌트 서브도메인 | 하위 API에 헤더 전달 | 코드 검증 완료 |
| T-064 | API에 tenant 헤더 전달 | API 호출 시 | 서브도메인 요청 | x-tenant-slug 유지 | 코드 검증 완료 |

### 2.7 기존 기능 호환성 (P0 - 필수)

| # | 시나리오 | 설명 | 입력 | 기대 결과 | 상태 |
|---|---------|------|------|----------|------|
| T-070 | 기존 courses API | GET /api/courses | - | 200 + 정상 응답 | PASS |
| T-071 | 마이그레이션된 pd/courses | GET /api/pd/courses | - | 200 + tenantId 필터 적용 | PASS |
| T-072 | 마이그레이션된 pd/newsletter | GET /api/pd/newsletter | - | 200 + tenantId 필터 적용 | PASS |
| T-073 | 마이그레이션된 pd/sns-accounts | GET /api/pd/sns-accounts | - | 200 + tenantId 필터 적용 | PASS |
| T-074 | 마이그레이션된 admin/hero-images | POST /api/admin/hero-images | - | 200 + tenantId 필터/주입 | 코드 검증 완료 |
| T-075 | 미마이그레이션 API (courses 공개) | GET /api/courses | - | 200 (tenantId 필터 미적용) | PASS |
| T-076 | 미마이그레이션 API (admin/distributors) | GET /api/admin/distributors | - | 200 (tenantId 필터 미적용) | 미테스트 |
| T-077 | 헬스체크 | GET /api/health | - | 200 + status 필드 | PASS |

### 2.8 보안 (P0 - 필수)

| # | 시나리오 | 설명 | 입력 | 기대 결과 | 상태 |
|---|---------|------|------|----------|------|
| T-080 | 테넌트 간 데이터 접근 차단 | tenantId=2에서 tenantId=1 데이터 조회 | 다른 테넌트 헤더 | 해당 테넌트 데이터만 반환 | 미테스트 |
| T-081 | SQL Injection 방지 | slug에 SQL 삽입 시도 | slug="'; DROP TABLE--" | 400 또는 안전한 에러 | 미테스트 |
| T-082 | XSS 방지 | name에 스크립트 삽입 | name="<script>alert(1)</script>" | 이스케이프/거부 | 미테스트 |
| T-083 | 인증 없이 보호된 API 접근 | /admin, /pd 경로 직접 접근 | 세션 없음 | 로그인 리디렉트 | 코드 검증 완료 |
| T-084 | API 인증 우회 (dev mode) | x-clerk-user-id 헤더 위조 | 임의 값 | dev mode에서는 허용 (prod에서 차단 필요) | 이슈 발견 |

### 2.9 프론트엔드 (P1 - 중요)

| # | 시나리오 | 설명 | 입력 | 기대 결과 | 상태 |
|---|---------|------|------|----------|------|
| T-090 | TenantProvider 기본 테넌트 | slug 없이 | - | DEFAULT_TENANT (chopd) 사용 | 코드 검증 완료 |
| T-091 | TenantProvider 에러 fallback | 잘못된 slug | invalidSlug | 기본 테넌트로 fallback | 코드 검증 완료 |
| T-092 | Header 테넌트 로고 표시 | 테넌트 logoUrl 있을 때 | logoUrl 존재 | Image 컴포넌트 렌더링 | 코드 검증 완료 |
| T-093 | Header 네비게이션 라벨 | i18n 적용 | profession=shopowner | "상품 교육", "매장 소식" 등 | 코드 검증 완료 |
| T-094 | LayoutShell 온보딩 제외 | /onboarding 경로 | - | 사이드바 미표시 | 코드 검증 완료 |

---

## 3. 테스트 데이터 요구사항

### 3.1 기본 테넌트 (seed)
```json
{
  "id": 1,
  "slug": "chopd",
  "name": "최PD 스마트폰 연구소",
  "profession": "pd",
  "plan": "enterprise"
}
```

### 3.2 테스트 테넌트
```json
{
  "slug": "kimrealtor",
  "name": "김부동산",
  "profession": "realtor",
  "plan": "free"
}
```

### 3.3 각 테넌트별 테스트 데이터
- courses: 테넌트별 3개 이상
- leads: 테넌트별 5개 이상
- snsAccounts: 테넌트별 2개 이상
- distributors: 테넌트별 2개 이상

---

## 4. 테스트 환경 설정

### 4.1 로컬 개발 환경
```
URL: http://localhost:3008
DB: file:./data/database.db (SQLite)
인증: dev mode (x-clerk-user-id 헤더 또는 기본값 'dev_user')
서브도메인: localhost에서는 기본 테넌트만 테스트 가능
```

### 4.2 스테이징 환경 (Vultr)
```
URL: https://impd.158.247.235.31.nip.io
서브도메인: *.impd.158.247.235.31.nip.io
예시: chopd.impd.158.247.235.31.nip.io
```

### 4.3 서브도메인 테스트 (로컬)
```
/etc/hosts에 추가:
127.0.0.1  chopd.impd.local
127.0.0.1  test.impd.local
127.0.0.1  app.impd.local

환경변수:
NEXT_PUBLIC_SAAS_DOMAIN=impd.local
BASE_DOMAIN=impd.local
```

---

## 5. 우선순위별 실행 순서

### Phase 1: P0 (즉시)
1. 멀티테넌시 핵심 (T-001 ~ T-011)
2. 서브도메인 미들웨어 (T-060 ~ T-064)
3. 기존 기능 호환성 (T-070 ~ T-077)
4. 보안 (T-080 ~ T-084)

### Phase 2: P1 (1주 이내)
1. 멤버 관리 (T-020 ~ T-023)
2. 구독/결제 (T-030 ~ T-033)
3. 온보딩 (T-040 ~ T-042)
4. i18n (T-050 ~ T-053)
5. 프론트엔드 (T-090 ~ T-094)

### Phase 3: P2 (안정화 단계)
- E2E 테스트 자동화 (Playwright)
- 부하 테스트 (멀티테넌트 동시 접근)
- 프로덕션 서브도메인 검증

---

## 6. 자동화 테스트 코드 (향후 작성)

### 6.1 Jest 단위 테스트
- `src/lib/tenant/context.test.ts` — getTenantIdFromRequest, getPlanLimits
- `src/lib/tenant/middleware.test.ts` — extractTenantSlug 유닛
- `src/lib/tenant/query-helpers.test.ts` — tenantFilter, withTenantId
- `src/lib/i18n/index.test.ts` — deepMerge, getNestedValue, buildLabels

### 6.2 Playwright E2E 테스트
- `e2e/multitenancy.spec.ts` — 온보딩 플로우, 서브도메인 라우팅
- `e2e/tenant-isolation.spec.ts` — 테넌트 간 데이터 격리 확인
