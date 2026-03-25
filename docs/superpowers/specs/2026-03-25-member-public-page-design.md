# Design: 회원 개인비즈니스 페이지 시스템

> 프리랜서/개인사업자를 위한 모듈형 개인비즈니스 페이지 플랫폼

## 1. 개요

imPD를 "유통 플랫폼 분양" 모델에서 **개인비즈니스 페이지 SaaS 플랫폼**으로 전환한다. 각 회원은 `{slug}.impd.townin.net` 서브도메인으로 자신의 홍보 페이지를 운영한다.

### 핵심 도메인 구조
- `impd.townin.net` → 플랫폼 랜딩 (로그인 전 홍보) + 관리자/회원 대시보드
- `{slug}.impd.townin.net` → 회원별 공개 비즈니스 페이지
- `chopd.impd.townin.net` → 최PD 본인의 비즈니스 페이지 (쇼케이스 데모)

## 2. 사용자 흐름

```
TowninGraph 회원가입
  → impd.townin.net "TowninGraph로 로그인" 클릭
  → TowninGraph OAuth 인증 (authorization_code)
  → imPD 콜백으로 리다이렉트
  → access_token 교환 → 사용자 정보 조회
  → 첫 로그인: 승인 신청 폼 (slug 선택, 사업 정보)
  → 관리자 승인 대기 (status: pending_approval)
  → 승인 후: 대시보드 접근 + {slug}.impd.townin.net 활성화
```

### 승인 상태
| 상태 | 설명 | 페이지 공개 |
|------|------|:----------:|
| pending_approval | 승인 대기 | X |
| approved | 승인 완료 | O |
| rejected | 거부 (사유 표시) | X |
| suspended | 정지 (관리자) | X |

## 3. 랜딩 페이지 (`impd.townin.net`) 구성

현재 B2B 분양 페이지를 SaaS 소개 + 회원 쇼케이스 혼합으로 리뉴얼.

### 섹션 구성
1. **히어로**: "나만의 비즈니스 페이지를 5분 만에" + CTA "TowninGraph로 시작하기"
2. **기능 소개**: 7개 모듈 아이콘 + 설명
3. **회원 쇼케이스**: 승인된 회원 페이지 카드 3~6개 (라이브 미리보기)
4. **플랜 비교**: Basic / Premium / Enterprise
5. **하단 CTA**: "지금 시작하기" → TowninGraph 가입

## 4. 회원 공개 페이지 (`{slug}.impd.townin.net`)

### 모듈 구성 (7개)
| 모듈 | 필수 | 구성 요소 |
|------|:----:|----------|
| 프로필 | O | 이름, 사진, 소개글, SNS 링크, 커버 이미지 |
| 포트폴리오 | X | 이미지/영상 그리드, 카테고리 필터, 상세 모달 |
| 서비스/상품 | X | 서비스명, 설명, 가격, CTA 버튼 |
| 블로그/소식 | X | 글 목록, 상세, 카테고리 |
| 문의폼 | X | 이름, 이메일, 메시지, 이메일 알림 |
| 후기/리뷰 | X | 작성자, 별점, 내용, 날짜 |
| 예약 | X | 외부 예약 링크 임베드 (Calendly 등) |

### 페이지 레이아웃
```
┌──────────────────────────────────────┐
│ 커버 이미지                           │
├──────────────────────────────────────┤
│ [프로필] 사진 + 이름 + 소개 + SNS     │
├──────────────────────────────────────┤
│ 네비게이션 탭 (활성화된 모듈만 표시)    │
│ [포트폴리오] [서비스] [블로그] [후기]...│
├──────────────────────────────────────┤
│ 선택된 탭 콘텐츠                      │
├──────────────────────────────────────┤
│ [문의폼] (하단 고정 가능)              │
└──────────────────────────────────────┘
```

### 플랜별 모듈 제한
| 플랜 | 모듈 수 | 추가 기능 |
|------|:------:|----------|
| Basic | 프로필 + 2개 | 기본 테마 |
| Premium | 프로필 + 5개 | 테마 커스텀 + 커스텀 도메인 |
| Enterprise | 전체 | 커스텀 도메인 + 분석 + API |

## 5. 인증 시스템 (Clerk 제거 → OAuth 통합)

