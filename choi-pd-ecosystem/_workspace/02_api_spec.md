# 02. API 명세서 (SaaS 전환)

## 1. 개요

기존 110개 이상의 API 엔드포인트에 멀티테넌시를 적용하고, SaaS 운영에 필요한 신규 API를 추가한다.

### 공통 규칙

1. **테넌트 컨텍스트**: 모든 API는 미들웨어에서 주입된 `x-tenant-id` 헤더를 참조
2. **인증**: Clerk JWT 또는 세션 쿠키 (기존 `impd_session` 유지)
3. **에러 형식**: `{ error: string, code: string, details?: object }`
4. **페이지네이션**: `?page=1&limit=20` (기존 패턴 유지)

---

## 2. 신규 API 엔드포인트

### 2.1 테넌트 관리 API

#### `POST /api/tenants` — 테넌트 생성 (온보딩)
```
인증: Clerk JWT 필수
권한: 인증된 사용자 (누구나 테넌트 생성 가능)

Request Body:
{
  "name": "김부동산",
  "slug": "kimrealtor",
  "profession": "realtor",        // pd | shopowner | realtor | educator | insurance | freelancer
  "businessType": "individual",   // individual | company | organization
  "region": "서울 강남구"
}

Response 201:
{
  "id": 2,
  "name": "김부동산",
  "slug": "kimrealtor",
  "profession": "realtor",
  "plan": "free",
  "status": "active",
  "createdAt": "2026-03-30T10:00:00Z",
  "publicUrl": "https://kimrealtor.impd.io"
}

에러:
- 409: slug 이미 사용 중
- 400: 유효하지 않은 profession 값
```

#### `GET /api/tenants/:id` — 테넌트 상세 조회
```
인증: Clerk JWT 필수
권한: Tenant Owner/Member 또는 SuperAdmin

Response 200:
{
  "id": 2,
  "name": "김부동산",
  "slug": "kimrealtor",
  "profession": "realtor",
  "businessType": "individual",
  "plan": "free",
  "status": "active",
  "branding": {
    "logoUrl": null,
    "primaryColor": "#3b82f6",
    "fontFamily": "Inter"
  },
  "limits": {
    "maxSnsAccounts": 2,
    "maxStorage": 524288000,
    "usedStorage": 0,
    "maxTeamMembers": 0
  },
  "createdAt": "2026-03-30T10:00:00Z"
}
```

#### `PATCH /api/tenants/:id` — 테넌트 수정
```
인증: Clerk JWT 필수
권한: Tenant Owner 또는 SuperAdmin

Request Body (부분 수정):
{
  "name": "김부동산 공인중개사",
  "region": "서울 서초구"
}

Response 200: 업데이트된 테넌트 객체
```

#### `DELETE /api/tenants/:id` — 테넌트 삭제 (소프트 딜리트)
```
인증: Clerk JWT 필수
권한: Tenant Owner (확인 절차 필요) 또는 SuperAdmin

Response 200:
{
  "message": "테넌트가 비활성화되었습니다. 30일 후 완전 삭제됩니다.",
  "deletedAt": "2026-03-30T10:00:00Z",
  "permanentDeletionAt": "2026-04-29T10:00:00Z"
}
```

#### `GET /api/tenants/:id/usage` — 테넌트 사용량 조회
```
인증: Clerk JWT 필수
권한: Tenant Owner 또는 SuperAdmin

Response 200:
{
  "tenantId": 2,
  "plan": "free",
  "usage": {
    "snsAccounts": { "used": 1, "limit": 2 },
    "storage": { "used": 104857600, "limit": 524288000, "unit": "bytes" },
    "teamMembers": { "used": 0, "limit": 0 },
    "courses": { "used": 3, "limit": 10 },
    "distributors": { "used": 0, "limit": 5 }
  },
  "period": "2026-03"
}
```

---

### 2.2 테넌트 멤버 관리 API

#### `POST /api/tenants/:id/members` — 멤버 초대
```
인증: Clerk JWT 필수
권한: Tenant Owner

Request Body:
{
  "email": "team@example.com",
  "role": "member",              // owner | admin | member | guest
  "jobTitle": "마케팅 담당"
}

Response 201:
{
  "id": 1,
  "email": "team@example.com",
  "role": "member",
  "status": "invited",
  "invitedAt": "2026-03-30T10:00:00Z"
}
```

