# 개발 태스크 목록 (Development Tasks)

문서 버전: v1.0
작성일: 2025년 11월 8일
프로젝트명: 최범희 대표 통합 브랜드 허브
상태: 진행 예정

---

## 태스크 관리 범례

### 상태
- `[ ]` 대기 중
- `[~]` 진행 중
- `[x]` 완료
- `[!]` 블로킹 이슈
- `[-]` 보류/취소

### 우선순위
- 🔴 **P0**: 필수 (차단)
- 🟠 **P1**: 높음
- 🟡 **P2**: 중간
- 🟢 **P3**: 낮음

### 담당자 약어
- **FE**: Frontend Developer
- **BE**: Backend Developer
- **FS**: Fullstack Developer
- **TL**: Tech Lead
- **QA**: QA/Tester

---

## Week 1: 프로젝트 세팅 및 기반 구축

### 🔴 P0: 환경 설정

#### TASK-001: Next.js 프로젝트 초기화
- **담당자**: TL
- **예상 시간**: 2시간
- **의존성**: 없음

```bash
# 실행 명령어
npx create-next-app@latest choi-pd-ecosystem --typescript --tailwind --app --use-npm
cd choi-pd-ecosystem
```

**체크리스트**:
- [ ] Next.js 16+ 프로젝트 생성
- [ ] TypeScript 설정 확인
- [ ] App Router 확인
- [ ] Tailwind CSS 설정 확인
- [ ] 기본 프로젝트 실행 테스트 (`npm run dev`)

**검증 방법**:
```bash
npm run dev
# localhost:3000 접속 확인
```

---

#### TASK-002: 필수 패키지 설치
- **담당자**: TL
- **예상 시간**: 1시간
- **의존성**: TASK-001

```bash
# 프로덕션 의존성
npm install drizzle-orm better-sqlite3
npm install zustand
npm install react-hook-form @hookform/resolvers zod
npm install next-auth@beta bcrypt
npm install lucide-react
npm install @radix-ui/react-navigation-menu
npm install class-variance-authority clsx tailwind-merge

# 개발 의존성
npm install -D @types/better-sqlite3
npm install -D @types/bcrypt
npm install -D drizzle-kit
npm install -D eslint-config-prettier
```

**체크리스트**:
- [ ] 모든 패키지 설치 완료
- [ ] package.json 확인
- [ ] 버전 충돌 없음
- [ ] `npm run build` 성공

---

#### TASK-003: shadcn/ui 초기화
- **담당자**: FE
- **예상 시간**: 1시간
- **의존성**: TASK-001, TASK-002

```bash
npx shadcn-ui@latest init
```

**설정 옵션**:
- Style: Default
- Base color: Slate
- CSS variables: Yes

**체크리스트**:
- [ ] shadcn/ui 초기화 완료
- [ ] `components/ui` 폴더 생성 확인
- [ ] `lib/utils.ts` 파일 확인
- [ ] Tailwind 설정 업데이트 확인

---

#### TASK-004: 프로젝트 디렉토리 구조 생성
- **담당자**: TL
- **예상 시간**: 30분
- **의존성**: TASK-001

```bash
mkdir -p src/app/{admin,api}
mkdir -p src/components/{ui,layout,home,education,media,works,community,admin,forms}
mkdir -p src/lib/{db,stores}
mkdir -p src/types
mkdir -p src/hooks
mkdir -p public/{images,uploads}
mkdir -p data
mkdir -p scripts
```

**체크리스트**:
- [ ] 모든 폴더 생성 완료
- [ ] LLD 구조와 일치 확인
- [ ] `.gitignore`에 `data/*.db` 추가
- [ ] `public/uploads/` 폴더에 `.gitkeep` 추가

---

#### TASK-005: 환경 변수 설정
- **담당자**: TL
- **예상 시간**: 30분
- **의존성**: TASK-001

