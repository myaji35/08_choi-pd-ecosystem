PRD(제품 요구 문서): 최범희 대표 통합 브랜드 허브
문서 버전: v1.0 작성일: 2025년 11월 8일 프로젝트 소유자: (기획 담당자) 상태: 초안

1. 개요 (Overview)
본 문서는 '1인 미디어 창업 전략가', '저자', '언론사 발행인'으로서 최범희 대표의 다층적 정체성을 통합적으로 브랜딩하고, 실제 비즈니스(교육, 컨설팅)와 사회적 활동(한국환경저널)을 지원하는 공식 브랜드 허브 웹사이트 구축을 위한 제품 요구 사항을 정의합니다.

기존 SaaS형 기획과 달리, 본 PRD는 Next.js, SQLite, shadcn/ui 등 지정된 기술 스택을 기반으로 한 맞춤형 개발을 전제로 합니다.

2. 핵심 목표 (Goals)
통합 아이덴티티 확립: '사진강사'를 넘어 '스마트폰 창업 전략가' , '저자' , '미디어 발행인' 으로 이어지는 전문성을 하나의 디지털 허브에 집약합니다.   

비즈니스 효율화: '스마트폰 창업'  교육 과정 홍보, B2B/B2G 강의 문의, VOD 판매(연동) 등 비즈니스 접점을 일원화하고 자동화합니다.   

사회적 영향력 가시화: '한국환경저널'  발행인으로서의 활동과 철학을 아카이빙하고, 관련 네트워크의 구심점 역할을 수행합니다.   

3. 대상 사용자 (Target Audience)
B2C (교육): 제2의 창업을 준비하는 5060 베이비부머 , 1인 미디어 창업 희망자, 디지털 활용이 필요한 시니어.   

B2B (비즈니스): 디지털 마케팅이 필요한 소상공인 , 임직원 교육(스마트폰 활용, 미디어 리터러시)이 필요한 기업 및 기관.   

B2G/Social: 환경 문제에 관심 있는 공공기관, NGO, 언론 매체 (한국환경저널 관련).

4. 기술 스택 (Technology Stack)
Framework: Next.js (v16+)

Language: TypeScript

Styling: Tailwind CSS

UI Components: shadcn/ui

State Management: Zustand

Database: SQLite

5. 기능 요구사항 (Functional Requirements)
FR-1. 공통 및 관리자 (Admin & Core)
Admin-1 (CMS):

SQLite DB와 연동되는 /admin 경로의 관리자 페이지를 구현합니다. (Next.js API Routes 및 미들웨어를 통한 인증 필요)

관리자는 '교육 과정', '공지사항(커뮤니티)', '작품(갤러리)', '언론 보도' 콘텐츠를 CRUD(생성, 읽기, 수정, 삭제) 할 수 있어야 합니다.

Admin-2 (Lead 관리):

'강의 문의', '뉴스레터 구독' 등 모든 폼을 통해 접수된 데이터를 관리자 페이지에서 조회하고 CSV로 내보낼 수 있어야 합니다. (데이터는 SQLite에 저장)

Core-1 (UI/UX):

shadcn/ui 컴포넌트(Buttons, Forms, Cards, Dialogs 등)를 사용하여 일관되고 접근성 높은 UI를 제공합니다.

tailwindcss를 사용한 모바일 퍼스트 반응형 디자인을 구현합니다.

FR-2. 메인 페이지 (Home)
Home-1 (Hero): 최범희 대표의 다면적 정체성(교육자, 저자, 발행인)을 시각적으로 보여주는 Hero 섹션.

Home-2 (Service Hub): 핵심 서비스('EDUCATION', 'MEDIA', 'WORKS')로 연결되는 shadcn/ui의 'Card' 컴포넌트를 활용한 퀵 링크.

Home-3 (Dynamic Feed):

'최신 교육 과정'과 '한국환경저널 주요 활동'(CMS에서 관리)을 동적으로 불러와 노출합니다.

Next.js의 ISR(Incremental Static Regeneration)을 적용하여 성능과 최신성을 확보합니다.

FR-3. 교육 (Education - 최PD의 스마트폰 연구소)
Edu-1 (과정 소개): '스마트폰 창업' 시그니처 과정  및 5060/소상공인 맞춤 과정 을 CMS 기반으로 상세히 소개합니다.   