#### `GET /api/tenants/:id/members` — 멤버 목록
```
인증: Clerk JWT 필수
권한: Tenant Owner/Admin

Response 200:
{
  "members": [
    {
      "id": 1,
      "userId": "clerk_user_123",
      "email": "owner@example.com",
      "name": "김부동산",
      "role": "owner",
      "status": "active",
      "lastActiveAt": "2026-03-30T09:00:00Z"
    }
  ],
  "total": 1
}
```

#### `PATCH /api/tenants/:id/members/:memberId` — 멤버 역할 변경
```
인증: Clerk JWT 필수
권한: Tenant Owner

Request Body:
{
  "role": "admin"
}

Response 200: 업데이트된 멤버 객체
```

#### `DELETE /api/tenants/:id/members/:memberId` — 멤버 제거
```
인증: Clerk JWT 필수
권한: Tenant Owner (본인 제거 불가)

Response 200:
{ "message": "멤버가 제거되었습니다." }
```

---

### 2.3 구독/결제 API

#### `POST /api/subscriptions/checkout` — Stripe Checkout 세션 생성
```
인증: Clerk JWT 필수
권한: Tenant Owner

Request Body:
{
  "planId": "pro",                // free | pro | enterprise
  "billingPeriod": "monthly"      // monthly | yearly
}

Response 200:
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_xxx",
  "sessionId": "cs_xxx"
}
```

#### `POST /api/subscriptions/portal` — Stripe 고객 포털 (결제 관리)
```
인증: Clerk JWT 필수
권한: Tenant Owner

Response 200:
{
  "portalUrl": "https://billing.stripe.com/p/session/bps_xxx"
}
```

#### `GET /api/subscriptions/current` — 현재 구독 정보
```
인증: Clerk JWT 필수
권한: Tenant Owner

Response 200:
{
  "plan": "pro",
  "status": "active",
  "currentPeriodStart": "2026-03-01T00:00:00Z",
  "currentPeriodEnd": "2026-03-31T23:59:59Z",
  "cancelAtPeriodEnd": false,
  "stripeCustomerId": "cus_xxx",
  "stripeSubscriptionId": "sub_xxx"
}
```

#### `POST /api/webhooks/stripe` — Stripe 웹훅 핸들러
```
인증: Stripe 서명 검증 (stripe-signature 헤더)
권한: 없음 (서버-투-서버)

처리하는 이벤트:
- checkout.session.completed → 구독 생성
- customer.subscription.updated → 플랜 변경
- customer.subscription.deleted → 구독 취소
- invoice.payment_failed → 결제 실패 알림
- invoice.paid → 인보이스 기록

Response 200: { "received": true }
```

---

### 2.4 테넌트 브랜딩 API

#### `GET /api/tenants/:id/branding` — 브랜딩 조회
```
인증: 없음 (공개)

Response 200:
{
  "logoUrl": "https://...",
  "faviconUrl": "https://...",
  "primaryColor": "#00A1E0",
  "secondaryColor": "#16325C",
  "fontFamily": "Pretendard",
  "customDomain": null,
  "footerText": "2026 김부동산"
}
```

#### `PATCH /api/tenants/:id/branding` — 브랜딩 수정
```
인증: Clerk JWT 필수
권한: Tenant Owner

Request Body (부분 수정):
{
  "primaryColor": "#e11d48",
  "fontFamily": "Noto Sans KR"
}

Response 200: 업데이트된 브랜딩 객체
```

---

### 2.5 슈퍼어드민 API

#### `GET /api/superadmin/tenants` — 전체 테넌트 목록
```
인증: Clerk JWT 필수
권한: SuperAdmin

Query Params:
- page, limit, status, plan, profession, search

Response 200:
{
  "tenants": [...],
  "total": 42,
  "stats": {
    "totalActive": 38,
    "totalFree": 20,
    "totalPro": 15,
    "totalEnterprise": 3,
    "mrr": 714000
  }
}
```

#### `GET /api/superadmin/analytics` — 플랫폼 전체 분석
```
인증: Clerk JWT 필수
권한: SuperAdmin

Query Params:
- period (7d | 30d | 90d | 1y)

Response 200:
{
  "period": "30d",
  "newTenants": 12,
  "churnedTenants": 1,
  "totalRevenue": 2142000,
  "mrr": 714000,
  "arr": 8568000,
  "activeUsers": 156,
  "topProfessions": [
    { "profession": "realtor", "count": 15 },
    { "profession": "educator", "count": 10 }
  ]
}
```

