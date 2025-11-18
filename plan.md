# 프로젝트 실행 계획 (Project Plan)

문서 버전: v1.0
작성일: 2025년 11월 8일
프로젝트명: 최범희 대표 통합 브랜드 허브
상태: 진행 예정

---

## 1. 프로젝트 개요

### 1.1 목적
최범희 대표의 다층적 정체성(교육자, 저자, 미디어 발행인)을 통합적으로 브랜딩하고, 비즈니스 효율화 및 사회적 영향력 확대를 위한 웹사이트를 구축합니다.

### 1.2 기간
- **전체 기간**: 8주 (2개월)
- **Phase 1**: 프로젝트 세팅 및 기반 구축 (1주)
- **Phase 2**: 핵심 기능 개발 (4주)
- **Phase 3**: 관리자 기능 개발 (2주)
- **Phase 4**: 테스트 및 배포 (1주)

### 1.3 주요 마일스톤
| 마일스톤 | 목표일 | 상태 |
|---------|--------|------|
| 프로젝트 초기화 및 환경 설정 | Week 1 | 예정 |
| 공개 페이지 완료 | Week 5 | 예정 |
| 관리자 시스템 완료 | Week 7 | 예정 |
| 프로덕션 배포 | Week 8 | 예정 |

---

## 2. Phase 1: 프로젝트 세팅 및 기반 구축 (Week 1)

### 2.1 개발 환경 설정
**담당자**: 개발 리드
**기간**: Day 1-2

#### Task 1.1: Next.js 프로젝트 초기화
- [ ] Next.js 16+ 프로젝트 생성 (TypeScript, App Router)
- [ ] 필요한 패키지 설치
  ```bash
  npm install next@latest react react-dom
  npm install -D typescript @types/react @types/node
  npm install tailwindcss postcss autoprefixer
  npm install drizzle-orm better-sqlite3
  npm install zustand react-hook-form zod
  npm install next-auth bcrypt
  npm install lucide-react
  ```
- [ ] Tailwind CSS 설정
- [ ] shadcn/ui 초기화
  ```bash
  npx shadcn-ui@latest init
  ```

#### Task 1.2: 프로젝트 구조 생성
- [ ] LLD에 정의된 디렉토리 구조 생성
- [ ] 기본 layout.tsx 및 globals.css 설정
- [ ] 환경 변수 파일(.env.local) 생성

**산출물**:
- 실행 가능한 Next.js 프로젝트
- 기본 프로젝트 구조

---

### 2.2 데이터베이스 설정
**담당자**: 백엔드 개발자
**기간**: Day 3-4

#### Task 2.1: Drizzle ORM 설정
- [ ] `drizzle.config.ts` 작성
- [ ] `src/lib/db/schema.ts` 작성 (LLD 기반)
- [ ] `src/lib/db/index.ts` 작성
- [ ] Migration 스크립트 작성

#### Task 2.2: 데이터베이스 초기화
- [ ] SQLite 데이터베이스 파일 생성 (`data/database.db`)
- [ ] Migration 실행
  ```bash
  npx drizzle-kit push:sqlite
  ```
- [ ] Seed 데이터 작성 (`scripts/seed.ts`)
  - 관리자 계정 생성
  - 샘플 교육 과정 3개
  - 샘플 공지사항 5개
- [ ] Seed 실행

**산출물**:
- 초기화된 SQLite 데이터베이스
- 테스트용 샘플 데이터

---

### 2.3 인증 시스템 구축
**담당자**: 백엔드 개발자
**기간**: Day 5-7

#### Task 3.1: NextAuth.js 설정
- [ ] `src/lib/auth.ts` 작성
- [ ] `/api/auth/[...nextauth]/route.ts` 작성
- [ ] Credentials Provider 구현
- [ ] bcrypt 비밀번호 해싱 적용

#### Task 3.2: 로그인 페이지 구현
- [ ] `/admin/login` 페이지 생성
- [ ] shadcn/ui Form 컴포넌트 활용한 로그인 폼
- [ ] 로그인 성공 시 `/admin/dashboard`로 리다이렉트

#### Task 3.3: 관리자 레이아웃 보호
- [ ] `/admin/layout.tsx`에 인증 체크 로직 추가
- [ ] 미인증 시 로그인 페이지로 리다이렉트

**산출물**:
- 작동하는 관리자 로그인 시스템
- 보호된 관리자 영역

