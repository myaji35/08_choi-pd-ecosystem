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

## Epic 14: 테스트 및 품질 보증
**목표**: 안정적이고 버그 없는 시스템 보장

### User Stories
- [ ] US-14.1: 단위 테스트 (Jest, Vitest)
- [ ] US-14.2: 통합 테스트 (API 엔드포인트)
- [ ] US-14.3: E2E 테스트 (Playwright, Cypress)
- [ ] US-14.4: 접근성 테스트 (WCAG 2.1 AA)
- [ ] US-14.5: 크로스 브라우저 테스트
- [ ] US-14.6: 부하 테스트 (K6, Artillery)
- [ ] US-14.7: CI/CD 파이프라인 구축

### 테스트 커버리지 목표
- 단위 테스트: 80% 이상
- 통합 테스트: 핵심 API 100%
- E2E 테스트: 주요 사용자 플로우

**우선순위**: P1 (High)
**예상 기간**: 지속적 (모든 Epic과 병행)
**의존성**: 모든 Epic

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
| Epic 14: 테스트 및 QA | P1 | ⚪ Not Started | All |

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

**문서 버전**: 1.0
**최종 업데이트**: 2025-12-02
**작성자**: Claude Code
**상태**: 🟢 Active Development