#### `PATCH /api/superadmin/tenants/:id/status` — 테넌트 상태 변경
```
인증: Clerk JWT 필수
권한: SuperAdmin

Request Body:
{
  "status": "suspended",
  "reason": "결제 미이행"
}

Response 200: 업데이트된 테넌트 객체
```

---

### 2.6 온보딩 API

#### `POST /api/onboarding/check-slug` — slug 사용 가능 여부
```
인증: 없음

Request Body:
{ "slug": "kimrealtor" }

Response 200:
{ "available": true }

Response 200:
{ "available": false, "suggestion": "kimrealtor2" }
```

#### `GET /api/onboarding/professions` — 직업군 목록
```
인증: 없음

Response 200:
{
  "professions": [
    { "id": "pd", "name": "PD/방송인", "description": "방송 PD, 유튜버, 크리에이터", "icon": "tv" },
    { "id": "shopowner", "name": "쇼핑몰 운영자", "description": "온라인/오프라인 쇼핑몰", "icon": "shopping-bag" },
    { "id": "realtor", "name": "부동산 중개인", "description": "공인중개사, 부동산 컨설턴트", "icon": "home" },
    { "id": "educator", "name": "교육자/강사", "description": "학원, 과외, 온라인 강의", "icon": "book-open" },
    { "id": "insurance", "name": "보험 설계사", "description": "보험 설계, 재무 컨설팅", "icon": "shield" },
    { "id": "freelancer", "name": "프리랜서", "description": "디자이너, 개발자, 작가", "icon": "briefcase" }
  ]
}
```

---

## 3. 기존 API 마이그레이션 계획

### 3.1 변경 대상 (tenant_id 필터 추가)

모든 기존 API에 테넌트 필터를 적용한다. 변경 패턴은 동일하다:

```
// 변경 전
const result = await db.select().from(courses);

// 변경 후
const tenantId = getTenantFromRequest(req);
const result = await db.select().from(courses).where(eq(courses.tenantId, tenantId));
```

#### 카테고리별 마이그레이션 대상

**콘텐츠 API (높은 우선순위)**
| API | 메서드 | 변경 내용 |
|-----|--------|----------|
| `/api/courses` | GET, POST | tenantId 필터/주입 |
| `/api/pd/courses/*` | GET, POST, PUT, DELETE | tenantId 필터/주입 |
| `/api/pd/newsletter/*` | GET, POST, PUT, DELETE | tenantId 필터/주입 |
| `/api/pd/inquiries/*` | GET, POST, PUT | tenantId 필터/주입 |
| `/api/pd/kanban/*` | GET, POST, PUT, DELETE | tenantId 필터/주입 |
| `/api/pd/sns-accounts/*` | GET, POST, PUT, DELETE | tenantId 필터/주입 |
| `/api/pd/scheduled-posts/*` | GET, POST, PUT, DELETE | tenantId 필터/주입 |
| `/api/inquiries/*` | GET, POST | tenantId 필터/주입 |
| `/api/leads` | GET, POST | tenantId 필터/주입 |

**어드민 API (높은 우선순위)**
| API | 메서드 | 변경 내용 |
|-----|--------|----------|
| `/api/admin/distributors/*` | 전체 | tenantId 필터/주입 |
| `/api/admin/resources/*` | 전체 | tenantId 필터/주입 |
| `/api/admin/hero-images` | GET, POST | tenantId 필터/주입 |
| `/api/admin/payments/*` | 전체 | tenantId 필터/주입 |
| `/api/admin/invoices` | GET | tenantId 필터/주입 |
| `/api/admin/newsletter/*` | 전체 | tenantId 필터/주입 |
| `/api/admin/analytics` | GET | tenantId 필터 |
| `/api/admin/activity-log` | GET | tenantId 필터 |
| `/api/admin/social` | GET, POST | tenantId 필터/주입 |