---

## 3. Phase 2: 핵심 기능 개발 (Week 2-5)

### 3.1 공통 컴포넌트 개발
**담당자**: 프론트엔드 개발자
**기간**: Week 2

#### Task 4.1: Layout 컴포넌트
- [ ] Header 컴포넌트 (`src/components/layout/Header.tsx`)
  - 로고
  - 네비게이션 메뉴 (Desktop)
  - 햄버거 메뉴 (Mobile)
- [ ] Footer 컴포넌트 (`src/components/layout/Footer.tsx`)
  - 연락처 정보
  - 소셜 미디어 링크
  - 저작권 정보
- [ ] MobileMenu 컴포넌트 (Zustand 연동)

#### Task 4.2: UI 컴포넌트 설치
- [ ] shadcn/ui 주요 컴포넌트 설치
  ```bash
  npx shadcn-ui@latest add button card form input textarea
  npx shadcn-ui@latest add navigation-menu dialog table
  ```

#### Task 4.3: Zustand 스토어 구현
- [ ] `src/lib/stores/uiStore.ts` 작성
- [ ] `src/lib/stores/formStore.ts` 작성

**산출물**:
- 재사용 가능한 Layout 컴포넌트
- 설치된 UI 컴포넌트 라이브러리
- 상태 관리 스토어

---

### 3.2 Home 페이지 개발
**담당자**: 프론트엔드 개발자
**기간**: Week 2

#### Task 5.1: Hero Section
- [ ] Hero 컴포넌트 (`src/components/home/HeroSection.tsx`)
- [ ] 최범희 대표 소개 텍스트
- [ ] 배경 이미지 또는 그라디언트
- [ ] CTA 버튼 (교육 과정 보기)

#### Task 5.2: Service Hub Section
- [ ] 3개 서비스 카드 (EDUCATION, MEDIA, WORKS)
- [ ] shadcn/ui Card 컴포넌트 활용
- [ ] 각 서비스로 연결되는 링크

#### Task 5.3: Dynamic Feed Section
- [ ] 최신 교육 과정 3개 표시
- [ ] 한국환경저널 최근 활동 5개 표시
- [ ] ISR 적용 (revalidate: 600)

**산출물**:
- 완성된 Home 페이지 (`/`)

---

### 3.3 Education 페이지 개발
**담당자**: 풀스택 개발자
**기간**: Week 3

#### Task 6.1: Courses API 구현
- [ ] GET `/api/courses` 엔드포인트
- [ ] 타입별 필터링 (online, offline, b2b)
- [ ] 페이지네이션 (선택 사항)

#### Task 6.2: Education 페이지 UI
- [ ] 페이지 헤더
- [ ] 과정 필터 컴포넌트 (클라이언트)
- [ ] CourseCard 컴포넌트
- [ ] CourseGrid 레이아웃

#### Task 6.3: 문의 폼 구현
- [ ] InquiryForm 컴포넌트
- [ ] React Hook Form + Zod 유효성 검사
- [ ] POST `/api/inquiries` 엔드포인트
- [ ] 제출 성공/실패 피드백

**산출물**:
- 완성된 Education 페이지 (`/education`)
- Courses API
- Inquiries API (POST)

---

### 3.4 Media 페이지 개발
**담당자**: 프론트엔드 개발자
**기간**: Week 3

#### Task 7.1: 정적 페이지 구현
- [ ] 한국환경저널 소개 페이지 (`/media`)
- [ ] 발행인 인사말 페이지 (`/media/greeting`)
- [ ] 정적 콘텐츠 작성

#### Task 7.2: 주요 활동 섹션
- [ ] Posts API (category: 'media') 연동
- [ ] 활동 목록 표시
- [ ] 외부 링크 연결

**산출물**:
- 완성된 Media 페이지 (`/media`)

---

### 3.5 Works 페이지 개발
**담당자**: 프론트엔드 개발자
**기간**: Week 4

#### Task 8.1: 저서 페이지
- [ ] 책 소개 페이지 (`/works/book`)
- [ ] 책 표지 이미지
- [ ] 서평 및 목차
- [ ] 외부 구매 링크 (교보문고, Yes24 등)

#### Task 8.2: 갤러리 페이지
- [ ] Works API (category: 'gallery') 구현
- [ ] 갤러리 그리드 레이아웃
- [ ] 이미지 모달/라이트박스
- [ ] Next.js Image 컴포넌트 최적화

