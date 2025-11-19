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

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열어 확인하세요.

## 📝 사용 가능한 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
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

## 📊 Week 1 완료 상태

✅ **완료된 작업**
- [x] Next.js 프로젝트 초기화
- [x] TypeScript 및 Tailwind CSS 설정
- [x] Drizzle ORM 데이터베이스 설정
- [x] Clerk 인증 통합
- [x] Zustand 상태 관리
- [x] 기본 프로젝트 구조
- [x] 샘플 데이터 시딩

🔄 **다음 단계 (Week 2)**
- [ ] shadcn/ui 컴포넌트 설치
- [ ] Header/Footer 레이아웃
- [ ] Home 페이지 구현
- [ ] Education 페이지 시작

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