**미디어/비디오 API (중간 우선순위)**
| API | 메서드 | 변경 내용 |
|-----|--------|----------|
| `/api/videos/*` | 전체 | tenantId 필터/주입 |
| `/api/playlists/*` | 전체 | tenantId 필터/주입 |
| `/api/live/*` | 전체 | tenantId 필터/주입 |
| `/api/upload/*` | POST | tenantId 주입 |
| `/api/watch-history` | GET, POST | tenantId 필터/주입 |

**AI/자동화 API (낮은 우선순위)**
| API | 메서드 | 변경 내용 |
|-----|--------|----------|
| `/api/ai/*` | 전체 | tenantId 필터/주입 |
| `/api/chat/*` | 전체 | tenantId 필터/주입 |
| `/api/sns/*` | 전체 | tenantId 필터/주입 |
| `/api/admin/workflows/*` | 전체 | tenantId 필터/주입 |
| `/api/admin/integrations/*` | 전체 | tenantId 필터/주입 |
| `/api/admin/webhooks/*` | 전체 | tenantId 필터/주입 |

**보안/분석 API (중간 우선순위)**
| API | 메서드 | 변경 내용 |
|-----|--------|----------|
| `/api/admin/analytics/*` | 전체 | tenantId 필터 |
| `/api/admin/security/*` | 전체 | tenantId 필터/주입 |
| `/api/admin/logs` | GET | tenantId 필터 |

**변경 불필요 (테넌트 무관)**
| API | 이유 |
|-----|------|
| `/api/auth/*` | Clerk 인증은 테넌트 무관 |
| `/api/health` | 시스템 헬스 체크 |
| `/api/webhooks/receive` | 외부 웹훅 수신 |
| `/api/onboarding/*` | 신규 (테넌트 생성 전) |
| `/api/subscriptions/*` | 신규 (Stripe 연동) |
| `/api/superadmin/*` | 신규 (전체 테넌트 대상) |

### 3.2 인증 변경 사항

기존 인증 플로우는 유지하되, 테넌트 컨텍스트를 추가한다.

```
현재:
  Cookie(impd_session) → JWT 검증 → userId → adminUsers 조회

전환 후:
  Cookie(impd_session) → JWT 검증 → userId
    + x-tenant-id 헤더 → tenantMembers 조회 → (tenantId, role)
```

### 3.3 마이그레이션 순서

```
1단계: 헬퍼 함수 작성
   - getTenantFromRequest(req): x-tenant-id 헤더에서 tenantId 추출
   - requireTenantRole(req, roles[]): 역할 검증
   - withTenantFilter(query, tenantId): 쿼리에 tenantId 조건 추가

2단계: 콘텐츠 API 마이그레이션 (가장 많이 사용되는 API)
   - /api/courses, /api/pd/*, /api/inquiries, /api/leads

3단계: 어드민 API 마이그레이션
   - /api/admin/distributors, /api/admin/resources, /api/admin/payments

4단계: 미디어/비디오 API 마이그레이션
   - /api/videos, /api/playlists, /api/live

5단계: AI/자동화 API 마이그레이션
   - /api/ai, /api/chat, /api/sns

6단계: 신규 API 추가
   - /api/tenants, /api/subscriptions, /api/superadmin, /api/onboarding
```

---

## 4. 공통 응답 형식

### 4.1 성공 응답
```json
// 단일 리소스
{ "id": 1, "name": "...", ... }

// 목록
{ "items": [...], "total": 42, "page": 1, "limit": 20 }
```

### 4.2 에러 응답
```json
{
  "error": "테넌트를 찾을 수 없습니다.",
  "code": "TENANT_NOT_FOUND",
  "details": { "slug": "nonexistent" }
}
```

### 4.3 에러 코드 체계

| 코드 | HTTP | 설명 |
|------|------|------|
| `TENANT_NOT_FOUND` | 404 | 테넌트 없음 |
| `TENANT_SUSPENDED` | 403 | 테넌트 정지됨 |
| `TENANT_SLUG_TAKEN` | 409 | slug 중복 |
| `PLAN_LIMIT_EXCEEDED` | 403 | 플랜 한도 초과 |
| `SUBSCRIPTION_REQUIRED` | 402 | 유료 플랜 필요 |
| `INSUFFICIENT_ROLE` | 403 | 권한 부족 |
| `MEMBER_NOT_FOUND` | 404 | 멤버 없음 |
| `MEMBER_ALREADY_EXISTS` | 409 | 이미 등록된 멤버 |