#### Task 8.3: 언론 보도 페이지
- [ ] Works API (category: 'press') 구현
- [ ] 보도 자료 목록
- [ ] 날짜순 정렬

**산출물**:
- 완성된 Works 페이지 (`/works`)
- Works API

---

### 3.6 Community 페이지 개발
**담당자**: 풀스택 개발자
**기간**: Week 5

#### Task 9.1: Posts API 구현
- [ ] GET `/api/posts` 엔드포인트
- [ ] 카테고리별 필터링 (notice, review)
- [ ] 페이지네이션

#### Task 9.2: 공지사항 페이지
- [ ] 공지사항 목록 (`/community`)
- [ ] 개별 공지사항 상세 페이지 (`/community/[id]`)

#### Task 9.3: 수강생 후기 페이지
- [ ] 후기 목록 (`/community/reviews`)
- [ ] 카드 레이아웃

#### Task 9.4: 뉴스레터 구독 폼
- [ ] NewsletterForm 컴포넌트
- [ ] POST `/api/leads` 엔드포인트
- [ ] 이메일 중복 체크
- [ ] 구독 성공 메시지

**산출물**:
- 완성된 Community 페이지 (`/community`)
- Posts API
- Leads API (POST)

---

## 4. Phase 3: 관리자 기능 개발 (Week 6-7)

### 4.1 관리자 대시보드
**담당자**: 풀스택 개발자
**기간**: Week 6 (Day 1-2)

#### Task 10.1: 대시보드 페이지
- [ ] 통계 카드 (총 과정, 문의, 구독자 수)
- [ ] 최근 문의 목록 미리보기
- [ ] 그래프/차트 (선택 사항)

**산출물**:
- 관리자 대시보드 (`/admin/dashboard`)

---

### 4.2 교육 과정 관리
**담당자**: 풀스택 개발자
**기간**: Week 6 (Day 3-5)

#### Task 11.1: Courses CRUD API
- [ ] POST `/api/courses` - 과정 생성
- [ ] PATCH `/api/courses/[id]` - 과정 수정
- [ ] DELETE `/api/courses/[id]` - 과정 삭제
- [ ] 관리자 인증 미들웨어 적용

#### Task 11.2: 과정 관리 UI
- [ ] 과정 목록 페이지 (`/admin/courses`)
- [ ] DataTable 컴포넌트 (shadcn/ui Table)
- [ ] 과정 생성/수정 폼
- [ ] 이미지 업로드 기능

**산출물**:
- Courses CRUD API
- 과정 관리 페이지

---

### 4.3 콘텐츠 관리 (Posts & Works)
**담당자**: 풀스택 개발자
**기간**: Week 6 (Day 6-7) + Week 7 (Day 1-2)

#### Task 12.1: Posts CRUD API
- [ ] POST, PATCH, DELETE `/api/posts`
- [ ] 카테고리별 관리

#### Task 12.2: Posts 관리 UI
- [ ] 공지사항 관리 페이지 (`/admin/posts`)
- [ ] 에디터 (Textarea 또는 Markdown 에디터)
- [ ] 발행/비공개 토글

#### Task 12.3: Works CRUD API
- [ ] POST, PATCH, DELETE `/api/works`

#### Task 12.4: Works 관리 UI
- [ ] 갤러리/언론보도 관리 페이지 (`/admin/works`)
- [ ] 이미지 업로드
- [ ] 카테고리 선택

**산출물**:
- Posts CRUD API 및 관리 페이지
- Works CRUD API 및 관리 페이지

---

### 4.4 리드 관리
**담당자**: 풀스택 개발자
**기간**: Week 7 (Day 3-5)

#### Task 13.1: 문의 관리
- [ ] GET `/api/inquiries` (관리자용)
- [ ] PATCH `/api/inquiries/[id]` - 상태 변경
- [ ] 문의 목록 페이지 (`/admin/inquiries`)
- [ ] 상태별 필터링 (pending, contacted, closed)
- [ ] CSV 내보내기 버튼

#### Task 13.2: 구독자 관리
- [ ] GET `/api/leads` (관리자용)
- [ ] 구독자 목록 페이지 (`/admin/leads`)
- [ ] CSV 내보내기 기능

**산출물**:
- 문의 관리 페이지
- 구독자 관리 페이지
- CSV 내보내기 기능

---

