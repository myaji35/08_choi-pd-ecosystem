# 빠른 시작 가이드: 히어로 섹션 개발

**기능**: 001-hero-section
**작성일**: 2025-11-18
**참조**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md)

## 개요

이 가이드는 히어로 섹션 기능의 로컬 개발 환경을 설정하고 개발을 시작하는 방법을 안내합니다.

---

## 전제 조건

### 필수 소프트웨어

- **Node.js**: v18.17.0 이상
- **npm**: v9.0.0 이상 (또는 pnpm, yarn)
- **Git**: v2.30.0 이상
- **SQLite**: v3.35.0 이상 (시스템에 기본 설치됨)

### 권장 도구

- **VS Code**: TypeScript, Tailwind CSS 지원
- **VS Code 확장**:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Drizzle Kit

### Google Cloud Storage 설정 (관리자 기능용)

- GCP 프로젝트 생성 및 GCS 버킷 생성
- 서비스 계정 키 파일 (`gcs-key.json`) 다운로드

---

## 1. 프로젝트 복제 및 브랜치 전환

```bash
# 저장소 복제 (이미 복제된 경우 생략)
git clone <repository-url>
cd choi-pd-ecosystem

# 히어로 섹션 브랜치로 전환
git checkout 001-hero-section

# 또는 새 브랜치 생성 (처음 시작하는 경우)
git checkout -b 001-hero-section
```

---

## 2. 의존성 설치

```bash
# 프로젝트 디렉토리로 이동
cd choi-pd-ecosystem

# 의존성 설치
npm install

# 개발 의존성 포함 확인
npm install -D typescript @types/node @types/react @types/react-dom
npm install -D tailwindcss postcss autoprefixer
npm install -D eslint eslint-config-next
npm install -D drizzle-kit
```

---

## 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 추가합니다:

```bash
# .env.local

# 데이터베이스
DATABASE_URL="file:./local.db"

# Google Cloud Storage (관리자 이미지 업로드용)
GCS_PROJECT_ID="your-gcp-project-id"
GCS_BUCKET_NAME="choi-pd-hero-images"
GCS_KEY_FILE="./gcs-key.json"

# Next.js
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# 관리자 인증 (별도 기능, 임시로 하드코딩 가능)
ADMIN_SECRET="dev-secret-key-change-in-production"
```

**주의**: `.env.local` 파일은 `.gitignore`에 포함되어 있으므로 커밋되지 않습니다.

---

## 4. 데이터베이스 설정

### 4.1. Drizzle 스키마 생성

```bash
# lib/db/schema.ts 파일이 있는지 확인
# 없다면 data-model.md를 참고하여 생성
```

### 4.2. 데이터베이스 마이그레이션

```bash
# 마이그레이션 파일 생성
npx drizzle-kit generate:sqlite --schema=./lib/db/schema.ts

# 데이터베이스에 마이그레이션 적용
npx drizzle-kit push:sqlite
```

### 4.3. 초기 데이터 시딩 (선택 사항)

```bash
# 서비스 카드는 정적 데이터이므로 시딩 불필요
# 테스트용 히어로 이미지 추가 (선택)
npm run db:seed
```

**`package.json`에 스크립트 추가**:
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:sqlite --schema=./lib/db/schema.ts",
    "db:push": "drizzle-kit push:sqlite",
    "db:seed": "tsx scripts/seed.ts"
  }
}
```

---

## 5. GCS 서비스 계정 키 설정 (관리자 기능용)

```bash
# GCP에서 다운로드한 서비스 계정 키 파일을 프로젝트 루트에 복사
cp ~/Downloads/gcs-key.json ./gcs-key.json

# .gitignore에 gcs-key.json 추가 (이미 추가되어 있음)
echo "gcs-key.json" >> .gitignore
```

---

## 6. 개발 서버 실행

```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 열기
# http://localhost:3000
```

**기본 포트**: `3000` (변경하려면 `package.json`의 `dev` 스크립트 수정)

---

## 7. 주요 개발 경로

### 홈페이지 (히어로 섹션 포함)

- **URL**: http://localhost:3000
- **파일**: `app/(public)/page.tsx`
- **컴포넌트**: `components/hero/HeroSection.tsx`

### 관리자 히어로 이미지 관리

- **URL**: http://localhost:3000/admin/hero-image
- **파일**: `app/admin/hero-image/page.tsx`
- **인증**: 개발 중에는 임시로 우회 가능 (프로덕션에서는 필수)

### API 엔드포인트

- **활성 이미지 조회**: http://localhost:3000/api/hero-image/active
- **이미지 업로드**: POST http://localhost:3000/api/hero-image

---

## 8. 개발 워크플로우

### 8.1. 컴포넌트 개발

```bash
# 히어로 섹션 컴포넌트 디렉토리
cd components/hero/

