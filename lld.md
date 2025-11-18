# LLD (Low-Level Design): 최범희 대표 통합 브랜드 허브

문서 버전: v1.0
작성일: 2025년 11월 8일
상태: 초안

---

## 1. 개요 (Overview)

본 문서는 PRD(제품 요구 문서)에 정의된 요구사항을 기반으로, Next.js 기반의 최범희 대표 통합 브랜드 허브의 **상세 기술 설계**를 다룹니다. 컴포넌트 구조, API 설계, 데이터베이스 스키마, 상태 관리, 인증/인가 메커니즘 등 구현 레벨의 세부사항을 명시합니다.

---

## 2. 기술 스택 상세

### 2.1 프론트엔드
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3+
- **UI Library**: shadcn/ui (Radix UI 기반)
- **State Management**: Zustand 4+
- **Form Validation**: React Hook Form + Zod
- **Icons**: Lucide React

### 2.2 백엔드
- **Runtime**: Node.js (Next.js API Routes)
- **Database**: SQLite3 with better-sqlite3
- **ORM/Query Builder**: Drizzle ORM (TypeScript-first)
- **Authentication**: NextAuth.js v5 (Credentials Provider)
- **Password Hashing**: bcrypt

### 2.3 배포 및 인프라
- **Hosting**: Vercel (권장) 또는 자체 호스팅
- **File Storage**: 로컬 파일 시스템 (초기) → 추후 S3/Cloudflare R2 마이그레이션
- **Database Backup**: 일일 SQLite 파일 백업 스크립트

---

## 3. 프로젝트 구조

```
/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (public)/             # 공개 페이지 그룹
│   │   │   ├── page.tsx          # 홈 (/)
│   │   │   ├── education/        # 교육 (/education)
│   │   │   ├── media/            # 미디어 (/media)
│   │   │   ├── works/            # 저작 및 활동 (/works)
│   │   │   └── community/        # 커뮤니티 (/community)
│   │   ├── admin/                # 관리자 페이지 그룹
│   │   │   ├── layout.tsx        # Admin Layout (인증 체크)
│   │   │   ├── dashboard/
│   │   │   ├── courses/
│   │   │   ├── posts/
│   │   │   ├── works/
│   │   │   ├── inquiries/
│   │   │   └── leads/
│   │   ├── api/                  # API Routes
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── courses/route.ts
│   │   │   ├── posts/route.ts
│   │   │   ├── works/route.ts
│   │   │   ├── inquiries/route.ts
│   │   │   └── leads/route.ts
│   │   ├── layout.tsx            # Root Layout
│   │   └── globals.css           # Tailwind CSS
│   ├── components/               # React Components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── layout/               # Header, Footer, Navigation
│   │   ├── home/                 # Home 페이지 컴포넌트
│   │   ├── education/            # Education 페이지 컴포넌트
│   │   ├── media/                # Media 페이지 컴포넌트
│   │   ├── works/                # Works 페이지 컴포넌트
│   │   ├── community/            # Community 페이지 컴포넌트
│   │   └── admin/                # Admin 컴포넌트
│   ├── lib/                      # Utility & Configuration
│   │   ├── db/                   # Database
│   │   │   ├── schema.ts         # Drizzle ORM Schema
│   │   │   ├── index.ts          # DB Connection
│   │   │   └── migrations/       # DB Migrations
│   │   ├── stores/               # Zustand Stores
│   │   │   ├── uiStore.ts
│   │   │   └── formStore.ts
│   │   ├── auth.ts               # NextAuth Configuration
│   │   ├── utils.ts              # Utility Functions
│   │   └── constants.ts          # 상수 정의
│   ├── types/                    # TypeScript Types
│   │   ├── database.ts
│   │   ├── forms.ts
│   │   └── api.ts
│   └── hooks/                    # Custom Hooks
│       ├── useCourses.ts
│       ├── usePosts.ts
│       └── useInquiries.ts
├── public/
│   ├── images/
│   ├── uploads/                  # CMS 업로드 이미지
│   └── favicon.ico
├── data/
│   └── database.db               # SQLite Database File
├── scripts/
│   ├── seed.ts                   # 초기 데이터 시딩
│   └── backup.sh                 # DB 백업 스크립트
├── .env.local                    # 환경 변수
├── drizzle.config.ts             # Drizzle ORM Config
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

---

## 4. 데이터베이스 설계

### 4.1 ERD (Entity Relationship Diagram)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Users      │       │   Courses    │       │    Posts     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ username     │       │ title        │       │ title        │
│ password_hash│       │ description  │       │ content      │
│ created_at   │       │ type         │       │ category     │
└──────────────┘       │ price        │       │ created_at   │
                       │ thumbnail_url│       │ published    │
                       │ external_link│       └──────────────┘
                       │ created_at   │
                       └──────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Works     │       │  Inquiries   │       │    Leads     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ title        │       │ name         │       │ email        │
│ description  │       │ email        │       │ subscribed_at│
│ image_url    │       │ phone        │       └──────────────┘
│ category     │       │ message      │
│ created_at   │       │ type         │
└──────────────┘       │ created_at   │
                       │ status       │
                       └──────────────┘
```