### 4.5 파일 업로드 시스템
**담당자**: 백엔드 개발자
**기간**: Week 7 (Day 6-7)

#### Task 14.1: Upload API
- [ ] POST `/api/upload` 엔드포인트
- [ ] 파일 크기 제한 (5MB)
- [ ] 허용 확장자 검증
- [ ] 파일명 sanitization
- [ ] `public/uploads/` 폴더에 저장

#### Task 14.2: 업로드 컴포넌트
- [ ] FileUpload 컴포넌트
- [ ] 드래그 앤 드롭 지원 (선택 사항)
- [ ] 업로드 진행률 표시

**산출물**:
- 파일 업로드 API
- 재사용 가능한 업로드 컴포넌트

---

## 5. Phase 4: 테스트 및 배포 (Week 8)

### 5.1 테스트
**담당자**: QA/개발팀
**기간**: Week 8 (Day 1-3)

#### Task 15.1: 기능 테스트
- [ ] 모든 공개 페이지 테스트
- [ ] 모든 폼 제출 테스트
- [ ] 관리자 CRUD 기능 테스트
- [ ] 인증/인가 테스트

#### Task 15.2: 반응형 테스트
- [ ] 모바일 (375px, 768px)
- [ ] 태블릿 (1024px)
- [ ] 데스크톱 (1920px)

#### Task 15.3: 브라우저 호환성 테스트
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge

#### Task 15.4: 성능 테스트
- [ ] Lighthouse 점수 측정 (목표: 90+)
- [ ] LCP, FID, CLS 측정
- [ ] 이미지 최적화 확인

**산출물**:
- 테스트 보고서
- 버그 수정 리스트

---

### 5.2 SEO 최적화
**담당자**: 프론트엔드 개발자
**기간**: Week 8 (Day 4)

#### Task 16.1: Metadata 설정
- [ ] 모든 페이지 title, description 설정
- [ ] Open Graph 메타 태그
- [ ] Twitter Card 메타 태그

#### Task 16.2: Sitemap & Robots
- [ ] `app/sitemap.ts` 작성
- [ ] `app/robots.ts` 작성
- [ ] Google Search Console 설정

#### Task 16.3: 구조화된 데이터
- [ ] JSON-LD 스키마 추가 (선택 사항)

**산출물**:
- SEO 최적화 완료
- Sitemap 및 Robots.txt

---

### 5.3 배포 준비
**담당자**: DevOps/개발 리드
**기간**: Week 8 (Day 5)

#### Task 17.1: 환경 설정
- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] 도메인 연결 (choipd.com)

#### Task 17.2: 데이터베이스 마이그레이션
- [ ] 프로덕션 DB 생성
- [ ] 실제 콘텐츠 시딩
- [ ] 관리자 계정 생성

#### Task 17.3: 백업 설정
- [ ] 백업 스크립트 작성
- [ ] Cron job 설정 (일일 백업)

**산출물**:
- 배포 준비 완료

---

### 5.4 프로덕션 배포
**담당자**: DevOps/개발 리드
**기간**: Week 8 (Day 6)

#### Task 18.1: 배포
- [ ] Vercel에 배포
- [ ] SSL 인증서 확인
- [ ] 도메인 DNS 설정

#### Task 18.2: 모니터링 설정
- [ ] Google Analytics 연동
- [ ] 에러 모니터링 (Sentry 등)
- [ ] Uptime 모니터링

#### Task 18.3: 최종 검증
- [ ] 프로덕션 환경 전체 테스트
- [ ] 성능 측정
- [ ] 보안 검토

**산출물**:
- 운영 중인 웹사이트
- 모니터링 대시보드

---

### 5.5 문서화 및 인수인계
**담당자**: 개발 리드
**기간**: Week 8 (Day 7)

#### Task 19.1: 문서 작성
- [ ] 관리자 사용 매뉴얼
- [ ] 운영 가이드
- [ ] 기술 문서 업데이트

#### Task 19.2: 인수인계
- [ ] 최범희 대표 교육
- [ ] 관리자 기능 시연
- [ ] 질의응답

**산출물**:
- 사용자 매뉴얼
- 완료된 프로젝트

---

## 6. 리소스 계획

### 6.1 인력
| 역할 | 인원 | 투입 기간 |
|------|------|----------|
| 프론트엔드 개발자 | 1명 | 8주 |
| 백엔드 개발자 | 1명 | 8주 |
| 풀스택 개발자 | 1명 | 8주 |
| 개발 리드 | 1명 | 8주 |
| QA/테스터 | 1명 | 1주 (Week 8) |

