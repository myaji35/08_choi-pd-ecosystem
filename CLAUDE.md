# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project Name**: imPD (I'm PD - Interactive Management Platform for Distribution)

This is a Next.js-based integrated brand hub and distribution platform for 최범희 (Choi Beom-hee) PD:

### Core Identities
1. **Education**: Smartphone startup strategist ("최PD의 스마트폰 연구소")
2. **Media**: Publisher of Korean Environmental Journal (한국환경저널)
3. **Works**: Author and mobile sketch artist

### Platform Purpose
- **Primary**: Distribution platform for reselling the brand ecosystem to end customers
- **Secondary**: Content management system for the PD's own brand management

**Status**: Active development. See `prd.md` for complete product requirements.

## Technology Stack

- **Framework**: Next.js v16+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Database**: SQLite

## Architecture Principles

### Database Schema (SQLite)

The application uses a single SQLite database with the following core tables:

**Content Tables**:
- **Courses**: Education programs (id, title, description, type, price, thumbnail_url, external_link)
- **Posts**: Blog-style announcements and community content (id, title, content, category, created_at, published)
- **Works**: Gallery images and press coverage (id, title, description, image_url, category: 'gallery' | 'press')
- **Inquiries**: B2B/B2G lead capture (id, name, email, phone, message, type: 'b2b' | 'contact', created_at)
- **Leads**: Newsletter subscriptions (id, email, subscribed_at)

**Admin Tables**:
- **AdminUsers**: Admin authentication (id, username, password, role, created_at, updated_at)
- **Settings**: Site settings (id, key, value, updated_at)
- **HeroImages**: Hero section images (id, filename, url, alt_text, is_active)

**SNS Integration Tables**:
- **SnsAccounts**: SNS platform connections (id, platform, account_name, access_token, is_active)
- **SnsScheduledPosts**: Scheduled posts (id, content_type, content_id, platform, message, scheduled_at, status)
- **SnsPostHistory**: Post history logs (id, scheduled_post_id, action, status, response)

**Distribution Platform Tables** (NEW):
- **Distributors**: Reseller/distributor management (id, name, email, business_type, region, status, subscription_plan, total_revenue)
- **DistributorActivityLog**: Activity tracking (id, distributor_id, activity_type, description, metadata, created_at)
- **DistributorResources**: Resources for distributors (id, title, file_url, file_type, category, required_plan, download_count)

### State Management (Zustand)

Use minimal, focused stores:
- **uiStore**: `isMobileMenuOpen`, `isModalOpen`
- **formStore**: `isLoading`, `error` - shared across all form submissions

### Key Architectural Patterns

1. **Dual Admin System**:
   - `/admin/*`: Distribution platform management (distributors, resources, analytics)
   - `/pd/*`: PD's personal content management (profile, social media, hero images, kanban)
2. **CMS-Driven Content**: All dynamic content (courses, posts, gallery, press) is managed via admin routes with CRUD operations backed by SQLite
3. **Mobile-First Responsive**: Tailwind CSS with mobile-first breakpoints, leveraging shadcn/ui components
4. **ISR for Performance**: Use Next.js Incremental Static Regeneration for dynamic feeds (latest courses, environmental journal activities)
5. **API Routes**: All database operations go through Next.js API Routes in `/app/api/` (never direct DB access from client)
6. **External Payment Integration**: VOD courses link to external payment platforms (Stripe, TossPayments) - SQLite only stores course metadata, not transactions

## Core Features Structure

### Main Sections
- **Home** (`/`): Hero with multi-faceted identity, service hub cards (Education/Media/Works), dynamic feed
- **Education** (`/education`): Course catalog, B2B/B2G inquiry forms, VOD course links
- **Media** (`/media`): Korean Environmental Journal introduction, publisher's message, key activities archive
- **Works** (`/works`): Book showcase, mobile sketch gallery, press archive
- **Community** (`/community`): Announcements, student testimonials, newsletter signup

### Admin Systems