`.env.local` 파일 생성:
```env
# Database
DATABASE_URL=file:./data/database.db

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here-min-32-chars

# Admin Credentials (for seeding)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecurePassword123!
```

**체크리스트**:
- [ ] `.env.local` 파일 생성
- [ ] `.env.example` 파일 생성 (값 제외)
- [ ] `.gitignore`에 `.env.local` 포함 확인
- [ ] NEXTAUTH_SECRET 생성 (`openssl rand -base64 32`)

---

### 🔴 P0: 데이터베이스 설정

#### TASK-006: Drizzle ORM 설정
- **담당자**: BE
- **예상 시간**: 2시간
- **의존성**: TASK-002

**파일 1**: `drizzle.config.ts`
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:./data/database.db',
  },
} satisfies Config;
```

**체크리스트**:
- [ ] `drizzle.config.ts` 작성
- [ ] 설정 파일 유효성 검증
- [ ] `package.json`에 스크립트 추가:
  ```json
  "scripts": {
    "db:push": "drizzle-kit push:sqlite",
    "db:studio": "drizzle-kit studio"
  }
  ```

---

#### TASK-007: 데이터베이스 스키마 작성
- **담당자**: BE
- **예상 시간**: 3시간
- **의존성**: TASK-006

**파일**: `src/lib/db/schema.ts`

LLD 섹션 4.2의 스키마 구현

**체크리스트**:
- [ ] `users` 테이블 정의
- [ ] `courses` 테이블 정의
- [ ] `posts` 테이블 정의
- [ ] `works` 테이블 정의
- [ ] `inquiries` 테이블 정의
- [ ] `leads` 테이블 정의
- [ ] TypeScript 타입 export
- [ ] Enum 타입 정의 확인

**검증 방법**:
```bash
npm run db:push
# 에러 없이 완료되는지 확인
```

---

#### TASK-008: 데이터베이스 연결 설정
- **담당자**: BE
- **예상 시간**: 1시간
- **의존성**: TASK-007

**파일**: `src/lib/db/index.ts`

```typescript
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const sqlite = new Database(process.env.DATABASE_URL || 'data/database.db');
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
```

**체크리스트**:
- [ ] DB 연결 코드 작성
- [ ] WAL 모드 활성화
- [ ] 스키마 import 확인
- [ ] 연결 테스트 스크립트 작성

---

#### TASK-009: 시드 데이터 작성
- **담당자**: BE
- **예상 시간**: 2시간
- **의존성**: TASK-008

**파일**: `scripts/seed.ts`

```typescript
import { db } from '../src/lib/db';
import { users, courses, posts, works } from '../src/lib/db/schema';
import bcrypt from 'bcrypt';

async function seed() {
  // 관리자 계정 생성
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);

  await db.insert(users).values({
    username: process.env.ADMIN_USERNAME || 'admin',
    passwordHash,
  });

  // 샘플 교육 과정 3개
  await db.insert(courses).values([
    {
      title: '스마트폰 창업 기초 과정',
      description: '5060을 위한 스마트폰 활용 창업 교육',
      type: 'online',
      price: 100000,
      thumbnailUrl: '/images/course-1.jpg',
      published: true,
    },
    // ... 2개 더
  ]);

  // 샘플 공지사항 5개
  // 샘플 갤러리 이미지 3개

  console.log('Seed completed!');
}