### Clerk 완전 제거
- `@clerk/nextjs` 패키지 제거
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` 환경변수 제거
- `src/middleware.ts`에서 Clerk 관련 코드 제거
- `src/app/layout.tsx`의 `<ClerkProvider>` 제거
- dev-auth 쿠키 방식도 제거

### 통합 인증 체계
| 사용자 | OAuth Provider | 로그인 방식 |
|--------|---------------|------------|
| **관리자** | Google Workspace | Google OAuth (조직 계정) |
| **회원** | TowninGraph | TowninGraph OAuth |

### 관리자 인증: Google Workspace OAuth
```
관리자 → "Google로 로그인" 클릭
  → Google OAuth 인증 (accounts.google.com)
  → 콜백으로 리다이렉트
  → email이 허용 목록(@gagahoho.com 등)에 있는지 확인
  → 관리자 세션 생성 (role: admin)
```

**imPD에서 구현할 항목**:
- Google Cloud Console에서 OAuth 클라이언트 등록
- `/api/auth/google` → Google authorize URL로 리다이렉트
- `/api/auth/google/callback` → code → token 교환 → userinfo → 관리자 확인 → 세션 생성
- 허용 도메인/이메일 목록으로 관리자 자격 검증

**환경변수**:
```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://impd.townin.net/api/auth/google/callback
ADMIN_ALLOWED_EMAILS=admin@gagahoho.com  # 쉼표 구분 또는 도메인 패턴
```

### 회원 인증: TowninGraph OAuth
```
회원 → "TowninGraph로 로그인" 클릭
  → TowninGraph OAuth 인증
  → 콜백으로 리다이렉트
  → 첫 로그인: 승인 신청 폼
  → 기존 회원: 대시보드 진입
