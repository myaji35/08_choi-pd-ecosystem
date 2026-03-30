# SaaS 범용 전환 — 입력 정리

## 앱 설명
imPD(최PD 전용 브랜드 허브 + 유통 플랫폼)를 **개인사업자/프리랜서 범용 SaaS**로 전환한다.
각 사용자(테넌트)가 자신만의 브랜드 허브를 가질 수 있도록 멀티테넌시를 도입하고,
직업군별 커스터마이징은 i18n 패턴(JSON 기반)으로 처리한다.

## 핵심 기능 요구사항

### 1. 멀티테넌시
- 단일 DB, 테넌트별 데이터 격리 (tenant_id 컬럼)
- 서브도메인 기반 라우팅: `{slug}.impd.io`
- 테넌트별 브랜딩 (로고, 색상, 도메인)

### 2. i18n 패턴 (직업군별 커스터마이징)
- JSON 파일로 용어/라벨/카테고리 정의
- 샘플 직업군: PD(방송), 쇼핑몰(커머스)
- 사용자가 직업군 선택 시 UI 용어 자동 전환

### 3. 인증/인가
- 기존 Clerk 인증 유지
- 테넌트 소유자(Owner) / 멤버(Member) / 게스트 역할
- 테넌트별 접근 제어

### 4. 구독 & 결제
- 구독 플랜: Free / Pro / Enterprise
- 결제 연동 (Stripe 또는 TossPayments)
- 플랜별 기능 제한 (리소스 수, SNS 계정 수 등)

### 5. 대시보드
- 테넌트 소유자용 대시보드 (기존 /pd 확장)
- SaaS 운영자용 슈퍼어드민 대시보드 (기존 /admin 확장)
- 사용량/매출 분석

### 6. 기존 기능 유지
- 교육과정 CRUD, SNS 연동, 히어로 이미지, 칸반 보드
- 유통사 관리, 리소스 라이브러리
- 모든 기존 기능에 tenant_id 추가

## 기술 스택
- **Framework**: Next.js (App Router) — 현재 유지
- **DB**: SQLite (Drizzle ORM) — 현재 유지
- **Styling**: Tailwind CSS + shadcn/ui — 현재 유지
- **State**: Zustand — 현재 유지
- **인증**: Clerk — 현재 유지
- **결제**: Stripe (신규)

## 규모
- 중규모 (기존 코드 확장)

## 기존 코드
- 프로젝트: `/Volumes/E_SSD/02_GitHub.nosync/0008_choi-pd/choi-pd-ecosystem/`
- DB 스키마: `src/lib/db/schema.ts` (68개 테이블)
- API Routes: 110개 이상
- 컴포넌트: 94개 tsx

## 배포 플랫폼
- Vultr (Docker) — 현재 유지
- URL: impd.158.247.235.31.nip.io

## 산출물 기대
1. 아키텍처 설계 문서 (`01_architecture.md`)
2. API 명세 (`02_api_spec.md`)
3. DB 스키마 변경 (`03_db_schema.md`)
4. 테스트 계획 (`04_test_plan.md`)
5. 배포 가이드 (`05_deploy_guide.md`)
6. 리뷰 보고서 (`06_review_report.md`)
7. 소스 코드 (src/ 디렉토리)