seed().catch(console.error);
```

**체크리스트**:
- [ ] 관리자 계정 시딩
- [ ] 교육 과정 3개 샘플 데이터
- [ ] 공지사항 5개 샘플 데이터
- [ ] 갤러리 3개 샘플 데이터
- [ ] `package.json`에 스크립트 추가:
  ```json
  "scripts": {
    "db:seed": "tsx scripts/seed.ts"
  }
  ```

**실행 방법**:
```bash
npm install -D tsx
npm run db:seed
```

---

### 🔴 P0: 인증 시스템

#### TASK-010: NextAuth.js 설정
- **담당자**: BE
- **예상 시간**: 3시간
- **의존성**: TASK-008

**파일 1**: `src/lib/auth.ts`

LLD 섹션 6.1의 코드 구현

**파일 2**: `src/app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
```

**체크리스트**:
- [ ] `auth.ts` 작성
- [ ] Credentials Provider 구현
- [ ] bcrypt 비밀번호 검증
- [ ] 콜백 함수 구현
- [ ] API Route 설정

---

#### TASK-011: 관리자 로그인 페이지
- **담당자**: FE
- **예상 시간**: 3시간
- **의존성**: TASK-010, TASK-003

**파일**: `src/app/admin/login/page.tsx`

```typescript
'use client';

import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

const loginSchema = z.object({
  username: z.string().min(1, '아이디를 입력하세요'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
});

export default function LoginPage() {
  // 구현...
}
```

**체크리스트**:
- [ ] shadcn/ui 컴포넌트 설치:
  ```bash
  npx shadcn-ui@latest add button input form
  ```
- [ ] 로그인 폼 UI 구현
- [ ] React Hook Form + Zod 적용
- [ ] 로그인 요청 처리
- [ ] 에러 메시지 표시
- [ ] 성공 시 `/admin/dashboard` 리다이렉트

---

#### TASK-012: 관리자 레이아웃 보호
- **담당자**: BE
- **예상 시간**: 2시간
- **의존성**: TASK-010

**파일**: `src/app/admin/layout.tsx`

LLD 섹션 6.2의 코드 구현

**체크리스트**:
- [ ] `auth()` 함수로 세션 체크
- [ ] 미인증 시 로그인 페이지 리다이렉트
- [ ] 관리자 네비게이션 추가
- [ ] 로그아웃 버튼 구현

---

## Week 2: 공통 컴포넌트 & Home 페이지

### 🟠 P1: Layout 컴포넌트

#### TASK-013: shadcn/ui 컴포넌트 설치
- **담당자**: FE
- **예상 시간**: 1시간
- **의존성**: TASK-003

```bash
npx shadcn-ui@latest add button card navigation-menu dialog
npx shadcn-ui@latest add dropdown-menu sheet table
npx shadcn-ui@latest add form input textarea label
npx shadcn-ui@latest add select checkbox radio-group
npx shadcn-ui@latest add toast
```

**체크리스트**:
- [ ] 모든 컴포넌트 설치
- [ ] `components/ui/` 폴더 확인
- [ ] 각 컴포넌트 import 테스트

---

#### TASK-014: Header 컴포넌트
- **담당자**: FE
- **예상 시간**: 4시간
- **의존성**: TASK-013

**파일**: `src/components/layout/Header.tsx`

```typescript
'use client';

import Link from 'next/link';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useUIStore } from '@/lib/stores/uiStore';

export function Header() {
  const { toggleMobileMenu } = useUIStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          최범희
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/education">교육</Link>
            </NavigationMenuItem>
            {/* ... */}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMobileMenu}
        >
          <Menu />
        </Button>
      </div>
    </header>
  );
}
```

**체크리스트**:
- [ ] 로고 영역
- [ ] 데스크톱 네비게이션 메뉴
- [ ] 모바일 햄버거 버튼
- [ ] Sticky 헤더 스타일
- [ ] 반응형 디자인

---

#### TASK-015: MobileMenu 컴포넌트
- **담당자**: FE
- **예상 시간**: 3시간
- **의존성**: TASK-014

**파일**: `src/components/layout/MobileMenu.tsx`

```typescript
'use client';

import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useUIStore } from '@/lib/stores/uiStore';
import Link from 'next/link';

