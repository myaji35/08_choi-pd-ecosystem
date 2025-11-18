# 작업 목록: 다면적 브랜드 아이덴티티 히어로 섹션

**입력**: `/specs/001-hero-section/`의 설계 문서
**전제 조건**: plan.md (필수), spec.md (필수), research.md, data-model.md, contracts/

## 형식: `[ID] [P?] [Story] 설명`

- **[P]**: 병렬 실행 가능 (다른 파일, 의존성 없음)
- **[Story]**: 사용자 스토리 레이블 (예: US1, US2, US3)
- 각 작업 설명에 정확한 파일 경로 포함

## 경로 규칙

- Next.js 앱 라우터 구조 사용
- 모든 경로는 `choi-pd-ecosystem/` 기준 상대 경로

---

## Phase 1: 프로젝트 초기 설정

**목표**: Next.js 프로젝트 생성 및 기본 의존성 설치

**전제 조건**: Node.js 18.17+ 설치됨

### 작업 목록

- [x] T001 Next.js 프로젝트 생성: `npx create-next-app@latest choi-pd-ecosystem --typescript --tailwind --app --use-npm`
- [x] T002 [P] shadcn/ui 초기화: `npx shadcn@latest init -y` (choi-pd-ecosystem/ 디렉토리 내)
- [x] T003 [P] 추가 shadcn/ui 컴포넌트 설치: `npx shadcn@latest add button card input` (choi-pd-ecosystem/)
- [x] T004 Drizzle ORM 및 SQLite 의존성 설치: `npm install drizzle-orm better-sqlite3` (choi-pd-ecosystem/)
- [x] T005 Zustand 및 기타 유틸리티 설치: `npm install zustand lucide-react class-variance-authority clsx tailwind-merge` (choi-pd-ecosystem/)

### 완료 기준

- ✅ `choi-pd-ecosystem/` 디렉토리에 Next.js 프로젝트 생성됨
- ✅ `npm run dev` 실행 시 기본 Next.js 페이지 표시됨
- ✅ `components/ui/` 디렉토리에 shadcn/ui 컴포넌트 존재

---

## Phase 2: 기반 인프라 구축

**목표**: 데이터베이스, 유틸리티, 상태 관리 등 모든 User Story가 의존하는 공통 인프라 구축

**전제 조건**: Phase 1 완료

### 작업 목록

- [x] T006 환경 변수 파일 생성: `.env.local` 파일 생성 및 `DATABASE_URL=file:./local.db` 추가 (choi-pd-ecosystem/)
- [x] T007 [P] Drizzle 설정 파일 생성: `drizzle.config.ts` 작성 (choi-pd-ecosystem/drizzle.config.ts)
- [x] T008 [P] 상수 파일 생성: `lib/constants.ts` (파일 크기 제한 2MB, 허용 타입 등 정의)
- [x] T009 [P] 유틸리티 함수 생성: `lib/utils/validation.ts` (파일 검증 로직)
- [x] T010 [P] Zustand formStore 생성: `lib/stores/formStore.ts` (isLoading, error 상태 관리)
- [x] T011 데이터베이스 스키마 정의: `lib/db/schema.ts` (heroImages 테이블 Drizzle 스키마)
- [x] T012 데이터베이스 연결 파일 생성: `lib/db/index.ts` (DB 연결 인스턴스)
- [x] T013 Drizzle 마이그레이션 실행: `npx drizzle-kit generate:sqlite && npx drizzle-kit push:sqlite`

### 완료 기준

- ✅ `local.db` 파일이 생성되고 `hero_images` 테이블 존재
- ✅ SQLite 브라우저로 테이블 구조 확인 가능
- ✅ `lib/db/schema.ts`에서 TypeScript 타입 자동 추론됨

---

## Phase 3: User Story 1 - 브랜드 정체성 표시 (P1)

**User Story**: 첫 방문자가 홈페이지 진입 시 최범희 PD의 세 가지 전문 분야를 즉시 파악