# 주요 컴포넌트
- HeroSection.tsx       # 메인 히어로 컴포넌트
- HeroImage.tsx         # 이미지 표시 컴포넌트
- BrandIdentities.tsx   # 3개 정체성 텍스트
- ServiceCards.tsx      # 3개 서비스 카드
```

### 8.2. API 라우트 개발

```bash
# API 라우트 디렉토리
cd app/api/hero-image/

# Route Handlers
- route.ts              # GET (목록), POST (업로드)
- active/route.ts       # GET (활성 이미지)
- [id]/route.ts         # PATCH (활성화), DELETE
```

### 8.3. 스타일링

```bash
# Tailwind CSS 설정
tailwind.config.ts

# 글로벌 스타일
app/globals.css

# 컴포넌트별 스타일은 Tailwind 유틸리티 클래스 사용
```

---

## 9. 테스트

### 9.1. 단위 테스트 (Jest)

```bash
# 테스트 실행
npm test

# 특정 파일 테스트
npm test HeroSection.test.tsx

# 커버리지 확인
npm test -- --coverage
```

### 9.2. E2E 테스트 (Playwright, 선택 사항)

```bash
# Playwright 설치
npm install -D @playwright/test

# E2E 테스트 실행
npx playwright test
```

---

## 10. 빌드 및 프로덕션 준비

### 10.1. 로컬 빌드 테스트

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 확인
npm run start
```

### 10.2. 타입 체크

```bash
# TypeScript 타입 체크
npx tsc --noEmit
```

### 10.3. 린트 및 포맷

```bash
# ESLint 실행
npm run lint

# Prettier 포맷
npm run format
```

**`package.json`에 스크립트 추가**:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 11. 헌법 검증 체크리스트

개발 중 다음 헌법 원칙을 준수하는지 확인하세요:

- [ ] **원칙 1 (사용자 중심 설계)**:
  - 모바일 우선 반응형 디자인 적용 (320px+)
  - 터치 타겟 44x44px 이상 (서비스 카드)
  - WCAG 2.1 Level AA 접근성 (명암비, 키보드 네비게이션)

- [ ] **원칙 2 (콘텐츠 관리 중심 구조)**:
  - API Routes를 통한 데이터베이스 접근만 허용
  - 관리자 CMS 인터페이스 제공

- [ ] **원칙 3 (성능 최우선)**:
  - LCP < 2.5초 목표
  - 이미지 최적화 (WebP, lazy loading)

- [ ] **원칙 4 (데이터 무결성 및 보안)**:
  - 서버 측 파일 유효성 검증 (MIME 타입, 크기)
  - 환경 변수를 통한 GCS 인증 정보 관리

- [ ] **원칙 5 (단순성과 유지보수성)**:
  - 최소한의 외부 의존성
  - 명확한 파일 구조 및 네이밍

---

## 12. 일반적인 문제 해결

### 문제: `Module not found: Can't resolve 'drizzle-orm'`

**해결책**:
```bash
npm install drizzle-orm better-sqlite3
```

### 문제: GCS 업로드 실패 (`UPLOAD_FAILED`)

**해결책**:
1. `.env.local`의 GCS 환경 변수 확인
2. `gcs-key.json` 파일 경로 확인
3. GCS 버킷 권한 확인 (서비스 계정에 `Storage Object Creator` 역할 부여)

### 문제: 이미지가 표시되지 않음

**해결책**:
1. SQLite 데이터베이스에 활성 이미지가 있는지 확인
   ```bash
   sqlite3 local.db "SELECT * FROM hero_images WHERE is_active = 1;"
   ```
2. 이미지 URL이 올바른지 확인
3. Next.js Image 컴포넌트 설정 확인 (`next.config.js`의 `images` 도메인)

### 문제: TypeScript 타입 오류

**해결책**:
```bash
# 타입 정의 재생성
npx drizzle-kit generate:sqlite --schema=./lib/db/schema.ts

# VS Code 재시작
```

---

## 13. 다음 단계

환경 설정이 완료되면 다음 단계로 진행하세요:

1. **`/speckit.tasks`** 명령 실행 → 구현 작업 목록 생성
2. **User Story 1 (P1)** 구현 시작 → 브랜드 인식 히어로 섹션
3. **User Story 2 (P2)** 구현 → 서비스 카드 네비게이션
4. **User Story 3 (P3)** 구현 → 관리자 이미지 업로드

---

## 14. 참고 자료

### 공식 문서

- [Next.js 16 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Drizzle ORM 문서](https://orm.drizzle.team/)
- [shadcn/ui 문서](https://ui.shadcn.com/)

### 프로젝트 문서

- [헌법 (constitution.md)](../../.specify/memory/constitution.md)
- [기능 명세 (spec.md)](./spec.md)
- [데이터 모델 (data-model.md)](./data-model.md)
- [API 계약 (contracts/api-hero-image.md)](./contracts/api-hero-image.md)

---

**작성일**: 2025-11-18
**업데이트**: 개발 진행 중 추가 정보 업데이트 예정

**다음 명령**: `/speckit.tasks` (작업 목록 생성)