export function MobileMenu() {
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={toggleMobileMenu}>
      <SheetContent side="left">
        <nav className="flex flex-col gap-4">
          <Link href="/education" onClick={toggleMobileMenu}>
            교육
          </Link>
          {/* ... */}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
```

**체크리스트**:
- [ ] Sheet 컴포넌트 활용
- [ ] Zustand 상태 연동
- [ ] 메뉴 항목 리스트
- [ ] 클릭 시 메뉴 닫기
- [ ] 애니메이션 확인

---

#### TASK-016: Footer 컴포넌트
- **담당자**: FE
- **예상 시간**: 2시간
- **의존성**: TASK-013

**파일**: `src/components/layout/Footer.tsx`

```typescript
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">연락처</h3>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              <span>contact@choipd.com</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-2">
              <Phone className="h-4 w-4" />
              <span>010-XXXX-XXXX</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">바로가기</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/education">교육 과정</Link></li>
              {/* ... */}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">소셜 미디어</h3>
            {/* 소셜 링크 */}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} 최범희. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

**체크리스트**:
- [ ] 3단 그리드 레이아웃
- [ ] 연락처 정보
- [ ] 바로가기 링크
- [ ] 소셜 미디어 아이콘
- [ ] 저작권 정보

---

#### TASK-017: Zustand UI Store 구현
- **담당자**: FE
- **예상 시간**: 1시간
- **의존성**: TASK-002

**파일**: `src/lib/stores/uiStore.ts`

LLD 섹션 7.1의 코드 구현

**체크리스트**:
- [ ] `isMobileMenuOpen` 상태
- [ ] `isModalOpen` 상태
- [ ] 토글/열기/닫기 액션
- [ ] TypeScript 타입 정의

---

#### TASK-018: Zustand Form Store 구현
- **담당자**: FE
- **예상 시간**: 1시간
- **의존성**: TASK-002

**파일**: `src/lib/stores/formStore.ts`

LLD 섹션 7.2의 코드 구현

**체크리스트**:
- [ ] `isLoading` 상태
- [ ] `error` 상태
- [ ] setter 함수들
- [ ] `reset` 함수

---

#### TASK-019: Root Layout 업데이트
- **담당자**: FE
- **예상 시간**: 2시간
- **의존성**: TASK-014, TASK-016

**파일**: `src/app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { Toaster } from '@/components/ui/toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: '최범희 대표 - 스마트폰 창업 전략가',
    template: '%s | 최범희',
  },
  description: '5060 베이비부머를 위한 스마트폰 창업 교육, 한국환경저널 발행인',
  keywords: ['스마트폰 창업', '5060 교육', '한국환경저널', '최범희'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Header />
        <MobileMenu />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
```

**체크리스트**:
- [ ] Metadata 설정
- [ ] 폰트 설정 (Inter)
- [ ] Header/Footer 추가
- [ ] Toaster 추가
- [ ] 한글 lang 속성

---

### 🟠 P1: Home 페이지

#### TASK-020: HeroSection 컴포넌트
- **담당자**: FE
- **예상 시간**: 3시간
- **의존성**: TASK-013

**파일**: `src/components/home/HeroSection.tsx`