**Independent Test**: 홈페이지 로드 시 히어로 섹션에 "최범희 PD" 헤드라인과 세 가지 정체성(교육, 미디어, 작품)이 표시되는지 확인

**Acceptance Scenarios**:
1. ✅ 히어로 섹션에 헤드라인 및 히어로 이미지 표시
2. ✅ 세 가지 정체성 텍스트 표시 (Education, Media, Works)
3. ✅ 모바일(320px~)에서 가로 스크롤 없이 읽기 가능
4. ✅ 3-5초 내 브랜드 파악 가능 (시각적 계층 유지)

### 작업 목록

- [x] T014 [P] [US1] 서비스 카드 정적 데이터 생성: `choi-pd-ecosystem/app/(home)/_components/serviceCardsData.ts` (Education, Media, Works 3개 카드 정의)
- [x] T015 [P] [US1] 데이터베이스 쿼리 함수 생성: `choi-pd-ecosystem/lib/db/queries/heroImage.ts` (getActiveHeroImage 함수)
- [x] T016 [US1] 히어로 섹션 컴포넌트 생성: `choi-pd-ecosystem/app/(home)/_components/HeroSection.tsx` (헤드라인, 이미지, 정체성 표시)
- [x] T017 [US1] 홈페이지 라우트 생성: `choi-pd-ecosystem/app/(home)/page.tsx` (SSG, revalidate 3600초)
- [x] T018 [P] [US1] 기본 히어로 이미지 준비: `public/uploads/hero/` 디렉토리 생성 및 기본 이미지 추가
- [x] T019 [US1] 시드 데이터 삽입: 초기 활성 히어로 이미지 DB 레코드 생성 (lib/db/seed.ts 작성 및 실행)

### 완료 기준

- ✅ `http://localhost:3000` 접속 시 히어로 섹션 표시
- ✅ 헤드라인 "최범희 PD" 표시
- ✅ 세 가지 정체성 텍스트 표시 (교육: 스마트폰 창업 전략가, 미디어: 한국환경저널 발행인, 작품: 작가 & 모바일 스케치 아티스트)
- ✅ 히어로 이미지 표시 (기본 이미지 또는 그라디언트 배경)
- ✅ 모바일 320px 너비에서 가로 스크롤 없이 정상 표시

### 독립 테스트 시나리오

```bash
# 1. 개발 서버 실행
npm run dev

# 2. 브라우저에서 http://localhost:3000 접속

# 3. 확인 사항
- [x] 페이지 상단에 히어로 섹션 표시
- [x] "최범희 PD" 헤드라인 표시
- [x] "교육", "미디어", "작품" 세 가지 정체성 표시
- [x] 히어로 이미지 또는 배경 표시
- [x] 모바일 뷰(DevTools에서 320px)에서 레이아웃 정상

# 4. Chrome DevTools Performance 탭에서 LCP < 2.5초 확인
```

---

## Phase 4: User Story 2 - 서비스 네비게이션 (P2)

**User Story**: 방문자가 관심 있는 서비스로 빠르게 이동

**Independent Test**: 서비스 카드(Education, Media, Works) 클릭 시 해당 페이지로 이동하는지 확인

**Acceptance Scenarios**:
1. ✅ 카드 호버 시 시각적 피드백 (hover state, cursor change)
2. ✅ Education 카드 클릭 → `/education` 이동
3. ✅ Media 카드 클릭 → `/media` 이동
4. ✅ Works 카드 클릭 → `/works` 이동
5. ✅ 모바일에서 44x44px 최소 터치 타겟 보장

**전제 조건**: Phase 3 (US1) 완료

### 작업 목록

