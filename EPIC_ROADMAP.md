# imPD Platform Implementation Roadmap

## 프로젝트 개요
**imPD (I'm PD - Interactive Management Platform for Distribution)**
- 교육·미디어·작품 브랜드 생태계를 분양/재판매하는 통합 플랫폼
- 이중 관리자 시스템: 분양 플랫폼 관리 + PD 개인 브랜드 관리

---

## Epic 1: 핵심 인증 및 사용자 관리 시스템
**목표**: 안전하고 확장 가능한 인증 시스템 구축

### User Stories
- [ ] US-1.1: 개발 모드 바이패스 로그인 시스템 구현 완료
- [ ] US-1.2: Clerk 기반 프로덕션 인증 통합
- [ ] US-1.3: 역할 기반 접근 제어 (RBAC) - Admin vs PD
- [ ] US-1.4: 세션 관리 및 토큰 갱신 로직
- [ ] US-1.5: 비밀번호 재설정 및 이메일 인증

### 기술 스택
- Clerk (Production Auth)
- Next.js Middleware (Route Protection)
- Cookie-based Dev Mode Auth

### 완료 기준
- ✅ Admin/PD 로그인 페이지 구현 완료
- ✅ Middleware 기반 라우트 보호 구현 완료
- [ ] Clerk 프로덕션 환경 설정 및 테스트
- [ ] 역할별 대시보드 리디렉션 로직

**우선순위**: P0 (Critical)
**예상 기간**: 1 week
**의존성**: 없음

---

## Epic 2: 분양 플랫폼 관리 시스템 (Admin Portal)
**목표**: 분양 수요자 등록, 승인, 관리 전체 워크플로우 구축

### User Stories
- [ ] US-2.1: 분양 수요자 신규 등록 폼 (완료 ✅)
- [ ] US-2.2: 수요자 목록 조회 및 필터링 (완료 ✅)
- [ ] US-2.3: 승인/거부 워크플로우 (완료 ✅)
- [ ] US-2.4: 수요자 상세 정보 페이지
- [ ] US-2.5: 수요자 정보 수정 기능
- [ ] US-2.6: 구독 플랜 관리 (Basic/Premium/Enterprise)
- [ ] US-2.7: 계약서 업로드 및 관리
- [ ] US-2.8: 수요자별 메모 및 히스토리 관리

### 데이터베이스 스키마
- ✅ `distributors` 테이블 생성 완료
- ✅ `distributor_activity_log` 테이블 생성 완료
- [ ] 인덱스 최적화 (email, status, region)
- [ ] 풀텍스트 검색 인덱스 추가

### API 엔드포인트
- ✅ `GET /api/admin/distributors` - 목록 조회
- ✅ `POST /api/admin/distributors` - 신규 등록
- ✅ `POST /api/admin/distributors/[id]/approve` - 승인
- ✅ `POST /api/admin/distributors/[id]/reject` - 거부
- [ ] `GET /api/admin/distributors/[id]` - 상세 조회
- [ ] `PUT /api/admin/distributors/[id]` - 정보 수정
- [ ] `DELETE /api/admin/distributors/[id]` - 삭제

**우선순위**: P0 (Critical)
**예상 기간**: 2 weeks
**의존성**: Epic 1 (인증 시스템)

---

## Epic 3: 분양자 리소스 관리 시스템
**목표**: 분양자를 위한 마케팅 자료, 교육 콘텐츠, 템플릿 제공

### User Stories
- [ ] US-3.1: 리소스 카테고리 관리 (마케팅/교육/계약서/홍보/기술)
- [ ] US-3.2: 파일 업로드 시스템 (이미지, PDF, 동영상)
- [ ] US-3.3: 리소스 목록 조회 및 검색
- [ ] US-3.4: 구독 플랜별 리소스 접근 제어
- [ ] US-3.5: 다운로드 카운트 및 통계
- [ ] US-3.6: 리소스 버전 관리
- [ ] US-3.7: 분양자 대시보드에서 리소스 다운로드

### 파일 저장소
- [ ] 로컬 파일 시스템 (개발 환경)
- [ ] Vercel Blob Storage (프로덕션)
- [ ] 또는 AWS S3 / Cloudflare R2

### 데이터베이스 스키마
- ✅ `distributor_resources` 테이블 생성 완료
- [ ] 파일 메타데이터 인덱싱
- [ ] 카테고리 및 태그 시스템

**우선순위**: P1 (High)
**예상 기간**: 2 weeks
**의존성**: Epic 2 (분양 플랫폼)

---

## Epic 4: 활동 로그 및 분석 대시보드
**목표**: 분양자 활동 추적 및 비즈니스 인사이트 제공

### User Stories
- [ ] US-4.1: 실시간 활동 로그 수집 (로그인, 다운로드, 접근)
- [ ] US-4.2: 관리자 대시보드 통계 위젯
- [ ] US-4.3: 분양자별 활동 타임라인
- [ ] US-4.4: 매출 추적 및 리포팅
- [ ] US-4.5: 이탈 분양자 감지 (30일 미활동)
- [ ] US-4.6: 활동 데이터 엑스포트 (CSV, Excel)
- [ ] US-4.7: 차트 및 그래프 시각화

### 분석 메트릭
- 전체/활성/대기 분양자 수
- 플랜별 분포
- 지역별 분포
- 월별 신규 가입 추이
- 리소스 다운로드 TOP 10
- 평균 활동 빈도

### 기술 스택
- Chart.js 또는 Recharts (시각화)
- SQLite Aggregate Functions
- CSV Export Library

**우선순위**: P1 (High)
**예상 기간**: 1.5 weeks
**의존성**: Epic 2, Epic 3

---

## Epic 5: PD 개인 브랜드 관리 시스템 (/pd)
**목표**: PD가 자신의 브랜드를 직접 관리할 수 있는 도구 제공

### User Stories
- [ ] US-5.1: 프로필 사진 업로드 및 크롭 (완료 ✅)
- [ ] US-5.2: 소셜 미디어 계정 연동 (Instagram, YouTube, Facebook)
- [ ] US-5.3: SNS 게시물 예약 발행
- [ ] US-5.4: Hero 이미지 갤러리 관리
- [ ] US-5.5: 칸반 보드 (프로젝트 및 업무 관리)
- [ ] US-5.6: 뉴스레터 구독자 관리
- [ ] US-5.7: 이메일 발송 기능
- [ ] US-5.8: 개인 메모 및 일정 관리

### 데이터베이스 스키마
- ✅ `sns_accounts` 테이블
- ✅ `sns_scheduled_posts` 테이블
- ✅ `sns_post_history` 테이블
- ✅ `hero_images` 테이블
- [ ] `kanban_projects`, `kanban_tasks` 테이블
- [ ] `newsletter_campaigns` 테이블

### 외부 API 통합
- [ ] Instagram Graph API
- [ ] YouTube Data API
- [ ] Facebook Graph API
- [ ] 이메일 발송 서비스 (Resend, SendGrid)

**우선순위**: P1 (High)
**예상 기간**: 3 weeks
**의존성**: Epic 1

---

## Epic 6: 콘텐츠 관리 시스템 (CMS)
**목표**: 교육 과정, 블로그 포스트, 작품 갤러리 CRUD

### User Stories
- [ ] US-6.1: 교육 과정 등록 및 관리
- [ ] US-6.2: VOD 강의 외부 링크 연동 (Stripe, TossPayments)
- [ ] US-6.3: 블로그/공지사항 작성 (Rich Text Editor)
- [ ] US-6.4: 작품 갤러리 관리 (이미지 업로드)
- [ ] US-6.5: 언론 보도 아카이브
- [ ] US-6.6: 카테고리 및 태그 시스템
- [ ] US-6.7: 게시물 발행/비공개 상태 관리
- [ ] US-6.8: SEO 메타 태그 자동 생성

### 데이터베이스 스키마
- ✅ `courses` 테이블
- ✅ `posts` 테이블
- ✅ `works` 테이블
- [ ] 이미지 최적화 파이프라인

### Rich Text Editor
- [ ] Tiptap 또는 Lexical 통합
- [ ] 이미지 업로드 및 임베딩
- [ ] 마크다운 지원

**우선순위**: P2 (Medium)
**예상 기간**: 2 weeks
**의존성**: Epic 5

---

## Epic 7: B2B/B2G 문의 및 리드 관리
**목표**: 교육 문의 및 뉴스레터 구독자 관리

### User Stories
- [ ] US-7.1: B2B/B2G 문의 폼 제출 (완료 ✅)
- [ ] US-7.2: 문의 목록 조회 및 상태 관리 (미처리/처리중/완료)
- [ ] US-7.3: 뉴스레터 구독 폼 (완료 ✅)
- [ ] US-7.4: 구독자 목록 관리 및 세그먼트
- [ ] US-7.5: 이메일 캠페인 발송
- [ ] US-7.6: 자동 응답 이메일 설정
- [ ] US-7.7: CRM 통합 (선택 사항)

### 데이터베이스 스키마
- ✅ `inquiries` 테이블
- ✅ `leads` 테이블
- [ ] `inquiry_responses` 테이블 추가
- [ ] `email_campaigns` 테이블

**우선순위**: P2 (Medium)
**예상 기간**: 1.5 weeks
**의존성**: Epic 5

---

## Epic 8: 서브도메인 멀티 테넌트 시스템
**목표**: chopd.* 서브도메인으로 분양자별 브랜드 사이트 제공

### User Stories
- [ ] US-8.1: 서브도메인 라우팅 미들웨어 (완료 ✅)
- [ ] US-8.2: 분양자별 테마 커스터마이징
- [ ] US-8.3: 분양자 도메인 설정 (예: partner1.imPD.com)
- [ ] US-8.4: 동적 콘텐츠 주입 (분양자 정보 기반)
- [ ] US-8.5: 서브도메인별 분석 및 트래킹
- [ ] US-8.6: 커스텀 도메인 연결 (CNAME)

### 기술 구현
- ✅ Next.js Middleware 서브도메인 감지
- [ ] 동적 테마 시스템 (Tailwind CSS 변수)
- [ ] Vercel 서브도메인 설정
- [ ] DNS 관리 인터페이스

**우선순위**: P2 (Medium)
**예상 기간**: 2 weeks
**의존성**: Epic 2

---

## Epic 9: 결제 및 구독 관리
**목표**: 분양 플랜 결제 및 구독 라이프사이클 관리

### User Stories
- [ ] US-9.1: 구독 플랜 정의 (Basic/Premium/Enterprise)
- [ ] US-9.2: 결제 게이트웨이 통합 (TossPayments, Stripe)
- [ ] US-9.3: 구독 시작/갱신/취소 워크플로우
- [ ] US-9.4: 결제 내역 및 영수증 관리
- [ ] US-9.5: 무료 체험 기간 (14일 Trial)
- [ ] US-9.6: 플랜 업그레이드/다운그레이드
- [ ] US-9.7: 자동 결제 실패 알림

### 데이터베이스 스키마
- [ ] `subscription_plans` 테이블
- [ ] `payments` 테이블
- [ ] `invoices` 테이블
- [ ] Distributor 테이블에 `subscription_status` 추가

### 결제 게이트웨이
- [ ] TossPayments API 통합
- [ ] Stripe Checkout 통합 (글로벌 확장 시)
- [ ] Webhook 처리 (결제 완료, 실패, 환불)

**우선순위**: P1 (High) - 수익 모델 핵심
**예상 기간**: 3 weeks
**의존성**: Epic 2

---

## Epic 10: 알림 및 커뮤니케이션 시스템
**목표**: 실시간 알림 및 이메일/SMS 커뮤니케이션

### User Stories
- [ ] US-10.1: 인앱 알림 시스템 (신규 문의, 승인 요청)
- [ ] US-10.2: 이메일 알림 (수요자 승인/거부, 결제 완료)
- [ ] US-10.3: SMS 알림 (선택 사항)
- [ ] US-10.4: 알림 설정 관리 (사용자별 on/off)
- [ ] US-10.5: 알림 히스토리 조회
- [ ] US-10.6: 이메일 템플릿 관리
- [ ] US-10.7: Slack/Discord 웹훅 통합

### 기술 스택
- [ ] Resend 또는 SendGrid (이메일)
- [ ] AWS SNS (SMS, 선택 사항)
- [ ] Pusher 또는 Socket.io (실시간 알림)
- [ ] React Query Invalidation (실시간 UI 업데이트)

**우선순위**: P2 (Medium)
**예상 기간**: 2 weeks
**의존성**: Epic 2, Epic 9

---

## Epic 11: SEO 및 퍼포먼스 최적화
**목표**: 검색 엔진 최적화 및 로딩 속도 개선

### User Stories
- [ ] US-11.1: 모든 페이지 메타 태그 최적화
- [ ] US-11.2: Open Graph 및 Twitter Card 설정
- [ ] US-11.3: Sitemap 자동 생성
- [ ] US-11.4: 구조화된 데이터 (Schema.org JSON-LD)
- [ ] US-11.5: 이미지 최적화 (Next.js Image, WebP)
- [ ] US-11.6: 코드 스플리팅 및 번들 사이즈 최적화
- [ ] US-11.7: ISR (Incremental Static Regeneration) 적용
- [ ] US-11.8: Lighthouse 점수 90+ 달성

### 성능 목표
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- SEO Score: 90+

**우선순위**: P2 (Medium)
**예상 기간**: 1.5 weeks
**의존성**: Epic 6

---

## Epic 12: 모바일 최적화 및 PWA
**목표**: 모바일 우선 반응형 디자인 및 PWA 구현

### User Stories
- [ ] US-12.1: 모든 페이지 모바일 반응형 검증
- [ ] US-12.2: 터치 제스처 최적화
- [ ] US-12.3: PWA 매니페스트 설정
- [ ] US-12.4: 오프라인 지원 (Service Worker)
- [ ] US-12.5: 홈 화면에 추가 기능
- [ ] US-12.6: 푸시 알림 (모바일)
- [ ] US-12.7: 모바일 네비게이션 개선

### 기술 구현
- [ ] Next.js PWA 플러그인
- [ ] Tailwind CSS 반응형 클래스 검증
- [ ] Chrome/Safari 모바일 테스트

**우선순위**: P3 (Low)
**예상 기간**: 1 week
**의존성**: Epic 11

---

## Epic 13: 관리자 도구 및 유틸리티
**목표**: 시스템 관리 및 유지보수를 위한 도구

### User Stories
- [ ] US-13.1: 데이터베이스 백업 자동화
- [ ] US-13.2: 시스템 로그 뷰어
- [ ] US-13.3: 에러 모니터링 (Sentry 통합)
- [ ] US-13.4: 성능 모니터링 (Vercel Analytics)
- [ ] US-13.5: API 사용량 제한 (Rate Limiting)
- [ ] US-13.6: 대량 데이터 임포트/엑스포트
- [ ] US-13.7: 시스템 설정 관리 (Settings 테이블)

### 데이터베이스 스키마
- ✅ `settings` 테이블
- [ ] `system_logs` 테이블
- [ ] `api_rate_limits` 테이블

**우선순위**: P3 (Low)
**예상 기간**: 1.5 weeks
**의존성**: 없음

---

## Epic 14: 테스트 및 품질 보증 ✅
**목표**: 안정적이고 버그 없는 시스템 보장
**상태**: ✅ 완료 (2025-12-02)

### User Stories
- [x] US-14.1: 단위 테스트 (Jest, Vitest) ✅
- [x] US-14.2: 통합 테스트 (API 엔드포인트) ✅
- [x] US-14.3: E2E 테스트 (Playwright, Cypress) ✅
- [x] US-14.4: 접근성 테스트 (WCAG 2.1 AA) ✅
- [x] US-14.5: 크로스 브라우저 테스트 (Chromium 완료, 다른 브라우저는 설정만 완료)
- [ ] US-14.6: 부하 테스트 (K6, Artillery) - 향후 추가 예정
- [x] US-14.7: CI/CD 파이프라인 구축 ✅

### 완료된 작업
- ✅ Jest 단위 테스트 프레임워크 설정
- ✅ Playwright E2E 테스트 설정
- ✅ API 통합 테스트 3개 (distributors, auth, newsletter)
- ✅ E2E 테스트 5개 스펙 파일, 30+ 시나리오
- ✅ 접근성 테스트 (axe-core, WCAG 2.1 AA)
- ✅ Lighthouse 성능 테스트 설정
- ✅ CI/CD 파이프라인 설계
- ✅ 테스트 문서화 (`EPIC_14_COMPLETE.md`)

### 테스트 커버리지 달성
- 단위 테스트: ~75% (목표: 80%)
- E2E 테스트: 5개 스펙, 30+ 시나리오
- 접근성 테스트: WCAG 2.1 AA 준수

**우선순위**: P1 (High)
**완료 기간**: 2025-12-02
**의존성**: 모든 Epic
**완료율**: 85% (6/7 완료, 1개 향후 추가)

---

## Epic 15: 문서화 및 온보딩
**목표**: 개발자와 사용자를 위한 완전한 문서 작성

### User Stories
- [ ] US-15.1: README.md 작성 (설치, 실행, 배포)
- [ ] US-15.2: API 문서 (Swagger/OpenAPI)
- [ ] US-15.3: 데이터베이스 스키마 다이어그램
- [ ] US-15.4: 아키텍처 문서 (시스템 설계)
- [ ] US-15.5: 사용자 가이드 (분양자용)
- [ ] US-15.6: 관리자 매뉴얼
- [ ] US-15.7: FAQ 및 트러블슈팅 가이드
- [ ] US-15.8: 기여 가이드 (CONTRIBUTING.md)

### 문서 형식
- Markdown (GitHub Wiki)
- Notion 또는 GitBook
- Storybook (UI 컴포넌트)

**우선순위**: P2 (Medium)
**예상 기간**: 1 week
**의존성**: 모든 Epic

---

## 우선순위 매트릭스

### Phase 1: MVP (Minimum Viable Product) - 4-6 weeks
**목표**: 핵심 분양 플랫폼 기능 구현

| Epic | Priority | Status | Dependencies |
|------|----------|--------|--------------|
| Epic 1: 인증 시스템 | P0 | 🟡 In Progress | - |
| Epic 2: 분양 플랫폼 관리 | P0 | 🟡 In Progress | Epic 1 |
| Epic 3: 리소스 관리 | P1 | ⚪ Not Started | Epic 2 |
| Epic 9: 결제 및 구독 | P1 | ⚪ Not Started | Epic 2 |

### Phase 2: Enhanced Features - 4-6 weeks
**목표**: PD 개인 관리 도구 및 분석 기능

| Epic | Priority | Status | Dependencies |
|------|----------|--------|--------------|
| Epic 4: 활동 로그 및 분석 | P1 | ⚪ Not Started | Epic 2, 3 |
| Epic 5: PD 브랜드 관리 | P1 | 🟡 In Progress | Epic 1 |
| Epic 6: CMS | P2 | ⚪ Not Started | Epic 5 |
| Epic 7: 문의 및 리드 관리 | P2 | ⚪ Not Started | Epic 5 |

### Phase 3: Scalability & Polish - 4-5 weeks
**목표**: 멀티 테넌트, 성능, 품질 개선

| Epic | Priority | Status | Dependencies |
|------|----------|--------|--------------|
| Epic 8: 서브도메인 멀티 테넌트 | P2 | 🟡 In Progress | Epic 2 |
| Epic 10: 알림 시스템 | P2 | ⚪ Not Started | Epic 2, 9 |
| Epic 11: SEO 및 성능 최적화 | P2 | ⚪ Not Started | Epic 6 |
| Epic 14: 테스트 및 QA | P1 | ✅ 완료 | All |

### Phase 4: Advanced Features - 2-3 weeks
**목표**: 고급 기능 및 문서화

| Epic | Priority | Status | Dependencies |
|------|----------|--------|--------------|
| Epic 12: PWA | P3 | ⚪ Not Started | Epic 11 |
| Epic 13: 관리자 도구 | P3 | ⚪ Not Started | - |
| Epic 15: 문서화 | P2 | ⚪ Not Started | All |

---

## 전체 타임라인

```
Month 1-2: Phase 1 (MVP)
├─ Week 1-2: Epic 1, 2 완성
├─ Week 3-4: Epic 3 구현
└─ Week 5-6: Epic 9 구현 및 MVP 테스트

Month 3-4: Phase 2 (Enhanced)
├─ Week 7-8: Epic 4, 5 구현
├─ Week 9-10: Epic 6 구현
└─ Week 11-12: Epic 7 구현 및 통합 테스트

Month 5: Phase 3 (Scalability)
├─ Week 13-14: Epic 8, 10 구현
├─ Week 15-16: Epic 11, 14 집중
└─ Week 17: 성능 튜닝 및 보안 검토

Month 6: Phase 4 (Polish & Launch)
├─ Week 18-19: Epic 12, 13 구현
├─ Week 20: Epic 15 문서화
├─ Week 21: 베타 테스트 및 버그 수정
└─ Week 22: 프로덕션 배포 및 모니터링
```

**총 예상 기간**: 5-6개월 (1인 개발 기준)
**팀 규모 확장 시**: 3-4개월로 단축 가능

---

## 현재 진행 상황 (2025-12-02)

### ✅ 완료된 작업
- Epic 1: 개발 모드 로그인, Clerk 통합 준비 완료
- Epic 2:
  - 분양 수요자 등록 폼
  - 목록 조회 API
  - 승인/거부 워크플로우
  - 대시보드 통계 카드
- Epic 5:
  - 프로필 사진 업로드 기능
- Epic 8:
  - 서브도메인 라우팅 미들웨어

### 🟡 진행 중
- Epic 2: 상세 페이지 및 수정 기능 필요
- Epic 5: SNS 연동, 칸반 보드 미구현

### ⚪ 다음 우선순위
1. Epic 9: 결제 시스템 (수익 모델 핵심)
2. Epic 3: 리소스 관리 시스템
3. Epic 4: 활동 로그 및 분석

---

## 성공 메트릭 (KPI)

### 비즈니스 메트릭
- **목표 분양자 수**: 50명 (Year 1)
- **활성 분양자 비율**: 80% 이상
- **평균 구독 유지 기간**: 12개월 이상
- **월간 반복 수익(MRR)**: ₩5,000,000

### 기술 메트릭
- **API 응답 시간**: 평균 200ms 이하
- **페이지 로딩 시간**: 2초 이하
- **가동률(Uptime)**: 99.9%
- **테스트 커버리지**: 80% 이상

### 사용자 경험 메트릭
- **분양자 온보딩 완료율**: 90% 이상
- **리소스 다운로드율**: 월 평균 5회 이상/분양자
- **고객 만족도(CSAT)**: 4.5/5 이상

---

## 리스크 및 대응 전략

### 기술 리스크
| 리스크 | 영향도 | 대응 전략 |
|--------|--------|----------|
| SQLite 성능 한계 (1000+ 사용자) | High | PostgreSQL 마이그레이션 계획 수립 |
| Vercel 무료 플랜 제약 | Medium | 초기 수익 발생 시 Pro 플랜 업그레이드 |
| 파일 저장 용량 초과 | Medium | Cloudflare R2 또는 AWS S3 통합 |
| 결제 게이트웨이 장애 | High | 여러 결제 수단 제공 (TossPayments + 무통장) |

### 비즈니스 리스크
| 리스크 | 영향도 | 대응 전략 |
|--------|--------|----------|
| 초기 분양자 유치 실패 | High | 무료 체험 기간 연장, 레퍼럴 프로그램 |
| 브랜드 콘텐츠 품질 저하 | Medium | PD 직접 콘텐츠 관리 + 품질 가이드라인 |
| 경쟁사 출현 | Medium | 차별화된 콘텐츠 및 커뮤니티 강화 |

---

## 다음 스프린트 액션 아이템

### Sprint 1 (이번 주)
1. [ ] Epic 2: 수요자 상세 페이지 구현
2. [ ] Epic 2: 수요자 정보 수정 API 및 UI
3. [ ] Epic 3: 리소스 카테고리 정의 및 DB 스키마 확정
4. [ ] Epic 14: 단위 테스트 프레임워크 설정

### Sprint 2 (다음 주)
1. [ ] Epic 3: 파일 업로드 시스템 구현
2. [ ] Epic 9: 결제 게이트웨이 조사 및 선정
3. [ ] Epic 4: 대시보드 차트 라이브러리 통합
4. [ ] Epic 15: API 문서 초안 작성

---

## Epic 16: AI 기반 콘텐츠 추천 및 자동화
**목표**: AI를 활용한 개인화 콘텐츠 추천 및 자동 생성

### User Stories
- [ ] US-16.1: 분양자 활동 패턴 기반 리소스 추천 엔진
- [ ] US-16.2: AI 기반 SNS 게시물 초안 자동 생성
- [ ] US-16.3: 교육 과정 추천 시스템 (학습 이력 기반)
- [ ] US-16.4: 챗봇 기반 FAQ 자동 응답 시스템
- [ ] US-16.5: 이미지 자동 태깅 및 카테고리 분류
- [ ] US-16.6: 콘텐츠 품질 점수 자동 평가
- [ ] US-16.7: RAG 기반 문서 검색 시스템

### 기술 스택
- OpenAI GPT-4 API / Anthropic Claude API
- Vector DB (Pinecone, Weaviate, ChromaDB)
- LangChain (RAG 구현)
- TensorFlow.js (클라이언트 사이드 추론)
- Hugging Face Transformers

### 데이터베이스 스키마
- [ ] `ai_recommendations` 테이블
- [ ] `content_embeddings` 테이블 (Vector 저장)
- [ ] `chatbot_conversations` 테이블
- [ ] `ai_generated_content` 테이블

### API 엔드포인트
- [ ] `POST /api/ai/recommend` - 개인화 추천
- [ ] `POST /api/ai/generate/post` - SNS 게시물 생성
- [ ] `POST /api/ai/chat` - 챗봇 대화
- [ ] `POST /api/ai/analyze/content` - 콘텐츠 품질 분석

**우선순위**: P2 (Medium) - 차별화 요소
**예상 기간**: 3 weeks
**의존성**: Epic 2, Epic 3, Epic 5

---

## Epic 17: 고급 분석 및 BI 대시보드
**목표**: 데이터 기반 의사결정을 위한 고급 분석 도구

### User Stories
- [ ] US-17.1: 예측 분석 (이탈 가능성 예측, 매출 예측)
- [ ] US-17.2: 코호트 분석 (가입 시기별 활동 패턴)
- [ ] US-17.3: RFM 분석 (Recency, Frequency, Monetary)
- [ ] US-17.4: A/B 테스트 프레임워크
- [ ] US-17.5: 커스텀 리포트 빌더 (드래그 앤 드롭)
- [ ] US-17.6: 데이터 엑스포트 자동화 (일/주/월 스케줄)
- [ ] US-17.7: 실시간 대시보드 (WebSocket 기반)
- [ ] US-17.8: 퍼널 분석 (전환율 추적)

### 기술 스택
- D3.js / Recharts / Apache ECharts (고급 시각화)
- Apache Superset (오픈소스 BI, 선택 사항)
- Redis (실시간 데이터 캐싱)
- WebSocket / Server-Sent Events (실시간 업데이트)
- Python (데이터 분석 스크립트, 선택 사항)

### 분석 메트릭 (고급)
- 예측 LTV (Lifetime Value)
- 이탈 위험도 스코어
- 사용자 여정 맵
- 기능별 사용률
- 수익 기여도 분석
- 시계열 이상치 탐지

### 데이터베이스 스키마
- [ ] `analytics_events` 테이블
- [ ] `cohort_analysis` 테이블
- [ ] `ab_tests` 테이블
- [ ] `custom_reports` 테이블

**우선순위**: P1 (High) - 데이터 기반 의사결정 핵심
**예상 기간**: 2.5 weeks
**의존성**: Epic 4 (활동 로그)

---

## Epic 18: 마켓플레이스 및 커뮤니티 기능
**목표**: 분양자 간 협업 및 콘텐츠 거래 플랫폼

### User Stories
- [ ] US-18.1: 분양자 간 리소스 공유 마켓플레이스
- [ ] US-18.2: 커뮤니티 포럼 (Q&A, 베스트 프랙티스 공유)
- [ ] US-18.3: 분양자 리더보드 (활동 순위, 매출 순위)
- [ ] US-18.4: 피어 투 피어 멘토링 매칭 시스템
- [ ] US-18.5: 콘텐츠 평가 및 리뷰 시스템 (5-star rating)
- [ ] US-18.6: 분양자 성공 사례 갤러리
- [ ] US-18.7: 그룹 채팅 및 DM (Direct Message) 기능
- [ ] US-18.8: 태그 및 토픽 시스템

### 데이터베이스 스키마
- [ ] `marketplace_items` 테이블
- [ ] `marketplace_transactions` 테이블
- [ ] `community_posts` 테이블
- [ ] `post_comments` 테이블
- [ ] `peer_reviews` 테이블
- [ ] `mentorship_matches` 테이블
- [ ] `chat_messages` 테이블
- [ ] `chat_rooms` 테이블

### 커뮤니티 기능
- 게시물 작성/수정/삭제
- 댓글 및 대댓글
- 좋아요/북마크
- 태그 및 검색
- 알림 시스템 연동
- 신고 및 모더레이션

**우선순위**: P2 (Medium) - 네트워크 효과 창출
**예상 기간**: 3 weeks
**의존성**: Epic 2, Epic 10 (알림 시스템)

---

## Epic 19: 모바일 앱 개발 (React Native)
**목표**: 네이티브 모바일 앱으로 접근성 강화

### User Stories
- [ ] US-19.1: React Native 프로젝트 초기 설정 (Expo)
- [ ] US-19.2: 앱 인증 및 세션 관리 (Clerk 연동)
- [ ] US-19.3: 푸시 알림 (Firebase Cloud Messaging)
- [ ] US-19.4: 오프라인 모드 (SQLite 로컬 저장)
- [ ] US-19.5: 카메라 통합 (프로필, 작품 업로드)
- [ ] US-19.6: 생체 인증 (지문, Face ID)
- [ ] US-19.7: 앱스토어/플레이스토어 배포 준비
- [ ] US-19.8: 딥링크 및 유니버설 링크 설정

### 기술 스택
- React Native + Expo
- React Native Paper / NativeBase (UI)
- Redux Toolkit / Zustand (상태 관리)
- Firebase (푸시 알림, 분석)
- React Navigation (라우팅)
- Expo Camera / Image Picker

### 주요 화면
- 로그인/회원가입
- 대시보드
- 리소스 목록 및 다운로드
- 커뮤니티 피드
- 프로필 및 설정
- 알림 센터

**우선순위**: P3 (Low) - 추가 채널
**예상 기간**: 4 weeks
**의존성**: Epic 1, Epic 2

---

## Epic 20: 다국어 및 글로벌 확장
**목표**: 해외 시장 진출을 위한 다국어 지원

### User Stories
- [ ] US-20.1: i18n 프레임워크 통합 (next-i18next)
- [ ] US-20.2: 다국어 번역 (영어, 일본어, 중국어)
- [ ] US-20.3: 지역별 콘텐츠 커스터마이징
- [ ] US-20.4: 다국어 SEO 최적화 (hreflang 태그)
- [ ] US-20.5: 통화 및 결제 수단 현지화
- [ ] US-20.6: 타임존 및 날짜 형식 로컬라이제이션
- [ ] US-20.7: 번역 관리 도구 통합 (Crowdin, Lokalise)
- [ ] US-20.8: RTL (Right-to-Left) 언어 지원 (아랍어, 히브리어)

### 지원 언어
- 한국어 (기본)
- 영어 (미국, 영국)
- 일본어
- 중국어 (간체, 번체)
- 스페인어 (선택 사항)

### 데이터베이스 스키마
- [ ] 다국어 콘텐츠 테이블 (courses_i18n, posts_i18n)
- [ ] `translations` 테이블
- [ ] 언어별 SEO 메타데이터

**우선순위**: P3 (Low) - 글로벌 확장 시
**예상 기간**: 2 weeks
**의존성**: Epic 6 (CMS)

---

## Epic 21: 고급 보안 및 컴플라이언스
**목표**: 엔터프라이즈급 보안 및 규정 준수

### User Stories
- [ ] US-21.1: 2FA (Two-Factor Authentication) - TOTP/SMS
- [ ] US-21.2: IP 화이트리스트 / 블랙리스트 관리
- [ ] US-21.3: GDPR 준수 (개인정보 삭제 요청, 데이터 다운로드)
- [ ] US-21.4: 감사 로그 (모든 중요 작업 기록 및 조회)
- [ ] US-21.5: 데이터 암호화 (at-rest, in-transit)
- [ ] US-21.6: 역할 기반 세분화 권한 (RBAC 고도화)
- [ ] US-21.7: 취약점 스캐닝 자동화 (Snyk, Dependabot)
- [ ] US-21.8: CSRF/XSS/SQL Injection 방어 강화
- [ ] US-21.9: 세션 타임아웃 및 동시 로그인 제어

### 보안 기능
- 비밀번호 정책 강화 (복잡도, 주기적 변경)
- 로그인 시도 제한 (Brute Force 방지)
- 의심스러운 활동 감지 및 알림
- API Rate Limiting (DDoS 방지)
- 민감 데이터 마스킹

### 컴플라이언스
- GDPR (유럽)
- CCPA (캘리포니아)
- 개인정보보호법 (한국)
- ISO 27001 준비

### 데이터베이스 스키마
- [ ] `audit_logs` 테이블 (모든 중요 작업)
- [ ] `security_events` 테이블
- [ ] `data_deletion_requests` 테이블
- [ ] `ip_whitelist` 테이블

**우선순위**: P1 (High) - 엔터프라이즈 고객 필수
**예상 기간**: 2.5 weeks
**의존성**: Epic 1 (인증 시스템)

---

## Epic 22: 워크플로우 자동화 및 통합
**목표**: No-code 자동화 및 외부 서비스 통합

### User Stories
- [ ] US-22.1: Zapier/Make(Integromat) 통합
- [ ] US-22.2: 커스텀 워크플로우 빌더 (Node-based UI)
- [ ] US-22.3: CRM 통합 (HubSpot, Salesforce)
- [ ] US-22.4: Google Workspace 연동 (Drive, Sheets, Calendar)
- [ ] US-22.5: Slack/Discord 봇 통합
- [ ] US-22.6: API 웹훅 관리 인터페이스
- [ ] US-22.7: 자동화 템플릿 마켓플레이스
- [ ] US-22.8: 이메일 마케팅 도구 연동 (Mailchimp, SendGrid)

### 워크플로우 예시
- "신규 분양자 승인 시 → Slack 알림 + CRM 추가 + 환영 이메일 발송"
- "리소스 다운로드 100회 달성 시 → 뱃지 부여 + 리더보드 업데이트"
- "30일 미활동 시 → 이탈 위험 알림 + 재참여 이메일 캠페인"

### 기술 스택
- React Flow / Rete.js (워크플로우 UI)
- Bull Queue / BullMQ (작업 큐)
- OAuth 2.0 (서드파티 연동)
- Temporal / Inngest (워크플로우 엔진, 고급)

### 데이터베이스 스키마
- [ ] `workflows` 테이블
- [ ] `workflow_executions` 테이블
- [ ] `integrations` 테이블
- [ ] `webhooks` 테이블

**우선순위**: P2 (Medium) - 운영 효율성
**예상 기간**: 3 weeks
**의존성**: Epic 10 (알림 시스템)

---

## Epic 23: 비디오 스트리밍 및 라이브 기능
**목표**: 자체 VOD 플랫폼 및 라이브 스트리밍

### User Stories
- [ ] US-23.1: 비디오 업로드 및 트랜스코딩 (멀티 해상도)
- [ ] US-23.2: HLS/DASH 적응형 스트리밍
- [ ] US-23.3: 라이브 스트리밍 (WebRTC)
- [ ] US-23.4: 챕터 및 자막 관리 (SRT, VTT)
- [ ] US-23.5: 시청 진도 트래킹 및 이어보기
- [ ] US-23.6: DRM 콘텐츠 보호 (Widevine, FairPlay)
- [ ] US-23.7: 인터랙티브 비디오 (퀴즈, 투표, 브랜치)
- [ ] US-23.8: 비디오 분석 (시청 시간, 완료율, 이탈 구간)

### 기술 스택
- Cloudflare Stream / Mux / AWS IVS (비디오 인프라)
- Video.js / Plyr (플레이어)
- LiveKit / Agora (WebRTC)
- AWS MediaConvert / FFmpeg (트랜스코딩)
- AWS S3 / Cloudflare R2 (저장소)

### 데이터베이스 스키마
- [ ] `videos` 테이블
- [ ] `video_chapters` 테이블
- [ ] `video_subtitles` 테이블
- [ ] `watch_history` 테이블
- [ ] `live_streams` 테이블

### 기능 세부사항
- 멀티 비트레이트 스트리밍 (360p, 720p, 1080p)
- 썸네일 자동 생성
- 비디오 플레이리스트
- 댓글 및 좋아요
- 화면 녹화 방지 (선택 사항)

**우선순위**: P2 (Medium) - Phase 2 자체 VOD 구축
**예상 기간**: 4 weeks
**의존성**: Epic 6 (CMS)

---

## Epic 24: 게이미피케이션 시스템
**목표**: 사용자 참여도 증대를 위한 게임 요소 도입

### User Stories
- [ ] US-24.1: 포인트 및 뱃지 시스템
- [ ] US-24.2: 레벨업 및 경험치 (XP) 시스템
- [ ] US-24.3: 일일 미션 및 챌린지
- [ ] US-24.4: 리더보드 (일간/주간/월간/전체)
- [ ] US-24.5: 보상 시스템 (할인 쿠폰, 특별 리소스)
- [ ] US-24.6: 소셜 공유 인센티브 (SNS 공유 시 포인트)
- [ ] US-24.7: 스트릭(연속 활동) 추적 및 보상
- [ ] US-24.8: 업적(Achievement) 시스템

### 포인트 획득 활동
- 로그인 (일일 10P)
- 리소스 다운로드 (5P)
- 커뮤니티 게시글 작성 (20P)
- 댓글 작성 (5P)
- 교육 과정 완료 (100P)
- 친구 초대 (50P)
- SNS 공유 (10P)

### 뱃지 예시
- "신규 분양자" (가입 시)
- "활동왕" (월 100회 로그인)
- "지식 공유자" (게시글 10개)
- "멘토" (멘토링 5회 완료)
- "얼리버드" (새벽 5시 로그인)

### 데이터베이스 스키마
- [ ] `user_points` 테이블
- [ ] `badges` 테이블
- [ ] `user_badges` 테이블
- [ ] `missions` 테이블
- [ ] `mission_progress` 테이블
- [ ] `rewards` 테이블
- [ ] `user_rewards` 테이블
- [ ] `achievements` 테이블

**우선순위**: P3 (Low) - 참여도 증대
**예상 기간**: 2 weeks
**의존성**: Epic 2, Epic 18 (커뮤니티)

---

## Epic 25: 엔터프라이즈 기능 및 화이트라벨
**목표**: 대규모 조직 및 재판매를 위한 고급 기능

### User Stories
- [ ] US-25.1: 화이트라벨 솔루션 (브랜딩 커스터마이징)
- [ ] US-25.2: SSO (Single Sign-On) 통합 (SAML, OAuth)
- [ ] US-25.3: 멀티 테넌트 아키텍처 고도화
- [ ] US-25.4: 조직 계층 구조 (팀, 부서, 그룹)
- [ ] US-25.5: 대량 사용자 관리 (CSV 임포트/엑스포트)
- [ ] US-25.6: SLA (Service Level Agreement) 모니터링
- [ ] US-25.7: 전용 지원 티켓 시스템
- [ ] US-25.8: 커스텀 도메인 및 SSL 인증서 관리

### 화이트라벨 커스터마이징
- 로고 및 파비콘
- 컬러 테마 (Primary, Secondary)
- 폰트 선택
- 이메일 템플릿 브랜딩
- 커스텀 footer 텍스트
- 로딩 스피너 커스터마이징

### SSO 통합
- SAML 2.0 (Okta, Azure AD)
- OAuth 2.0 (Google, Microsoft)
- LDAP (기업 디렉토리)

### 조직 관리
- 팀 생성 및 관리
- 역할별 권한 세분화
- 사용자 그룹 관리
- 부서별 리소스 할당
- 사용량 쿼터 관리

### 데이터베이스 스키마
- [ ] `organizations` 테이블
- [ ] `teams` 테이블
- [ ] `org_branding` 테이블
- [ ] `sso_configs` 테이블
- [ ] `support_tickets` 테이블
- [ ] `sla_metrics` 테이블

**우선순위**: P1 (High) - 수익 확장 핵심
**예상 기간**: 4 weeks
**의존성**: Epic 1, Epic 2, Epic 21 (보안)

---

## 고도화 Epic 우선순위 매트릭스

### Phase 5: 보안 및 분석 강화 (5-6 weeks)
**목표**: 엔터프라이즈 고객 확보 및 데이터 기반 의사결정

| Epic | Priority | 예상 기간 | 시작 조건 |
|------|----------|----------|----------|
| Epic 21: 고급 보안 | P1 | 2.5 weeks | Epic 1-3 완료 |
| Epic 17: 고급 BI 대시보드 | P1 | 2.5 weeks | Epic 4 완료 |
| Epic 25: 엔터프라이즈 기능 | P1 | 4 weeks | Epic 21 완료 |

**주요 산출물**:
- 2FA 인증 시스템
- GDPR 준수 기능
- 예측 분석 대시보드
- 화이트라벨 솔루션

---

### Phase 6: AI 및 자동화 (6-7 weeks)
**목표**: 차별화된 AI 기능 및 운영 효율성

| Epic | Priority | 예상 기간 | 시작 조건 |
|------|----------|----------|----------|
| Epic 16: AI 콘텐츠 추천 | P2 | 3 weeks | Epic 2, 3 완료 |
| Epic 22: 워크플로우 자동화 | P2 | 3 weeks | Epic 10 완료 |

**주요 산출물**:
- AI 추천 엔진
- 챗봇 시스템
- No-code 워크플로우 빌더
- 외부 서비스 통합 (Zapier, CRM)

---

### Phase 7: 콘텐츠 및 커뮤니티 확장 (7-8 weeks)
**목표**: 사용자 참여도 증대 및 자체 VOD 구축

| Epic | Priority | 예상 기간 | 시작 조건 |
|------|----------|----------|----------|
| Epic 23: 비디오 스트리밍 | P2 | 4 weeks | Epic 6 완료 |
| Epic 18: 마켓플레이스 | P2 | 3 weeks | Epic 2 완료 |

**주요 산출물**:
- 자체 VOD 플랫폼
- 라이브 스트리밍
- 커뮤니티 포럼
- 분양자 간 마켓플레이스

---

### Phase 8: 모바일 및 글로벌 (선택 사항)
**목표**: 채널 확장 및 글로벌 시장 진출

| Epic | Priority | 예상 기간 | 시작 조건 |
|------|----------|----------|----------|
| Epic 19: 모바일 앱 | P3 | 4 weeks | Epic 1-2 완료 |
| Epic 20: 다국어 지원 | P3 | 2 weeks | Epic 6 완료 |
| Epic 24: 게이미피케이션 | P3 | 2 weeks | Epic 18 완료 |

**주요 산출물**:
- React Native 앱 (iOS/Android)
- 다국어 지원 (영어, 일본어, 중국어)
- 포인트 및 뱃지 시스템

---

## 전체 타임라인 (고도화 포함)

```
Month 7-8: Phase 5 (보안 및 분석)
├─ Week 23-25: Epic 21 (고급 보안)
├─ Week 26-28: Epic 17 (BI 대시보드)
└─ Week 29-32: Epic 25 (엔터프라이즈)

Month 9-10: Phase 6 (AI 및 자동화)
├─ Week 33-35: Epic 16 (AI 추천)
└─ Week 36-38: Epic 22 (워크플로우)

Month 11-12: Phase 7 (콘텐츠 확장)
├─ Week 39-42: Epic 23 (비디오 스트리밍)
└─ Week 43-45: Epic 18 (마켓플레이스)

Month 13+ (선택): Phase 8 (모바일 및 글로벌)
├─ Epic 19: 모바일 앱 (4주)
├─ Epic 20: 다국어 (2주)
└─ Epic 24: 게이미피케이션 (2주)
```

**총 예상 기간**: 12-15개월 (MVP + 고도화 전체)
**핵심 기능 완성**: 12개월 (Epic 1-23)

---

## ROI 기준 추천 실행 순서

### Tier 1: 필수 (수익 직결) - 즉시 시작
1. **Epic 21** (고급 보안) - 엔터프라이즈 고객 확보 필수
2. **Epic 25** (엔터프라이즈 기능) - 대규모 계약 가능
3. **Epic 17** (고급 BI) - 데이터 기반 의사결정

**예상 ROI**: 300-500% (대형 고객 1-2개만 확보해도 개발 비용 회수)

### Tier 2: 차별화 (경쟁 우위) - 3개월 내
4. **Epic 16** (AI 추천) - 경쟁사 대비 차별화
5. **Epic 23** (비디오 스트리밍) - 자체 VOD로 수익 다각화
6. **Epic 22** (워크플로우 자동화) - 운영 비용 절감

**예상 ROI**: 200-300% (고객 만족도 증가 → 이탈률 감소)

### Tier 3: 성장 가속 (네트워크 효과) - 6개월 내
7. **Epic 18** (마켓플레이스) - 분양자 간 거래로 플랫폼 수수료

**예상 ROI**: 150-200% (장기적 네트워크 효과)

### Tier 4: 선택 사항 (시장 반응 후)
- Epic 19 (모바일 앱) - 모바일 사용자 비율 > 60% 시
- Epic 20 (다국어) - 해외 문의 > 20% 시
- Epic 24 (게이미피케이션) - 참여도 개선 필요 시

---

## 성공 메트릭 (KPI) - 고도화 버전

### 비즈니스 메트릭
- **목표 분양자 수**: 200명 (Year 2)
- **엔터프라이즈 고객**: 10개 조직 (Epic 25)
- **월간 반복 수익(MRR)**: ₩20,000,000
- **고객 생애 가치(LTV)**: ₩3,000,000/분양자
- **이탈률**: < 5% (월간)

### 기술 메트릭
- **AI 추천 정확도**: > 75%
- **비디오 스트리밍 품질**: 99% 버퍼링 없는 재생
- **워크플로우 자동화 성공률**: > 95%
- **모바일 앱 크래시율**: < 0.1%

### 사용자 경험 메트릭
- **AI 챗봇 만족도**: > 80%
- **비디오 완료율**: > 60%
- **커뮤니티 참여율**: > 40% (월간 활성 사용자)
- **NPS (Net Promoter Score)**: > 50

---

**문서 버전**: 2.0
**최종 업데이트**: 2025-12-03
**작성자**: Claude Code
**상태**: 🟢 Active Development (고도화 Epic 16-25 추가)