#### Distribution Platform Admin (`/admin/*`)
**Purpose**: Manage distributors/resellers who want to adopt the imPD platform
- Distributor management (registration, approval, status tracking)
- Resource library management (marketing materials, training docs, templates)
- Activity log and analytics
- Revenue tracking and reporting
- Authentication middleware required for all `/admin` routes

#### PD Personal Dashboard (`/pd/*`)
**Purpose**: PD's own brand and content management
- Profile photo management
- Social media account integration
- Hero image uploads
- Kanban project board
- Newsletter subscriber management
- Authentication middleware required for all `/pd` routes

**Shared Authentication**: Both admin areas use the same authentication system (Clerk in production, dev-mode in development)

## Target Audiences

- **B2C**: Baby boomers (50-60s) interested in second careers via smartphone entrepreneurship
- **B2B**: Small business owners needing digital marketing education
- **B2G/Social**: Organizations interested in environmental journalism and media literacy training

## Development Commands

(To be added once project scaffold is created)

## SEO & Performance Requirements

- All major pages must have optimized meta tags and semantic HTML
- Target fast LCP (Largest Contentful Paint) using SSR/SSG
- Mobile-first responsive design required for all pages
- SQLite database must have regular backup strategy

## Future Phases

- **Phase 2**: Self-hosted VOD payment system, student-only community area
- **Phase 3**: Korean Environmental Journal RSS/API integration

## Harness 운영 규칙 (GH_Harness 패턴 적용)

GH_Harness의 실전 패턴을 이 프로젝트에 맞게 적용한다.

### 1. Progressive Disclosure (컨텍스트 절약)

작업 시 정보를 단계적으로 로드하여 context window를 보호한다.

```
1단계 (항상 로드): 현재 이슈 내용 + 관련 파일 목록(내용 X) + 이전 결과 요약 1줄
2단계 (필요 시만): 실제 파일 내용(이슈 관련만) + 실패 로그(성공 로그 X)
3단계 (정말 필요 시): 전체 프로젝트 구조 + 과거 유사 패턴
```

**출력 원칙:**
- 성공 → 핵심 수치만 (예: "테스트 통과: 42/42, 커버리지: 84%")
- 실패 → 전체 오류 상세 (스택 트레이스 + 파일:라인)
- 진행 중 → 현재 단계만 (예: "3/6 파일 처리 중")

### 2. 이슈 깊이 제한 (파생 작업 폭발 방지)

작업에서 파생 작업이 생길 때 **최대 3단계까지만** 허용한다.

```
원본 작업 (depth 0)
  └─ 파생 작업 (depth 1) — 예: 코드 생성 → 테스트
      └─ 파생 작업 (depth 2) — 예: 테스트 실패 → 버그 수정
          └─ 파생 작업 (depth 3) — 예: 버그 수정 → 재테스트
              ❌ depth 4 이상 → 대표님께 보고 후 판단
```

### 3. 실패 재시도 및 에스컬레이션

```
같은 작업 실패 1~2회: 자율 재시도 (다른 접근법으로)
같은 작업 실패 3회: 즉시 중단 + 근본 원인 분석 보고
같은 파일에서 3회 이상 버그 수정: 해당 모듈 리팩토링 제안
```

### 4. 작업 파이프라인 흐름

코드 변경 시 아래 순서를 자동으로 따른다:

```
코드 생성/수정 → 테스트 실행 → 품질 확인 → 커밋
     ↓              ↓             ↓
  실패 시         실패 시       점수 낮으면
  즉시 수정    FIX → 재테스트   개선 후 재확인
```

### 5. 교차 검증 체크리스트

코드 작성 완료 후 자가 검증:
```
□ OWASP Top 10 보안 취약점 없는지
□ 엣지 케이스 처리 여부
□ 에러 처리 누락 없는지
□ 하드코딩된 값 없는지
□ 불필요한 복잡도 없는지
```

### 6. 이슈 폭발 방지

```
- 유사 작업 중복 금지: 이미 진행 중인 유사 작업이 있으면 새로 만들지 않음
- 백로그 > 10개: 낮은 우선순위 작업 생성 중단, 기존 작업 완료 우선
- 같은 제목 3회 반복: 근본 원인 분석으로 에스컬레이션
```