```

**imPD에서 구현할 항목**:
- TowninGraph에 OAuth 클라이언트 등록 (client_id, client_secret 발급)
- `/api/auth/towningraph` → TowninGraph authorize URL로 리다이렉트
- `/api/auth/towningraph/callback` → code → token 교환 → userinfo → 세션 생성

**환경변수**:
```env
TOWNINGRAPH_CLIENT_ID=
TOWNINGRAPH_CLIENT_SECRET=
TOWNINGRAPH_OAUTH_URL=https://towningraph.townin.net/oauth
TOWNINGRAPH_REDIRECT_URI=https://impd.townin.net/api/auth/towningraph/callback
```

### TowninGraph 엔드포인트 (구현 완료)
```
GET  /oauth/authorize        → 인증 페이지
POST /oauth/token             → token 교환
GET  /api/oauth/userinfo      → 사용자 정보 {id, email, name, profile_image, created_at}
POST /oauth/revoke            → 토큰 무효화
```

### 통합 세션 관리
- **저장 위치**: httpOnly 쿠키 (`impd_session`)
- **JWT payload**: `{ userId, email, role, slug?, provider, iat, exp }`
  - `role`: `admin` | `member`
  - `provider`: `google` | `towningraph`
  - `slug`: 회원만 해당 (승인 후)
- **만료**: 쿠키 24시간 (자동 갱신)
- **로그아웃**: imPD 쿠키 삭제 + 해당 provider revoke 호출

### 로그인 페이지 (`/login`)
```
┌──────────────────────────────────┐
│        imPD 로그인               │
│                                  │
│  [🔵 TowninGraph로 로그인]       │  ← 회원용
│                                  │
│  ─── 또는 ───                    │
│                                  │
│  [⚪ Google로 로그인 (관리자)]    │  ← 관리자용
│                                  │
└──────────────────────────────────┘
```

### 미들웨어 인증 처리
| 경로 | 인증 | 조건 |
|------|------|------|
| `/admin/*` | JWT 쿠키 검증 | `role === 'admin'` 필수 |
| `/dashboard/*` | JWT 쿠키 검증 | `role === 'member'` + `status === 'approved'` |
| `/pd/*` | JWT 쿠키 검증 | `role === 'admin'` (Phase 5에서 `/dashboard`로 통합) |
| `/member/*` | 없음 (공개) | 서브도메인 rewrite |
| `/login` | 없음 (공개) | 이미 로그인 시 대시보드로 리다이렉트 |

## 6. DB 스키마

### 신규 테이블

```sql
-- 회원 (기존 distributors 대체/확장)
members (
  id INTEGER PRIMARY KEY,
  towningraph_user_id TEXT UNIQUE,     -- 외부 연동 키
  slug TEXT UNIQUE NOT NULL,           -- 서브도메인 slug
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  profile_image TEXT,
  cover_image TEXT,
  bio TEXT,                            -- 소개글
  social_links TEXT,                   -- JSON: {instagram, youtube, ...}
  business_type TEXT,                  -- individual | company | organization
  region TEXT,
  status TEXT DEFAULT 'pending_approval', -- pending_approval|approved|rejected|suspended
  subscription_plan TEXT DEFAULT 'basic', -- basic|premium|enterprise
  enabled_modules TEXT DEFAULT '[]',   -- JSON: ["portfolio","services",...]
  theme_config TEXT DEFAULT '{}',      -- JSON: {primaryColor, layout, ...}
  rejection_reason TEXT,               -- 거부 사유
  is_featured INTEGER DEFAULT 0,       -- 쇼케이스 노출 여부
  featured_order INTEGER DEFAULT 0,    -- 쇼케이스 노출 순서
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 포트폴리오
member_portfolio_items (
  id INTEGER PRIMARY KEY,
  member_id INTEGER REFERENCES members(id),
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT,                     -- image | video
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP
)

-- 서비스/상품
member_services (
  id INTEGER PRIMARY KEY,
  member_id INTEGER REFERENCES members(id),
  title TEXT NOT NULL,
  description TEXT,
  price TEXT,
  price_label TEXT,                    -- "50,000원~"
  cta_url TEXT,
  cta_label TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMP
)

-- 블로그/소식
member_posts (
  id INTEGER PRIMARY KEY,
  member_id INTEGER REFERENCES members(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  thumbnail_url TEXT,
  is_published INTEGER DEFAULT 0,
  published_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 문의
member_inquiries (
  id INTEGER PRIMARY KEY,
  member_id INTEGER REFERENCES members(id),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at TIMESTAMP
)

-- 후기
member_reviews (
  id INTEGER PRIMARY KEY,
  member_id INTEGER REFERENCES members(id),
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL,             -- 1-5
  content TEXT,
  is_approved INTEGER DEFAULT 0,
  created_at TIMESTAMP
)

-- 예약 설정
member_bookings (
  id INTEGER PRIMARY KEY,
  member_id INTEGER REFERENCES members(id),
  booking_type TEXT,                   -- external_link | calendar
  external_url TEXT,
  description TEXT
)
```

### 기존 테이블 마이그레이션
- `distributors` → `members`로 데이터 이관
- `distributorActivityLog` → 기존 유지 (member_id로 FK 변경)
- `distributorResources` → 기존 유지 (member_id로 FK 변경)
- `payments` → member_id로 FK 변경
- `invoices` → member_id로 FK 변경
- `subscriptionPlans` → 기존 유지 (maxDistributors → maxMembers 리네이밍)

### JSON 필드 Zod 스키마
```typescript
const socialLinksSchema = z.object({
  instagram: z.string().url().optional(),
  youtube: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  twitter: z.string().url().optional(),
  facebook: z.string().url().optional(),
  blog: z.string().url().optional(),
  website: z.string().url().optional(),
});

const enabledModulesSchema = z.array(
  z.enum(["portfolio", "services", "blog", "contact", "reviews", "booking"])
);

const themeConfigSchema = z.object({
  primaryColor: z.string().default("#00A1E0"),
  layout: z.enum(["default", "minimal", "bold"]).default("default"),
  fontFamily: z.string().default("Inter"),
});
```

### 삭제 정책
- 회원 탈퇴 시: soft delete (status → 'deleted', 30일 보관 후 hard delete)
- 모듈 데이터: CASCADE (members 삭제 시 함께 삭제)

## 7. 라우팅 구조

### 서브도메인 처리 (middleware.ts)
```
{slug}.impd.townin.net → /member/{slug}/* 로 내부 rewrite
impd.townin.net        → / (랜딩 + 관리)
```

#### slug 추출 로직
```typescript
// hostname에서 slug 추출
const hostname = request.headers.get('host') || '';
const baseDomain = 'impd.townin.net';

if (hostname === baseDomain || hostname === `www.${baseDomain}`) {
  // 메인 도메인 → 일반 라우팅
} else if (hostname.endsWith(`.${baseDomain}`)) {
  const slug = hostname.replace(`.${baseDomain}`, '');
  if (!RESERVED_SLUGS.includes(slug)) {
    // 회원 페이지 rewrite
    return NextResponse.rewrite(new URL(`/member/${slug}${pathname}`, request.url));
  }
}
```

#### 예약어 slug 목록
```typescript
const RESERVED_SLUGS = [
  'admin', 'api', 'pd', 'www', 'mail', 'ftp',
  'dashboard', '_next', 'static', 'public',
  'login', 'signup', 'auth', 'oauth',
];
```

#### slug 유효성 규칙
- 길이: 3~30자
- 허용 문자: 영문 소문자, 숫자, 하이픈 (`/^[a-z0-9][a-z0-9-]*[a-z0-9]$/`)
- 한글 slug 불가 (서브도메인 호환성)
- 예약어 불가
- 변경 시: 기존 slug로 301 리다이렉트 (30일간 유지)

#### 미들웨어 인증 처리
```typescript
// /dashboard/* 경로 보호
if (pathname.startsWith('/dashboard')) {
  const sessionToken = request.cookies.get('impd_session');
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  // JWT 검증 → 유효하면 통과, 만료면 /login 리다이렉트
}
```

#### 비활성 회원 페이지 접근 처리
- `pending_approval` → "승인 대기 중" 안내 페이지
- `rejected` → 404
- `suspended` → "일시 정지된 페이지" 안내 페이지
- 존재하지 않는 slug → 404

### 회원 쇼케이스 선정 기준
- 관리자가 `members` 테이블의 `is_featured` 플래그로 수동 선택
- 6개까지, 노출 순서는 `featured_order` 필드

### 신규 라우트
```
-- 공개 (서브도메인 → 내부 rewrite)
/member/[slug]                → 회원 공개 페이지 (프로필 + 활성 모듈)
/member/[slug]/portfolio      → 포트폴리오 상세
/member/[slug]/services       → 서비스/상품 목록
/member/[slug]/blog           → 블로그 목록
/member/[slug]/blog/[id]      → 블로그 상세
/member/[slug]/reviews        → 후기
/member/[slug]/booking        → 예약
/member/[slug]/contact        → 문의폼

-- 회원 대시보드 (인증 필요)
/dashboard                    → 회원 대시보드 메인
/dashboard/profile            → 프로필 편집
/dashboard/modules            → 모듈 활성화/비활성화
/dashboard/portfolio          → 포트폴리오 관리
/dashboard/services           → 서비스 관리
/dashboard/blog               → 블로그 관리
/dashboard/inquiries          → 수신 문의 관리
/dashboard/reviews            → 후기 관리
/dashboard/booking            → 예약 설정
/dashboard/settings           → slug, 테마, 플랜 설정

-- API
/api/auth/towningraph         → OAuth 시작
/api/auth/towningraph/callback → OAuth 콜백
/api/members/[slug]           → 회원 공개 데이터 조회
/api/dashboard/*              → 회원 대시보드 CRUD
```

### 기존 라우트 유지
- `/admin/*` → 플랫폼 관리자 (기존 유지, Clerk 인증) + `/admin/members` 추가 (회원 승인/관리)
- `/pd/*` → 최PD 개인 대시보드 (기존 유지, Phase 5에서 `/dashboard`로 통합 검토)
- `/chopd/*` → 기존 구조 유지. `chopd.impd.townin.net` 서브도메인으로도 접근 가능 (rewrite)

### `/chopd/*`와 회원 페이지의 관계
- `/chopd/*`는 최PD의 기존 풀사이트 (교육/미디어/작품/커뮤니티) 그대로 유지
- 회원 페이지(`/member/[slug]`)는 모듈형 구조로 별도 시스템
- `/chopd`는 쇼케이스 데모로 랜딩에서 "이런 페이지도 가능합니다" 사례로 링크

### 후기 승인 주체
- 해당 회원이 직접 승인/거부 (대시보드 `/dashboard/reviews`에서 관리)

### 문의폼 스팸 방지
- rate limiting: 동일 IP에서 분당 3건 제한
- 허니팟 필드 (봇 감지용 숨겨진 input)

## 8. 구현 순서

### Phase 1: 기반 (인증 전환 + DB)
1. Clerk 완전 제거 (@clerk/nextjs, ClerkProvider, middleware, 환경변수)
2. 통합 로그인 페이지 (`/login`) + Google OAuth (관리자)
3. TowninGraph OAuth (회원) + 통합 JWT 세션 관리
4. members 테이블 + 모듈 테이블 스키마 추가 (distributors 마이그레이션)
5. 승인 신청 + 관리자 승인 플로우 (`/admin/members`)
6. 서브도메인 미들웨어 (slug 추출 + 인증 분기)

### Phase 2: 회원 공개 페이지
5. 프로필 모듈 (필수)
6. 포트폴리오 모듈
7. 서비스/상품 모듈
8. 블로그 모듈
9. 문의폼 모듈
10. 후기 모듈
11. 예약 모듈

### Phase 3: 회원 대시보드
12. 대시보드 레이아웃 + 프로필 편집
13. 모듈 on/off 관리
14. 각 모듈별 CRUD UI

### Phase 4: 랜딩 페이지 리뉴얼
15. 히어로 + 기능 소개
16. 회원 쇼케이스
17. 플랜 비교

### Phase 5: 고도화
18. 테마 커스터마이징
19. 커스텀 도메인 연결
20. 분석 대시보드