### 4.2 Drizzle ORM Schema (`src/lib/db/schema.ts`)

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users Table (관리자 계정)
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// Courses Table (교육 과정)
export const courses = sqliteTable('courses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type', { enum: ['online', 'offline', 'b2b'] }).notNull(),
  price: integer('price'), // nullable (무료 과정 가능)
  thumbnailUrl: text('thumbnail_url'),
  externalLink: text('external_link'), // VOD 플랫폼 링크
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  published: integer('published', { mode: 'boolean' }).default(true)
});

// Posts Table (공지사항/소식)
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category', { enum: ['notice', 'review', 'media'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  published: integer('published', { mode: 'boolean' }).default(true)
});

// Works Table (갤러리 & 언론 보도)
export const works = sqliteTable('works', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url').notNull(),
  category: text('category', { enum: ['gallery', 'press'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// Inquiries Table (문의 사항)
export const inquiries = sqliteTable('inquiries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  message: text('message').notNull(),
  type: text('type', { enum: ['b2b', 'contact'] }).notNull(),
  status: text('status', { enum: ['pending', 'contacted', 'closed'] }).default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// Leads Table (뉴스레터 구독)
export const leads = sqliteTable('leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  subscribedAt: integer('subscribed_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// TypeScript Types
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Work = typeof works.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type Lead = typeof leads.$inferSelect;
```

### 4.3 Database Connection (`src/lib/db/index.ts`)

```typescript
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('data/database.db');
export const db = drizzle(sqlite, { schema });
```

---

## 5. API 설계

### 5.1 REST API Endpoints

#### 5.1.1 Courses API (`/api/courses`)

**GET** `/api/courses` - 교육 과정 목록 조회
```typescript
// Query Parameters
type: 'online' | 'offline' | 'b2b' (optional)

// Response
{
  success: true,
  data: Course[]
}
```

**GET** `/api/courses/[id]` - 특정 과정 조회

**POST** `/api/courses` - 과정 생성 (관리자 전용)
```typescript
// Request Body
{
  title: string,
  description: string,
  type: 'online' | 'offline' | 'b2b',
  price?: number,
  thumbnailUrl?: string,
  externalLink?: string
}
```

**PATCH** `/api/courses/[id]` - 과정 수정 (관리자 전용)

**DELETE** `/api/courses/[id]` - 과정 삭제 (관리자 전용)

#### 5.1.2 Posts API (`/api/posts`)

구조는 Courses API와 유사하며, `category` 필터링 지원

#### 5.1.3 Works API (`/api/works`)

구조는 Courses API와 유사하며, `category` 필터링 지원

#### 5.1.4 Inquiries API (`/api/inquiries`)

**POST** `/api/inquiries` - 문의 접수 (공개)
```typescript
{
  name: string,
  email: string,
  phone?: string,
  message: string,
  type: 'b2b' | 'contact'
}
```

**GET** `/api/inquiries` - 문의 목록 조회 (관리자 전용)

**PATCH** `/api/inquiries/[id]` - 상태 업데이트 (관리자 전용)

#### 5.1.5 Leads API (`/api/leads`)

**POST** `/api/leads` - 뉴스레터 구독 (공개)
```typescript
{
  email: string
}
```

**GET** `/api/leads` - 구독자 목록 & CSV 내보내기 (관리자 전용)

### 5.2 API Response 표준

```typescript
// Success Response
{
  success: true,
  data: T,
  message?: string
}

// Error Response
{
  success: false,
  error: string,
  details?: any
}
```

---

## 6. 인증 및 인가 (Authentication & Authorization)

### 6.1 NextAuth.js 설정 (`src/lib/auth.ts`)

```typescript
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const user = await db.query.users.findFirst({
          where: eq(users.username, credentials.username as string)
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return {
          id: user.id.toString(),
          name: user.username
        };
      }
    })
  ],
  pages: {
    signIn: '/admin/login'
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');

      if (isOnAdmin && !isLoggedIn) {
        return false; // Redirect to login
      }
      return true;
    }
  }
});
```

### 6.2 관리자 페이지 보호 (`src/app/admin/layout.tsx`)

```typescript
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="admin-layout">
      {/* Admin Sidebar/Navigation */}
      <main>{children}</main>
    </div>
  );
}
```

---

## 7. 상태 관리 (Zustand Stores)

### 7.1 UI Store (`src/lib/stores/uiStore.ts`)

```typescript
import { create } from 'zustand';