- [x] T020 [P] [US2] 서비스 카드 컴포넌트 생성: `choi-pd-ecosystem/app/(home)/_components/ServiceCard.tsx` (재사용 가능한 카드 UI)
- [x] T021 [US2] HeroSection에 서비스 카드 통합: `choi-pd-ecosystem/app/(home)/_components/HeroSection.tsx` 업데이트 (ServiceCard 3개 렌더링)
- [x] T022 [P] [US2] Education 페이지 생성: `choi-pd-ecosystem/app/education/page.tsx` (임시 "교육 프로그램" 텍스트)
- [x] T023 [P] [US2] Media 페이지 생성: `choi-pd-ecosystem/app/media/page.tsx` (임시 "한국환경저널" 텍스트)
- [x] T024 [P] [US2] Works 페이지 생성: `choi-pd-ecosystem/app/works/page.tsx` (임시 "작품" 텍스트)

**참고**: T022, T023, T024는 임시 페이지로, 추후 별도 User Story에서 상세 구현 예정

### 완료 기준

- ✅ 홈페이지에 3개 서비스 카드 표시 (Education, Media, Works)
- ✅ 각 카드에 호버 효과 적용 (scale, shadow 등)
- ✅ Education 카드 클릭 → `/education` 페이지 이동
- ✅ Media 카드 클릭 → `/media` 페이지 이동
- ✅ Works 카드 클릭 → `/works` 페이지 이동
- ✅ 모바일에서 카드 크기 최소 44x44px

### 독립 테스트 시나리오

```bash
# 1. 홈페이지 접속
http://localhost:3000

# 2. 각 서비스 카드 클릭 테스트
- [x] "교육" 카드 클릭 → /education 이동 확인
- [x] "미디어" 카드 클릭 → /media 이동 확인
- [x] "작품" 카드 클릭 → /works 이동 확인

# 3. 호버 효과 확인 (데스크톱)
- [x] 카드에 마우스 오버 시 hover state 표시

# 4. 터치 타겟 확인 (모바일)
- [x] Chrome DevTools → iPhone SE (375px)
- [x] Inspect Element로 카드 크기 측정 (최소 44x44px)
```

---

## Phase 5: User Story 3 - Admin 이미지 관리 (P3)

**User Story**: 관리자가 히어로 이미지를 업로드하고 교체

**Independent Test**: `/admin/hero-image`에서 이미지 업로드 후 홈페이지에 반영되는지 확인

**Acceptance Scenarios**:
1. ✅ Admin 페이지에서 현재 이미지 미리보기 및 업로드 인터페이스 표시
2. ✅ JPG/PNG/WebP 업로드 성공 및 홈페이지 즉시 반영
3. ✅ 2MB 초과 파일 업로드 시 에러 메시지 표시
4. ✅ 잘못된 차원/비율 이미지 업로드 시 경고 표시
5. ✅ 이미지 업로드 후 캐시 버스팅 (브라우저 캐시 무효화)

**전제 조건**: Phase 2 (Foundational) 완료

**참고**: Admin 인증 시스템은 별도 기능으로 간주. 이 Phase에서는 `/admin` 라우트가 공개 접근 가능하다고 가정.

### 작업 목록

- [x] T025 [P] [US3] API Route - GET active 이미지: `choi-pd-ecosystem/app/api/hero-image/active/route.ts` (현재 활성 이미지 조회)
- [x] T026 [P] [US3] API Route - GET 모든 이미지: `choi-pd-ecosystem/app/api/hero-image/route.ts` (GET 메서드, 관리자용 목록)
- [x] T027 [US3] API Route - POST 이미지 업로드: `choi-pd-ecosystem/app/api/hero-image/route.ts` (POST 메서드, FormData 처리, 파일 저장, DB 삽입)
- [x] T028 [US3] API Route - DELETE 이미지: `choi-pd-ecosystem/app/api/hero-image/[id]/route.ts` (DELETE 메서드, 파일 및 DB 삭제)
- [x] T029 [P] [US3] 데이터베이스 쿼리 함수 추가: `choi-pd-ecosystem/lib/db/queries/heroImage.ts` (uploadAndActivateHeroImage, getAllHeroImages, deleteHeroImage)
- [x] T030 [P] [US3] Admin 이미지 업로더 컴포넌트: `choi-pd-ecosystem/app/admin/hero-image/_components/HeroImageUploader.tsx` (파일 선택, 업로드, 진행 표시)
- [x] T031 [US3] Admin 이미지 관리 페이지: `choi-pd-ecosystem/app/admin/hero-image/page.tsx` (현재 이미지 미리보기, 업로더, 이미지 목록)
- [x] T032 [US3] ISR 캐시 무효화 통합: `choi-pd-ecosystem/app/api/hero-image/route.ts` POST 성공 시 `revalidatePath('/')` 호출