Edu-2 (B2B/B2G 문의):

기업/기관 강의 및 컨설팅 문의를 위한 shadcn/ui 'Form' 컴포넌트를 구현합니다.

제출된 데이터는 Next.js API Route를 통해 SQLite Inquiries 테이블에 저장됩니다.

Edu-3 (VOD 연동):

온라인 VOD 과정 소개. (결제는 외부 플랫폼(예: Stripe, TossPayments) 링크 연동을 우선으로 함. sqlite는 구매 내역이 아닌 과정 정보만 관리)

Edu-4 (상태 관리):

zustand를 사용하여 교육 과정 필터링(예: '온라인', '오프라인') 상태를 관리할 수 있습니다. (선택 사항)

FR-4. 미디어 (Media - 한국환경저널)
Media-1 (소개): '한국환경저널' 창간 배경, '대한민국 최고의 환경 파수꾼' 슬로건, 100인의 전문가 네트워크를 소개하는 정적 페이지.   

Media-2 (발행인 인사말): 발행인 최범희 대표의 철학과 비전을 담은 페이지.

Media-3 (주요 활동): CMS를 통해 관리자가 직접 '주요 기사'나 '환경 활동'을 등록/관리할 수 있는 섹션. (외부 저널 사이트로 링크)

FR-5. 저작 및 활동 (Works)
Works-1 (저서): 저서 『마라도부터 백두산까지』  상세 소개(서평, 목차) 및 외부 구매 링크 제공.   

Works-2 (갤러리):

'스마트화가'로서의 모바일 스케치 및 주요 사진 작품을 전시하는 갤러리.

이미지 및 설명은 CMS를 통해 SQLite GalleryImages 테이블에서 관리됩니다.

Works-3 (언론 보도): 최범희 대표 관련 언론 보도 자료를 아카이빙 (CMS 관리).

FR-6. 커뮤니티 (Community)
Comm-1 (공지사항/소식): 신규 강의, 행사 소식 등을 CMS로 관리하는 블로그형 게시판.

Comm-2 (수강생 후기): 5060 수강생, 소상공인 창업 사례  등 텍스트/이미지 기반의 후기 (CMS 관리).   

Comm-3 (리드 수집): '스마트폰 창업 노하우' 등 자료 제공을 미끼로 한 뉴스레터 구독 폼 (shadcn/ui + SQLite 연동).

6. 비기능 요구사항 (Non-Functional Requirements)
NFR-1 (성능): Next.js의 SSR/SSG 기능을 활용하여 빠른 페이지 로드 속도(LCP)를 보장합니다.

NFR-2 (SEO): 모든 주요 페이지(교육, 저서, 미디어)는 검색 엔진에 최적화된 meta 태그와 시맨틱 마크업을 가져야 합니다.

NFR-3 (데이터 관리): SQLite 데이터베이스 파일은 백업 및 관리가 용이해야 합니다. (예: 정기적인 백업 스크립트)

NFR-4 (상태 관리): zustand를 활용하여 최소한의 보일러플레이트로 명료한 상태 관리를 지향합니다. (예: 모바일 메뉴 isOpen 상태, 폼 제출 isLoading 상태 등)

7. SQLite 데이터베이스 스키마 (초안)
Courses: (id, title, description, type, price, thumbnail_url, external_link)

Posts: (id, title, content, category, created_at, published)

Works: (id, title, description, image_url, category: 'gallery' | 'press')

Inquiries: (id, name, email, phone, message, type: 'b2b' | 'contact', created_at)

Leads: (id, email, subscribed_at)

Users: (id, username, password_hash) - 관리자 계정용

8. 상태 관리 (Zustand)
uiStore: isMobileMenuOpen (boolean), isModalOpen (boolean)

formStore: isLoading (boolean), error (string | null) - 모든 폼 제출 시 공통 사용

9. 향후 로드맵 (Future Roadmap)
(Phase 2) VOD 자체 결제 시스템 도입 (Payment Gateway 연동)

(Phase 2) 수강생 전용 커뮤니티 및 자료실 (사용자 인증 기능 확장)

(Phase 3) '한국환경저널' RSS 피드 연동 또는 API를 통한 기사 자동 임베딩