interface UIStore {
  isMobileMenuOpen: boolean;
  isModalOpen: boolean;
  toggleMobileMenu: () => void;
  openModal: () => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  isModalOpen: false,
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false })
}));
```

### 7.2 Form Store (`src/lib/stores/formStore.ts`)

```typescript
import { create } from 'zustand';

interface FormStore {
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useFormStore = create<FormStore>((set) => ({
  isLoading: false,
  error: null,
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set({ isLoading: false, error: null })
}));
```

---

## 8. 주요 컴포넌트 설계

### 8.1 공통 컴포넌트

#### Header (`src/components/layout/Header.tsx`)
- 로고, 네비게이션 메뉴
- 모바일 햄버거 메뉴 (Zustand `isMobileMenuOpen` 활용)
- shadcn/ui `NavigationMenu` 컴포넌트 사용

#### Footer (`src/components/layout/Footer.tsx`)
- 연락처, 소셜 미디어 링크
- 저작권 정보

#### CourseCard (`src/components/education/CourseCard.tsx`)
```typescript
interface CourseCardProps {
  course: Course;
  variant?: 'default' | 'featured';
}
```
- shadcn/ui `Card` 컴포넌트 활용
- 썸네일, 제목, 설명, 가격, CTA 버튼

### 8.2 폼 컴포넌트

#### InquiryForm (`src/components/forms/InquiryForm.tsx`)
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const inquirySchema = z.object({
  name: z.string().min(2, '이름을 입력해주세요'),
  email: z.string().email('유효한 이메일을 입력해주세요'),
  phone: z.string().optional(),
  message: z.string().min(10, '최소 10자 이상 입력해주세요'),
  type: z.enum(['b2b', 'contact'])
});

type InquiryFormData = z.infer<typeof inquirySchema>;
```

- shadcn/ui `Form`, `Input`, `Textarea`, `Button` 컴포넌트 활용
- React Hook Form + Zod 유효성 검사
- Zustand `formStore`로 로딩/에러 상태 관리

#### NewsletterForm (`src/components/forms/NewsletterForm.tsx`)
- 이메일 입력 + 구독 버튼
- `/api/leads` POST 요청

### 8.3 Admin 컴포넌트

#### DataTable (`src/components/admin/DataTable.tsx`)
- shadcn/ui `Table` 컴포넌트 기반
- 페이지네이션, 정렬, 검색 기능
- CSV 내보내기 버튼

#### CourseEditor (`src/components/admin/CourseEditor.tsx`)
- CRUD 폼 (생성/수정 모두 처리)
- 이미지 업로드 (File Input → `/api/upload`)

---

## 9. 페이지별 구현 세부사항

### 9.1 Home Page (`src/app/(public)/page.tsx`)

```typescript
export default async function HomePage() {
  // ISR: 10분마다 재생성
  const courses = await db.query.courses.findMany({
    where: eq(courses.published, true),
    limit: 3,
    orderBy: (courses, { desc }) => [desc(courses.createdAt)]
  });

  const posts = await db.query.posts.findMany({
    where: eq(posts.category, 'media'),
    limit: 5
  });

  return (
    <>
      <HeroSection />
      <ServiceHubSection />
      <LatestCoursesSection courses={courses} />
      <MediaActivitySection posts={posts} />
    </>
  );
}

export const revalidate = 600; // 10분
```

### 9.2 Education Page (`src/app/(public)/education/page.tsx`)

```typescript
export default async function EducationPage({
  searchParams
}: {
  searchParams: { type?: 'online' | 'offline' | 'b2b' };
}) {
  const type = searchParams.type;

  const courses = await db.query.courses.findMany({
    where: type ? eq(courses.type, type) : undefined,
    orderBy: (courses, { desc }) => [desc(courses.createdAt)]
  });

  return (
    <>
      <PageHeader title="교육 과정" />
      <CourseFilter /> {/* 클라이언트 컴포넌트 */}
      <CourseGrid courses={courses} />
      <InquiryFormSection />
    </>
  );
}
```

### 9.3 Admin Dashboard (`src/app/admin/dashboard/page.tsx`)

```typescript
export default async function AdminDashboard() {
  const stats = {
    totalCourses: await db.$count(courses),
    totalInquiries: await db.$count(inquiries),
    pendingInquiries: await db.$count(inquiries, eq(inquiries.status, 'pending')),
    totalLeads: await db.$count(leads)
  };

  return (
    <>
      <h1>관리자 대시보드</h1>
      <StatsGrid stats={stats} />
      <RecentInquiries />
    </>
  );
}
```

---

## 10. 파일 업로드 처리

### 10.1 Upload API (`src/app/api/upload/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(process.cwd(), 'public/uploads', filename);