### 6.2 예산 (예시)
- 개발 인건비: (생략)
- 도메인 비용: $15/년
- 호스팅 비용: $20/월 (Vercel Pro)
- 외부 서비스: $0 (초기 단계)

---

## 7. 리스크 관리

### 7.1 기술적 리스크
| 리스크 | 영향도 | 대응 방안 |
|--------|--------|----------|
| SQLite 성능 이슈 | 중 | 초기 트래픽 모니터링, 필요시 PostgreSQL 마이그레이션 |
| 파일 업로드 용량 문제 | 중 | 파일 크기 제한, 추후 S3 마이그레이션 |
| NextAuth 설정 복잡도 | 낮 | 공식 문서 참조, 예제 코드 활용 |

### 7.2 일정 리스크
| 리스크 | 영향도 | 대응 방안 |
|--------|--------|----------|
| 요구사항 변경 | 중 | 우선순위 재조정, MVP 범위 명확화 |
| 개발 지연 | 중 | 주간 진행 점검, 버퍼 타임 확보 |

---

## 8. 성공 기준

### 8.1 기능적 성공 기준
- [ ] 모든 PRD 기능 요구사항(FR) 구현 완료
- [ ] 관리자 CMS를 통한 콘텐츠 관리 가능
- [ ] 문의 및 리드 수집 정상 작동

### 8.2 비기능적 성공 기준
- [ ] Lighthouse 성능 점수 90+ (모바일/데스크톱)
- [ ] 페이지 로드 시간 3초 이내
- [ ] 모바일 반응형 완벽 지원
- [ ] 크로스 브라우저 호환성

### 8.3 비즈니스 성공 기준
- [ ] 최범희 대표 승인
- [ ] 실제 콘텐츠 업로드 완료
- [ ] 교육 과정 10개 이상 등록
- [ ] 공식 론칭 및 홍보

---

## 9. 커뮤니케이션 계획

### 9.1 정기 미팅
- **주간 스탠드업**: 매주 월요일 10:00 (30분)
- **진행 상황 리뷰**: 매주 금요일 15:00 (1시간)
- **스프린트 회고**: 각 Phase 종료 후

### 9.2 보고 체계
- **일일 진행 보고**: 슬랙/이메일
- **주간 보고서**: 금요일 미팅 후
- **이슈 에스컬레이션**: 즉시 개발 리드에게 보고

### 9.3 협업 도구
- **프로젝트 관리**: Notion/Jira
- **코드 저장소**: GitHub
- **커뮤니케이션**: Slack
- **디자인**: Figma (필요 시)

---

## 10. Phase 2/3 로드맵 (향후 확장)

### Phase 2 (프로덕션 3개월 후)
- [ ] Stripe/TossPayments 결제 시스템 통합
- [ ] 수강생 전용 커뮤니티 (사용자 인증 확장)
- [ ] Cloudflare R2/AWS S3 파일 저장소 마이그레이션
- [ ] 이메일 자동화 (Resend/SendGrid)

### Phase 3 (프로덕션 6개월 후)
- [ ] 한국환경저널 RSS 피드 자동 연동
- [ ] 실시간 Analytics 대시보드
- [ ] 모바일 앱 (PWA 또는 React Native)
- [ ] AI 챗봇 (교육 문의 자동 응답)

---

## 부록: 체크리스트

### 개발 시작 전
- [ ] PRD 최종 승인
- [ ] LLD 기술 검토 완료
- [ ] 개발 환경 준비 (IDE, Git, Node.js)
- [ ] 팀원 역할 분담
- [ ] GitHub Repository 생성

### 각 Phase 완료 시
- [ ] 코드 리뷰 완료
- [ ] 단위 테스트 작성
- [ ] 문서 업데이트
- [ ] Git 커밋 및 푸시
- [ ] 다음 Phase 준비

### 최종 배포 전
- [ ] 모든 기능 테스트 통과
- [ ] 성능 최적화 완료
- [ ] SEO 설정 완료
- [ ] 백업 시스템 구축
- [ ] 모니터링 설정
- [ ] 사용자 매뉴얼 작성

---

**문서 승인**
- 프로젝트 오너: _______________
- 개발 리드: _______________
- 작성일: 2025년 11월 8일
