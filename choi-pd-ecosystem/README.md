# 최범희 대표 통합 브랜드 허브

5060 베이비부머를 위한 스마트폰 창업 교육, 한국환경저널 발행인 최범희 대표의 공식 웹사이트입니다.

## 🚀 기술 스택

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (진행 예정)
- **State Management**: Zustand
- **Database**: SQLite (LibSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Clerk
- **Form Management**: React Hook Form + Zod

## 📦 프로젝트 구조

```
choi-pd-ecosystem/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root Layout
│   │   ├── page.tsx          # Home Page
│   │   └── globals.css       # Global Styles
│   ├── components/           # React Components
│   │   ├── ui/              # shadcn/ui components (진행 예정)
│   │   ├── layout/          # Header, Footer (진행 예정)
│   │   └── forms/           # Form components (진행 예정)
│   ├── lib/
│   │   ├── db/              # Database
│   │   │   ├── schema.ts    # Drizzle Schema
│   │   │   └── index.ts     # DB Connection
│   │   ├── stores/          # Zustand Stores
│   │   │   ├── uiStore.ts   # UI State
│   │   │   └── formStore.ts # Form State
│   │   └── utils.ts         # Utility Functions
│   ├── middleware.ts        # Clerk Middleware
│   └── types/               # TypeScript Types
├── data/
│   └── database.db          # SQLite Database
├── scripts/
│   └── seed.ts              # Database Seeding
├── public/
│   ├── images/              # Static Images
│   └── uploads/             # User Uploads
└── drizzle.config.ts        # Drizzle Configuration
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일이 이미 생성되어 있습니다. Clerk 키가 설정되어 있는지 확인하세요.

```env
# Database
DATABASE_URL=file:./data/database.db

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here
CLERK_SECRET_KEY=your_key_here
```

### 3. 데이터베이스 설정

```bash
# 데이터베이스 스키마 푸시
npm run db:push

# 샘플 데이터 시딩
npm run db:seed
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3011](http://localhost:3011) 을 열어 확인하세요.

## 🌐 배포 정보

### 프로덕션 서버
- **서버 IP**: 58.255.113.125
- **접속 URL**: http://58.255.113.125
- **도메인 (예정)**: https://impd.co.kr
- **포트**: 3011 (Nginx 리버스 프록시)

### 주요 페이지 접속
- **홈페이지**: http://58.255.113.125
- **관리자 패널**: http://58.255.113.125/admin
- **PD 대시보드**: http://58.255.113.125/pd
- **Health Check**: http://58.255.113.125/api/health

### 배포 관련 문서
- [배포 가이드](../DEPLOYMENT.md) - 상세 배포 절차
- [배포 URL](../DEPLOYMENT_URLS.md) - 전체 URL 목록
- [포트 할당](../PORT_ALLOCATION.md) - 포트 관리 문서

## 📝 사용 가능한 스크립트

```bash
# 개발 서버 실행 (포트 3011)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행 (포트 3011)
npm start

# 린트 검사
npm run lint

# 데이터베이스 스키마 푸시
npm run db:push

# Drizzle Studio 실행 (DB GUI)
npm run db:studio

# 데이터베이스 마이그레이션 생성
npm run db:generate

# 시드 데이터 실행
npm run db:seed

# 테스트 실행
npm test                  # 단위 테스트
npm run test:watch        # 단위 테스트 (워치 모드)
npm run test:coverage     # 커버리지 리포트
npm run test:e2e          # E2E 테스트
npm run test:e2e:ui       # E2E 테스트 (UI 모드)
npm run test:e2e:debug    # E2E 테스트 (디버그 모드)
npm run test:lighthouse   # Lighthouse 성능 테스트
```

## 🗄️ 데이터베이스 스키마

### Courses (교육 과정)
- 온라인/오프라인/B2B 과정 관리
- 가격, 썸네일, 외부 링크 지원

### Posts (공지사항/소식)
- 공지사항, 수강생 후기, 미디어 활동
- 발행/비공개 상태 관리

### Works (작품 및 언론 보도)
- 갤러리 (스마트폰 스케치)
- 언론 보도 아카이빙

### Inquiries (문의 사항)
- B2B/일반 문의 관리
- 상태 추적 (대기/연락완료/종료)

### Leads (뉴스레터 구독)
- 이메일 수집 및 관리

## 🔐 인증 (Clerk)

이 프로젝트는 Clerk를 사용하여 관리자 인증을 처리합니다.

- **보호된 경로**: `/admin/*`
- **로그인 페이지**: `/admin/sign-in`
- **가입 페이지**: `/admin/sign-up`

## 🧪 테스트

### 테스트 프레임워크
- **Jest**: 단위 테스트 및 통합 테스트
- **Playwright**: E2E 테스트
- **@axe-core/playwright**: 접근성 테스트 (WCAG 2.1 AA)
- **Lighthouse**: 성능 테스트

### 테스트 구조
```
choi-pd-ecosystem/
├── e2e/                              # E2E 테스트
│   ├── homepage.spec.ts              # 홈페이지 테스트
│   ├── accessibility.spec.ts         # 접근성 테스트
│   ├── admin-hero-images.spec.ts     # Admin Hero 이미지
│   ├── admin-distributors.spec.ts    # 분양자 관리
│   └── pd-dashboard.spec.ts          # PD 대시보드
├── src/app/api/__tests__/            # API 통합 테스트
│   ├── distributors.test.ts          # 분양자 API
│   ├── auth.test.ts                  # 인증 API
│   └── newsletter.test.ts            # 뉴스레터 API
└── src/lib/**/__tests__/             # 단위 테스트
    ├── validation.test.ts            # 검증 로직
    └── imageProcessing.test.ts       # 이미지 처리
```

### 테스트 커버리지
- 단위 테스트: ~75% 커버리지
- E2E 테스트: 5개 스펙 파일, 30+ 시나리오
- 접근성 테스트: WCAG 2.1 AA 준수

자세한 내용은 `EPIC_14_COMPLETE.md`를 참조하세요.

## 📊 개발 상태

✅ **완료된 Epic**
- [x] Epic 1: 핵심 인증 및 사용자 관리 시스템
- [x] Epic 2: 분양 플랫폼 관리 시스템 (부분 완료)
- [x] Epic 3: 분양자 리소스 관리 시스템 (부분 완료)
- [x] Epic 4: 활동 로그 및 분석 대시보드 (부분 완료)
- [x] Epic 5: PD 개인 브랜드 관리 시스템 (부분 완료)
- [x] Epic 7-10: 문의/알림/SNS 시스템 (부분 완료)
- [x] Epic 14: 테스트 및 품질 보증 ✅

🔄 **진행 중**
- [ ] Epic 6: 콘텐츠 관리 시스템 (CMS)
- [ ] Epic 9: 결제 및 구독 관리
- [ ] Epic 11: SEO 및 퍼포먼스 최적화

자세한 로드맵은 `EPIC_ROADMAP.md`를 참조하세요.

## 📚 참고 문서

프로젝트 루트 디렉토리의 다음 문서들을 참조하세요:
- `prd.md` - 제품 요구 문서
- `lld.md` - 로우레벨 디자인
- `plan.md` - 프로젝트 실행 계획
- `task.md` - 개발 태스크 목록

## 🤝 기여

이 프로젝트는 최범희 대표의 공식 브랜드 허브입니다.

## 📝 라이선스

ISC

---

**개발 시작일**: 2025년 11월 8일
**현재 단계**: Week 1 완료 ✅