```typescript
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-b from-primary/10 to-background">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            스마트폰으로 시작하는
            <br />
            당신의 새로운 도전
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            교육자, 저자, 미디어 발행인 최범희와 함께
            <br />
            5060 세대의 스마트폰 창업을 응원합니다
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/education">교육 과정 보기</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/works/book">저서 소개</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**체크리스트**:
- [ ] 헤드라인 텍스트
- [ ] 부제목
- [ ] CTA 버튼 2개
- [ ] 그라디언트 배경
- [ ] 반응형 타이포그래피

---

#### TASK-021: ServiceHubSection 컴포넌트
- **담당자**: FE
- **예상 시간**: 3시간
- **의존성**: TASK-013

**파일**: `src/components/home/ServiceHubSection.tsx`

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { GraduationCap, Newspaper, BookOpen } from 'lucide-react';
import Link from 'next/link';

export function ServiceHubSection() {
  const services = [
    {
      icon: GraduationCap,
      title: 'EDUCATION',
      description: '스마트폰 창업 교육 과정',
      href: '/education',
    },
    {
      icon: Newspaper,
      title: 'MEDIA',
      description: '한국환경저널 발행인',
      href: '/media',
    },
    {
      icon: BookOpen,
      title: 'WORKS',
      description: '저서 및 작품 활동',
      href: '/works',
    },
  ];

  return (
    <section className="py-20">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link key={service.title} href={service.href}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <service.icon className="h-12 w-12 mb-4" />
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**체크리스트**:
- [ ] 3개 서비스 카드
- [ ] 아이콘 (lucide-react)
- [ ] 제목 및 설명
- [ ] 링크 연결
- [ ] Hover 효과

---

#### TASK-022: LatestCoursesSection 컴포넌트
- **담당자**: FS
- **예상 시간**: 4시간
- **의존성**: TASK-008, TASK-013

**파일**: `src/components/home/LatestCoursesSection.tsx`

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import type { Course } from '@/lib/db/schema';

interface LatestCoursesSectionProps {
  courses: Course[];
}

export function LatestCoursesSection({ courses }: LatestCoursesSectionProps) {
  return (
    <section className="py-20 bg-muted/40">
      <div className="container">
        <h2 className="text-3xl font-bold mb-8">최신 교육 과정</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id}>
              {course.thumbnailUrl && (
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  width={400}
                  height={250}
                  className="rounded-t-lg object-cover"
                />
              )}
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/education#course-${course.id}`}>자세히 보기</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**체크리스트**:
- [ ] 과정 카드 3개
- [ ] 썸네일 이미지
- [ ] Next.js Image 최적화
- [ ] 제목/설명 표시
- [ ] 링크 버튼

---

#### TASK-023: Home 페이지 통합
- **담당자**: FS
- **예상 시간**: 2시간
- **의존성**: TASK-020, TASK-021, TASK-022

**파일**: `src/app/page.tsx`

LLD 섹션 9.1의 코드 구현

**체크리스트**:
- [ ] 모든 섹션 통합
- [ ] DB에서 최신 과정 3개 조회
- [ ] DB에서 미디어 활동 5개 조회
- [ ] ISR 설정 (revalidate: 600)
- [ ] TypeScript 타입 체크

**검증 방법**:
```bash
npm run build
npm start
# localhost:3000 접속하여 확인
```

---

## Week 3: Education & Media 페이지

### 🟠 P1: Courses API

#### TASK-024: GET /api/courses 엔드포인트
- **담당자**: BE
- **예상 시간**: 3시간
- **의존성**: TASK-008

**파일**: `src/app/api/courses/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { courses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'online' | 'offline' | 'b2b' | null;

    const result = await db.query.courses.findMany({
      where: type ? eq(courses.type, type) : eq(courses.published, true),
      orderBy: (courses, { desc }) => [desc(courses.createdAt)],
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
```

**체크리스트**:
- [ ] GET 메서드 구현
- [ ] 타입 필터링 (쿼리 파라미터)
- [ ] published=true 필터
- [ ] 날짜순 정렬
- [ ] 에러 핸들링
- [ ] 표준 응답 형식

---

#### TASK-025: CourseCard 컴포넌트
- **담당자**: FE
- **예상 시간**: 3시간
- **의존성**: TASK-013

**파일**: `src/components/education/CourseCard.tsx`

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import type { Course } from '@/lib/db/schema';

interface CourseCardProps {
  course: Course;
  variant?: 'default' | 'featured';
}