### 완료 기준

- ✅ `/admin/hero-image` 접속 시 현재 활성 이미지 미리보기 표시
- ✅ 파일 선택 및 업로드 인터페이스 표시
- ✅ 2MB 이하 JPG/PNG/WebP 업로드 성공
- ✅ 2MB 초과 파일 업로드 시 에러 메시지 표시
- ✅ 업로드 성공 후 홈페이지에서 새 이미지 즉시 표시 (캐시 무효화)
- ✅ 비활성 이미지 삭제 가능, 활성 이미지 삭제 시 에러

### 독립 테스트 시나리오

```bash
# 1. Admin 페이지 접속
http://localhost:3000/admin/hero-image

# 2. 현재 이미지 확인
- [x] 활성 이미지 미리보기 표시

# 3. 새 이미지 업로드 (성공 케이스)
- [x] 1.5MB JPG 파일 선택 및 업로드
- [x] "업로드 성공" 메시지 표시
- [x] 홈페이지 새로고침 → 새 이미지 표시

# 4. 파일 크기 검증 (실패 케이스)
- [x] 3MB PNG 파일 업로드 시도
- [x] "파일 크기가 2MB를 초과합니다" 에러 메시지 표시

# 5. 파일 타입 검증 (실패 케이스)
- [x] GIF 파일 업로드 시도
- [x] "지원되지 않는 파일 형식입니다" 에러 메시지 표시

# 6. 이미지 삭제
- [x] 비활성 이미지 삭제 성공
- [x] 활성 이미지 삭제 시도 → "활성 이미지는 삭제할 수 없습니다" 에러
```

---

## Phase 6: 마무리 및 최적화

**목표**: 접근성, 성능, 에지 케이스 처리

**전제 조건**: Phase 3, 4, 5 완료

### 작업 목록

- [x] T033 [P] 접근성 개선: `choi-pd-ecosystem/app/(home)/_components/HeroSection.tsx` (ARIA 레이블, 시맨틱 HTML, alt 텍스트 추가)
- [x] T034 [P] 키보드 네비게이션 테스트: ServiceCard에 focus:ring 스타일 추가 및 Tab 키 네비게이션 확인
- [x] T035 Fallback UI 구현: 히어로 이미지 로드 실패 시 그라디언트 배경 표시 (choi-pd-ecosystem/app/(home)/_components/HeroSection.tsx)
- [x] T036 성능 최적화: Next.js Image 컴포넌트 priority 속성 적용, Lighthouse 테스트 (LCP < 2.5초 확인)
- [x] T037 명암비 검증: Chrome DevTools Accessibility 탭에서 WCAG 2.1 Level AA 명암비 확인 (최소 4.5:1)

### 완료 기준

- ✅ 모든 이미지에 의미 있는 alt 텍스트 존재
- ✅ Tab 키로 모든 서비스 카드 포커스 가능
- ✅ Enter 키로 카드 활성화 (네비게이션) 가능
- ✅ Lighthouse 성능 점수 90+ 또는 LCP < 2.5초
- ✅ WCAG 2.1 Level AA 명암비 준수

### 테스트 체크리스트

