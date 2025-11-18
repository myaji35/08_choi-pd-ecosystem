# 구현 계획: 다면적 브랜드 아이덴티티 히어로 섹션

**브랜치**: `001-hero-section` | **날짜**: 2025-11-18 | **명세**: [spec.md](./spec.md)
**입력**: 기능 명세 `/specs/001-hero-section/spec.md`

**참고**: 이 문서는 `/speckit.plan` 명령으로 생성되었습니다.

## 요약

최범희 PD의 세 가지 전문 정체성(교육, 미디어, 작품)을 시각적으로 전달하는 히어로 섹션을 구현합니다. 히어로 이미지를 상단에 배치하고 하단에 헤드라인 및 브랜드 정체성 텍스트를 표시하는 수직 분할 레이아웃을 사용합니다. 관리자는 CMS를 통해 히어로 이미지를 업로드 및 관리할 수 있으며, 방문자는 세 개의 서비스 허브 카드를 통해 관련 섹션으로 빠르게 이동할 수 있습니다. 모바일 우선 반응형 디자인으로 모든 디바이스에서 최적의 사용자 경험을 제공합니다.

## 기술 컨텍스트

**언어/버전**: TypeScript 5.0+, Node.js 18+
**주요 의존성**: Next.js 16+ (앱 라우터), React 19+, Tailwind CSS 3.4+, shadcn/ui, Drizzle ORM, React Hook Form, Zod, Lucide React
**저장소**: SQLite (파일 기반), Google Cloud Storage (이미지 저장)
**테스팅**: Jest + React Testing Library (단위 테스트), Playwright (E2E 테스트, 선택 사항)
**타겟 플랫폼**: 웹 브라우저 (Chrome, Safari, Firefox 최신 2개 버전), 모바일 브라우저 (iOS Safari, Chrome Mobile)
**프로젝트 타입**: 웹 애플리케이션 (Next.js 앱 라우터 구조)
**성능 목표**: LCP < 2.5초 (3G 네트워크), FID < 100ms, CLS < 0.1
**제약사항**: 이미지 파일 크기 최대 2MB, 관리자 전용 이미지 업로드 (인증 필수), GCS 업로드 실패 시 재시도 로직 필요
**규모/범위**: 단일 히어로 이미지 관리, 3개 고정 서비스 카드, 예상 트래픽 1000 MAU (월간 활성 사용자)

## 헌법 검증

*관문: Phase 0 연구 시작 전 통과 필수. Phase 1 설계 완료 후 재검증.*

### ✅ 원칙 1. 사용자 중심 설계

- **준수**: 모바일 우선 반응형 디자인 (320px+)
- **준수**: 최소 44x44px 터치 타겟 (서비스 카드)
- **준수**: WCAG 2.1 Level AA 접근성 (키보드 네비게이션, 명암비 4.5:1)
- **준수**: 5초 이내 브랜드 정체성 인식 가능 (명확한 시각적 계층)

### ✅ 원칙 2. 콘텐츠 관리 중심 구조

- **준수**: `/admin` 경로를 통한 히어로 이미지 관리
- **준수**: 데이터베이스 접근은 Next.js API Routes만 사용
- **준수**: 이미지 업로드 CRUD 기능 제공

### ✅ 원칙 3. 성능 최우선

- **준수**: LCP 목표 2.5초 미만
- **준수**: Next.js 정적 사이트 생성 (SSG) 활용
- **준수**: 이미지 최적화 (WebP, 반응형 이미지, 지연 로딩)
- **준수**: 코드 스플리팅 (Next.js 자동 지원)

### ✅ 원칙 4. 데이터 무결성 및 보안

- **준수**: 서버 측 파일 유효성 검증 (MIME 타입, 파일 크기)
- **준수**: 관리자 인증 미들웨어 (의존성)
- **준수**: 환경 변수를 통한 GCS 인증 정보 관리

### ✅ 원칙 5. 단순성과 유지보수성

- **준수**: 최소한의 외부 의존성 (헌법 승인 기술 스택)
- **준수**: Zustand 상태 관리 (`uiStore` for modal/loading states)
- **준수**: Next.js 앱 라우터 구조 준수
- **준수**: 명확한 문서화 (spec.md, plan.md, data-model.md)

### 검증 결과

**상태**: ✅ 모든 헌법 원칙 준수
**위반 사항**: 없음
**복잡도 예외**: 없음

## 프로젝트 구조

### 문서 (이 기능)

```text
specs/001-hero-section/
├── spec.md              # 기능 명세 (완료)
├── plan.md              # 이 파일 (/speckit.plan 명령 출력)
├── research.md          # Phase 0 출력 (/speckit.plan 명령)
├── data-model.md        # Phase 1 출력 (/speckit.plan 명령)
├── quickstart.md        # Phase 1 출력 (/speckit.plan 명령)
├── contracts/           # Phase 1 출력 (/speckit.plan 명령)
│   ├── api-hero-image.md
│   └── api-service-cards.md
└── tasks.md             # Phase 2 출력 (/speckit.tasks 명령 - 이 명령에서 생성하지 않음)
```

### 소스 코드 (저장소 루트)

Next.js 앱 라우터 구조 사용:

```text
choi-pd-ecosystem/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # 홈페이지 (히어로 섹션 포함)
│   │   └── layout.tsx                  # 공개 페이지 레이아웃
│   ├── admin/
│   │   ├── hero-image/
│   │   │   └── page.tsx                # 히어로 이미지 관리 페이지
│   │   └── layout.tsx                  # 관리자 레이아웃 (인증 체크)
│   └── api/
│       └── hero-image/
│           ├── route.ts                # GET, POST (업로드)
│           └── [id]/
│               └── route.ts            # PATCH, DELETE
├── components/
│   ├── hero/
│   │   ├── HeroSection.tsx             # 메인 히어로 컴포넌트
│   │   ├── HeroImage.tsx               # 히어로 이미지 표시
│   │   ├── BrandIdentities.tsx         # 3개 정체성 텍스트
│   │   └── ServiceCards.tsx            # 3개 서비스 카드
│   └── ui/
│       ├── card.tsx                    # shadcn/ui 카드
│       ├── button.tsx                  # shadcn/ui 버튼
│       └── input.tsx                   # shadcn/ui 입력
├── lib/
│   ├── db/
│   │   ├── schema.ts                   # Drizzle 스키마 (hero_images 테이블)
│   │   └── index.ts                    # DB 연결
│   ├── gcs/
│   │   └── upload.ts                   # GCS 업로드 유틸리티
│   ├── validations/
│   │   └── hero-image.ts               # Zod 스키마 (이미지 검증)
│   └── utils.ts                        # 유틸리티 함수
├── stores/
│   └── ui-store.ts                     # Zustand 상태 관리
├── public/
│   └── images/
│       └── hero-fallback.webp          # 기본 히어로 이미지
└── types/
    └── hero.ts                         # TypeScript 타입 정의
```

**구조 결정**: Next.js 앱 라우터를 사용한 웹 애플리케이션 구조를 선택했습니다. 공개 페이지(`(public)`)와 관리자 페이지(`admin`)를 명확히 분리하고, API 라우트(`api`)를 통해 데이터베이스 접근을 제어합니다. 컴포넌트는 기능별로 분리하여 재사용성과 테스트 용이성을 확보했습니다.

## 복잡도 추적

> 헌법 검증에서 위반 사항이 있는 경우에만 작성

이 섹션은 비어 있습니다 - 모든 헌법 원칙을 준수합니다.