  await writeFile(filepath, buffer);

  return NextResponse.json({
    success: true,
    url: `/uploads/${filename}`
  });
}
```

### 10.2 보안 고려사항
- 파일 크기 제한 (5MB)
- 허용 확장자 검증 (.jpg, .png, .webp)
- 파일명 sanitization

---

## 11. SEO 최적화

### 11.1 Metadata 설정 (`src/app/layout.tsx`)

```typescript
export const metadata: Metadata = {
  title: {
    default: '최범희 대표 - 스마트폰 창업 전략가',
    template: '%s | 최범희'
  },
  description: '5060 베이비부머를 위한 스마트폰 창업 교육, 한국환경저널 발행인',
  keywords: ['스마트폰 창업', '5060 교육', '한국환경저널', '최범희'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://choipd.com',
    siteName: '최범희 대표'
  }
};
```

### 11.2 Sitemap & Robots.txt
- `/app/sitemap.ts` - 동적 사이트맵 생성
- `/app/robots.ts` - robots.txt 설정

---

## 12. 성능 최적화

### 12.1 이미지 최적화
- Next.js `<Image>` 컴포넌트 사용
- WebP 포맷 사용
- Lazy Loading 기본 활성화

### 12.2 코드 스플리팅
- Route-based 자동 스플리팅 (Next.js)
- 관리자 페이지와 공개 페이지 분리

### 12.3 캐싱 전략
- **Static Pages**: SSG (예: /media, /works/book)
- **Dynamic Pages**: ISR with 10분 revalidation (예: Home, Education)
- **Admin Pages**: SSR (인증 필요)

---

## 13. 테스트 전략

### 13.1 단위 테스트
- Vitest 사용
- API 핸들러 테스트
- Utility 함수 테스트

### 13.2 통합 테스트
- Playwright를 사용한 E2E 테스트
- 주요 사용자 플로우 테스트 (문의 제출, 뉴스레터 구독 등)

---

## 14. 배포 및 운영

### 14.1 환경 변수 (`.env.local`)

```env
# Database
DATABASE_URL=file:./data/database.db

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-string>

# Admin Credentials (초기 시딩용)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<secure-password>
```

### 14.2 배포 체크리스트
- [ ] 프로덕션 DB 백업 설정
- [ ] 환경 변수 설정 (Vercel/호스팅 플랫폼)
- [ ] HTTPS 인증서 설정
- [ ] Google Analytics/Search Console 연동
- [ ] 에러 모니터링 (Sentry 등)

### 14.3 DB 백업 스크립트 (`scripts/backup.sh`)

```bash
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cp data/database.db "$BACKUP_DIR/database_$DATE.db"
echo "Backup completed: database_$DATE.db"
```

---

## 15. 향후 확장 고려사항

### Phase 2
- **결제 시스템**: Stripe/TossPayments 통합
- **사용자 인증**: 수강생 전용 커뮤니티 (NextAuth 확장)
- **파일 저장소**: Cloudflare R2/AWS S3 마이그레이션

### Phase 3
- **RSS 연동**: 한국환경저널 자동 피드 임베딩
- **이메일 자동화**: Resend/SendGrid를 통한 뉴스레터 발송
- **Analytics Dashboard**: 실시간 방문자 통계

---

## 16. 참고 자료

- [Next.js App Router 공식 문서](https://nextjs.org/docs)
- [Drizzle ORM 문서](https://orm.drizzle.team/)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com/)
- [Zustand 문서](https://docs.pmnd.rs/zustand)
- [NextAuth.js v5](https://authjs.dev/)

---

문서 작성: 2025년 11월 8일
최종 검토자: (개발 리드)