```bash
# 접근성 테스트
- [ ] NVDA 또는 VoiceOver로 스크린리더 테스트
- [ ] Tab 키로 모든 인터랙티브 요소 접근 가능
- [ ] Enter/Space 키로 카드 활성화
- [ ] axe DevTools 확장 프로그램으로 자동 검사 (0 violations)

# 성능 테스트
- [ ] Lighthouse 실행 (Desktop & Mobile)
- [ ] Performance: 90+
- [ ] Accessibility: 95+
- [ ] LCP < 2.5초 (3G 네트워크 시뮬레이션)

# 에지 케이스 테스트
- [ ] 히어로 이미지 없을 때 Fallback UI 표시
- [ ] 네트워크 오류 시 이미지 로드 실패 처리
- [ ] 긴 설명 텍스트 ellipsis 처리
```

---

## 의존성 그래프

### User Story 완료 순서

```
Phase 1: Setup (필수)
         ↓
Phase 2: Foundational (필수)
         ↓
    ┌────┴────┬────────────┐
    ↓         ↓            ↓
Phase 3   Phase 4      Phase 5
 (US1)     (US2)        (US3)
  P1        P2           P3
    ↓         ↓            ↓
    └────┬────┴────────────┘
         ↓
    Phase 6: Polish
```

**의존성 설명**:

- **Phase 1 → Phase 2**: 기반 인프라 구축은 프로젝트 초기 설정 후 가능
- **Phase 2 → Phase 3**: US1은 DB 스키마 및 쿼리 함수 필요 (Phase 2 완료 후)
- **Phase 2 → Phase 4**: US2는 US1의 컴포넌트 구조를 확장하지만, 기술적으로는 Phase 2만 완료되면 독립 실행 가능
- **Phase 2 → Phase 5**: US3는 DB 및 API 인프라만 필요 (US1, US2와 독립적)
- **Phase 3, 4, 5 → Phase 6**: 모든 User Story 완료 후 최종 마무리

### User Story 간 독립성

- ✅ **US1 독립적**: 히어로 섹션만 표시 (서비스 카드 없이도 작동)
- ✅ **US2 독립적**: 서비스 카드는 US1의 히어로 이미지 없이도 작동 가능
- ✅ **US3 독립적**: Admin 이미지 관리는 프론트엔드 UI와 완전히 독립 (API만 의존)

---

## 병렬 실행 가이드

### Phase 2: 기반 인프라 (동시 실행 가능)

**그룹 A** (설정 파일):
- T007: `drizzle.config.ts`
- T008: `lib/constants.ts`
- T009: `lib/utils/validation.ts`
- T010: `lib/stores/formStore.ts`

**그룹 B** (DB 관련, 그룹 A 완료 후):
- T011: `lib/db/schema.ts`
- T012: `lib/db/index.ts`

**실행 순서**:
1. T006 (환경 변수) → 그룹 A (병렬) → 그룹 B (병렬) → T013 (마이그레이션)

---

### Phase 3: US1 (동시 실행 가능)

**그룹 A**:
- T014: `serviceCardsData.ts`
- T015: `lib/db/queries/heroImage.ts`
- T018: 기본 이미지 준비

**그룹 B** (그룹 A 완료 후):
- T016: `HeroSection.tsx`
- T017: `app/(home)/page.tsx`

**실행 순서**:
1. 그룹 A (병렬) → 그룹 B (병렬) → T019 (시드 데이터)

---

### Phase 4: US2 (동시 실행 가능)

**그룹 A**:
- T020: `ServiceCard.tsx`
- T022: `app/education/page.tsx`
- T023: `app/media/page.tsx`
- T024: `app/works/page.tsx`

**그룹 B** (그룹 A 완료 후):
- T021: HeroSection 업데이트

**실행 순서**:
1. 그룹 A (병렬) → T021

---

### Phase 5: US3 (동시 실행 가능)