export function CourseCard({ course, variant = 'default' }: CourseCardProps) {
  const typeLabels = {
    online: '온라인',
    offline: '오프라인',
    b2b: '기업/기관',
  };

  return (
    <Card className={variant === 'featured' ? 'border-primary' : ''}>
      {course.thumbnailUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover rounded-t-lg"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">{typeLabels[course.type]}</Badge>
          {course.price && (
            <span className="font-semibold">
              {course.price.toLocaleString()}원
            </span>
          )}
        </div>
        <CardTitle>{course.title}</CardTitle>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>
      <CardFooter>
        {course.externalLink ? (
          <Button asChild className="w-full">
            <Link href={course.externalLink} target="_blank">
              수강 신청
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline" className="w-full">
            <Link href="/education#inquiry">문의하기</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
```

**체크리스트**:
- [ ] Badge 컴포넌트 설치:
  ```bash
  npx shadcn-ui@latest add badge
  ```
- [ ] 카드 레이아웃
- [ ] 썸네일 이미지
- [ ] 타입 배지
- [ ] 가격 표시
- [ ] CTA 버튼
- [ ] variant 지원

---

#### TASK-026: Education 페이지 구현
- **담당자**: FS
- **예상 시간**: 4시간
- **의존성**: TASK-024, TASK-025

**파일**: `src/app/education/page.tsx`

LLD 섹션 9.2의 코드 구현

**파일**: `src/components/education/CourseFilter.tsx` (클라이언트 컴포넌트)

```typescript
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function CourseFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = searchParams.get('type');

  const filters = [
    { label: '전체', value: null },
    { label: '온라인', value: 'online' },
    { label: '오프라인', value: 'offline' },
    { label: '기업/기관', value: 'b2b' },
  ];

  const handleFilter = (value: string | null) => {
    if (value) {
      router.push(`/education?type=${value}`);
    } else {
      router.push('/education');
    }
  };

  return (
    <div className="flex gap-2 mb-8">
      {filters.map((filter) => (
        <Button
          key={filter.label}
          variant={currentType === filter.value ? 'default' : 'outline'}
          onClick={() => handleFilter(filter.value)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
```

**체크리스트**:
- [ ] 페이지 헤더
- [ ] 과정 필터 컴포넌트
- [ ] 과정 그리드 레이아웃
- [ ] DB에서 과정 목록 조회
- [ ] 타입 필터링 적용
- [ ] 빈 상태 처리

---

#### TASK-027: InquiryForm 컴포넌트
- **담당자**: FS
- **예상 시간**: 4시간
- **의존성**: TASK-013

**파일**: `src/components/forms/InquiryForm.tsx`

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { useFormStore } from '@/lib/stores/formStore';

const inquirySchema = z.object({
  name: z.string().min(2, '이름을 입력해주세요'),
  email: z.string().email('유효한 이메일을 입력해주세요'),
  phone: z.string().optional(),
  message: z.string().min(10, '최소 10자 이상 입력해주세요'),
  type: z.enum(['b2b', 'contact']),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

interface InquiryFormProps {
  type?: 'b2b' | 'contact';
}

export function InquiryForm({ type = 'contact' }: InquiryFormProps) {
  const { toast } = useToast();
  const { isLoading, setLoading, setError, reset } = useFormStore();

  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      type,
    },
  });

  const onSubmit = async (data: InquiryFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: '문의가 접수되었습니다',
        description: '빠른 시일 내에 연락드리겠습니다.',
      });

      form.reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : '문의 접수 실패');
      toast({
        title: '오류',
        description: '문의 접수에 실패했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input placeholder="홍길동" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input type="email" placeholder="example@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>연락처 (선택)</FormLabel>
              <FormControl>
                <Input placeholder="010-1234-5678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>문의 내용</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="문의하실 내용을 입력해주세요"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? '전송 중...' : '문의하기'}
        </Button>
      </form>
    </Form>
  );
}
```

**체크리스트**:
- [ ] React Hook Form 설정
- [ ] Zod 스키마 정의
- [ ] 모든 필드 구현
- [ ] 유효성 검사
- [ ] API 요청 처리
- [ ] 로딩 상태
- [ ] Toast 알림
- [ ] 폼 리셋

---

#### TASK-028: POST /api/inquiries 엔드포인트
- **담당자**: BE
- **예상 시간**: 2시간
- **의존성**: TASK-008

**파일**: `src/app/api/inquiries/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inquiries } from '@/lib/db/schema';
import { z } from 'zod';

const inquirySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
  type: z.enum(['b2b', 'contact']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = inquirySchema.parse(body);

    const result = await db.insert(inquiries).values({
      ...validatedData,
      status: 'pending',
    }).returning();

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}
```

**체크리스트**:
- [ ] POST 메서드 구현
- [ ] Zod 유효성 검사
- [ ] DB INSERT
- [ ] 에러 핸들링
- [ ] Validation 에러 상세 반환

---

### 🟡 P2: Media 페이지

#### TASK-029: Media 메인 페이지
- **담당자**: FE
- **예상 시간**: 3시간
- **의존성**: TASK-013

**파일**: `src/app/media/page.tsx`

```typescript
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MediaPage() {
  return (
    <div className="container py-12">
      {/* Hero Section */}
      <section className="mb-16">
        <h1 className="text-4xl font-bold mb-4">한국환경저널</h1>
        <p className="text-xl text-muted-foreground mb-6">
          대한민국 최고의 환경 파수꾼
        </p>
        <p className="max-w-2xl">
          한국환경저널은 환경 문제에 대한 심층 보도와 전문가 네트워크를 통해
          더 나은 미래를 만들어가는 언론 매체입니다.
        </p>
      </section>

      {/* 창간 배경 */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">창간 배경</h2>
        <div className="prose max-w-none">
          {/* 콘텐츠 */}
        </div>
      </section>

      {/* 전문가 네트워크 */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">100인의 전문가</h2>
        <p className="mb-4">
          환경, 과학, 정책 등 다양한 분야의 전문가들이 함께합니다.
        </p>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Button asChild size="lg">
          <Link href="/media/greeting">발행인 인사말</Link>
        </Button>
      </section>
    </div>
  );
}
```

**체크리스트**:
- [ ] Hero 섹션
- [ ] 창간 배경 섹션
- [ ] 전문가 네트워크 섹션
- [ ] CTA 버튼
- [ ] 반응형 레이아웃

---

#### TASK-030: 발행인 인사말 페이지
- **담당자**: FE
- **예상 시간**: 2시간
- **의존성**: TASK-029

**파일**: `src/app/media/greeting/page.tsx`

**체크리스트**:
- [ ] 페이지 레이아웃
- [ ] 발행인 사진
- [ ] 인사말 텍스트
- [ ] 철학 및 비전

---

## [계속...]

---

## 주간 요약 (Weekly Summary)

### Week 1 Tasks
- **Total**: 12 tasks
- **Priority**: 🔴 P0 x 12
- **Focus**: 프로젝트 세팅, DB, 인증

### Week 2 Tasks
- **Total**: 11 tasks
- **Priority**: 🟠 P1 x 11
- **Focus**: 공통 컴포넌트, Home 페이지

### Week 3 Tasks
- **Total**: 7 tasks (일부만 표시)
- **Priority**: 🟠 P1 x 5, 🟡 P2 x 2
- **Focus**: Education, Media 페이지

---

## 다음 단계

이 문서는 Week 3까지 일부 태스크를 포함하고 있습니다.
전체 8주 계획을 완성하려면:

1. **Week 4**: Works 페이지 (TASK-031 ~ TASK-038)
2. **Week 5**: Community 페이지 (TASK-039 ~ TASK-045)
3. **Week 6**: Admin 대시보드 & 과정 관리 (TASK-046 ~ TASK-053)
4. **Week 7**: Admin 콘텐츠 & 리드 관리 (TASK-054 ~ TASK-062)
5. **Week 8**: 테스트 & 배포 (TASK-063 ~ TASK-075)

각 태스크에 대한 추가 세부 사항이 필요하면 말씀해주세요!

---

**문서 관리**
- 마지막 업데이트: 2025년 11월 8일
- 담당자: 개발 리드
- 버전: v1.0