**그룹 A**:
- T025: `app/api/hero-image/active/route.ts`
- T026: `app/api/hero-image/route.ts` (GET)
- T029: 쿼리 함수 추가
- T030: `HeroImageUploader.tsx`

**그룹 B** (그룹 A 완료 후):
- T027: POST 업로드
- T028: DELETE 삭제
- T031: Admin 페이지

**그룹 C** (그룹 B 완료 후):
- T032: ISR 캐시 무효화

**실행 순서**:
1. 그룹 A (병렬) → 그룹 B (병렬) → T032

---

### Phase 6: 마무리 (동시 실행 가능)

**그룹 A**:
- T033: 접근성 개선
- T034: 키보드 네비게이션
- T035: Fallback UI

**그룹 B** (그룹 A 완료 후):
- T036: 성능 최적화
- T037: 명암비 검증

**실행 순서**:
1. 그룹 A (병렬) → 그룹 B (병렬)

---

## MVP 범위

### 최소 기능 제품 (MVP) 정의

**목표**: 최소한의 작업으로 핵심 가치 제공

**포함 범위**:
- ✅ Phase 1: 프로젝트 초기 설정
- ✅ Phase 2: 기반 인프라
- ✅ Phase 3: User Story 1 (브랜드 정체성 표시) - **P1 우선순위**

**제외 범위** (MVP 이후 추가):
- ❌ Phase 4: User Story 2 (서비스 네비게이션) - P2
- ❌ Phase 5: User Story 3 (Admin 이미지 관리) - P3
- ❌ Phase 6: 마무리 및 최적화 (일부만 포함 가능)

### MVP 실행 계획

```bash
# MVP Phase 1: Setup (30분)
npm install
# T001 ~ T005 실행

# MVP Phase 2: Foundational (1시간)
# T006 ~ T013 실행

# MVP Phase 3: US1 (1.5시간)
# T014 ~ T019 실행

# MVP 완료 확인
npm run dev
# http://localhost:3000 접속
# → 히어로 섹션 + 세 가지 정체성 표시 확인
```

### MVP 이후 점진적 개선

**Iteration 2** (Phase 4 추가):
- User Story 2 구현 → 서비스 네비게이션 추가

**Iteration 3** (Phase 5 추가):
- User Story 3 구현 → Admin 이미지 관리 추가

**Iteration 4** (Phase 6 추가):
- 접근성 및 성능 최적화

---

## 작업 추적 가이드

### 진행 상황 체크리스트

작업 완료 시 체크박스에 `x` 표시:

```
- [x] T001 Next.js 프로젝트 생성
- [ ] T002 shadcn/ui 초기화
```

### 작업 시작 전 체크리스트

각 Phase 시작 전 확인:

- [ ] 이전 Phase의 모든 작업 완료 확인
- [ ] 로컬 환경에서 `npm run dev` 정상 실행 확인
- [ ] Git 브랜치 `001-hero-section`에 있는지 확인

### 문제 발생 시

1. **Troubleshooting Guide**: [quickstart.md](./quickstart.md) 참조
2. **에러 로그**: Console 및 터미널 출력 확인
3. **롤백**: `git stash` 또는 이전 커밋으로 복원

---

## 참고 문서

- **기능 명세**: [spec.md](./spec.md) - User Stories 및 Acceptance Criteria
- **구현 계획**: [plan.md](./plan.md) - 기술 스택 및 아키텍처 결정사항
- **데이터 모델**: [data-model.md](./data-model.md) - 엔티티 및 쿼리 패턴
- **API 계약**: [contracts/hero-api.yaml](./contracts/hero-api.yaml) - OpenAPI 스펙
- **개발 가이드**: [quickstart.md](./quickstart.md) - 로컬 환경 설정 및 문제 해결

---

**작성일**: 2025-11-18
**작성자**: Claude Code (Spec Kit 워크플로우)
**브랜치**: `001-hero-section`
**다음 명령**: `/speckit.implement` (자동 구현 시작)
