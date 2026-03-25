# Plan: Obsidian Memory System

> 옵시디언 CLI 기반 회원(프리랜서)별 대화 메모리 관리 시스템

## 1. 개요

### 1.1 배경
- 최PD 프로젝트는 다수의 프리랜서와 협업
- 챗봇 환경에서 나눈 대화 내용이 체계적으로 관리되지 않음
- 프리랜서 이탈 시 축적된 지식이 함께 유실됨
- 장기적으로 기업 레벨의 조직 메모리 시스템 필요

### 1.2 목표
| 목표 | 설명 | 측정 기준 |
|------|------|----------|
| 대화 기록 자동화 | 챗봇 대화가 옵시디언 vault에 회원별로 자동 기록 | 대화 100% 기록률 |
| 지식 자동 추출 | LLM이 대화에서 핵심 사실/의사결정을 분류·저장 | 추출 정확도 80%+ |
| 온보딩 자동화 | 새 프리랜서 투입 시 관련 메모리 자동 브리핑 | 온보딩 시간 50% 단축 |
| 지식 보존 | 프리랜서 이탈 시 조직 지식 자동 보존 | 핸드오프 누락률 0% |

### 1.3 범위
- **In Scope**: 옵시디언 CLI 연동, 회원별 폴더 메모리, 지식 추출 파이프라인, 온보딩/핸드오프 자동화
- **Out of Scope**: 옵시디언 GUI 플러그인 개발, 실시간 협업 편집, 모바일 앱

## 2. 사용자 스토리

### 2.1 핵심 사용자
| 사용자 | 역할 | 핵심 니즈 |
|--------|------|----------|
| 최PD (관리자) | 프로젝트 오너 | 프리랜서별 대화 이력 열람, 지식 검색, 온보딩 브리핑 생성 |
| 프리랜서 | 챗봇 사용자 | 이전 대화 맥락 유지, 프로젝트 관련 지식 참조 |
| AI 챗봇 | 시스템 | 회원별 컨텍스트 로드, 대화 저장, 지식 추출 |

### 2.2 사용자 스토리

**US-01**: 관리자로서, 프리랜서 A와 나눈 대화 기록을 날짜별로 조회하고 싶다.
**US-02**: 관리자로서, "디자인 색상 결정"과 같은 키워드로 모든 프리랜서의 관련 대화를 검색하고 싶다.
**US-03**: 관리자로서, 새 프리랜서 투입 시 해당 프로젝트의 축적된 지식을 자동 브리핑 문서로 생성하고 싶다.
**US-04**: 프리랜서로서, 챗봇에게 질문했을 때 이전 대화 맥락을 기억하고 답변받고 싶다.
**US-05**: 관리자로서, 프리랜서 계약 종료 시 개인 정보는 삭제하되 프로젝트 지식은 보존하고 싶다.

## 3. 기술 아키텍처

### 3.1 시스템 구성도

```
┌──────────────────────────────────────────────────────────────┐
│                     imPD 플랫폼                               │
│                                                               │
│  ┌─────────┐    ┌──────────────┐    ┌───────────────────┐    │
│  │ 챗봇 UI │───▶│ /api/ai/chat │───▶│ Memory Service    │    │
│  └─────────┘    └──────────────┘    │  (ai.ts 확장)     │    │
│                                      │                   │    │
│                                      │  ┌─────────────┐ │    │
│                                      │  │ 대화 저장    │ │    │
│                                      │  │ 지식 추출    │ │    │
│                                      │  │ 컨텍스트 로드│ │    │
│                                      │  └──────┬──────┘ │    │
│                                      └─────────┼────────┘    │
│                                                │              │
└────────────────────────────────────────────────┼──────────────┘
                                                 │
                                     ┌───────────▼───────────┐
                                     │  Obsidian CLI Layer   │
                                     │  (obsidian-cli 패키지) │
                                     └───────────┬───────────┘
                                                 │
                                     ┌───────────▼───────────┐
                                     │  Obsidian Vault       │
                                     │  (파일시스템 직접 I/O) │
                                     │                       │
                                     │  📁 _system/          │
                                     │  📁 organization/     │
                                     │  📁 members/          │
                                     │    📁 {member-id}/    │
                                     │      📁 conversations/│
                                     │      📁 knowledge/    │
                                     │      📁 decisions/    │
                                     │  📁 projects/         │
                                     └───────────────────────┘
```

### 3.2 핵심 컴포넌트

#### A. Obsidian CLI Layer (`src/lib/obsidian/`)
옵시디언 vault를 파일시스템 I/O로 직접 관리하는 CLI 레이어.
옵시디언 앱 실행 불필요 — 마크다운 파일 직접 읽기/쓰기.

```
src/lib/obsidian/
├── client.ts          ← Vault 경로 설정, 파일 CRUD
├── templates.ts       ← 대화/지식/프로필 마크다운 템플릿
├── search.ts          ← 전문 검색 + frontmatter 필터링
└── types.ts           ← 타입 정의
```

**핵심 기능**:
- `writeConversation(memberId, conversation)` → 대화 기록 저장
- `writeKnowledge(memberId, knowledge)` → 추출된 지식 저장
- `getMemberContext(memberId)` → 회원 프로필 + 최근 대화 + 핵심 지식 로드
- `searchVault(query, filters)` → 전체 vault 검색
- `generateBriefing(projectId, options)` → 온보딩 브리핑 문서 생성

#### B. Knowledge Extraction Pipeline (`src/lib/obsidian/extractor.ts`)
LLM을 활용한 대화 → 지식 자동 추출.

```
대화 턴 완료
    ↓
LLM 분류 판단: "저장할 만한 정보인가?"
    ├── YES → 카테고리 분류
    │         ├── decision (의사결정)
    │         ├── expertise (전문 지식/노하우)
    │         ├── process (작업 절차)
    │         ├── issue (문제/해결 기록)
    │         └── preference (선호/스타일)
    │         → knowledge/ 폴더에 저장
    └── NO  → 대화 기록만 저장
```

#### C. Memory Service (`src/lib/obsidian/memory-service.ts`)
기존 `ai.ts`의 `processChatMessage()`를 확장하여 메모리 레이어 통합.

```typescript
// Before (현재)
processChatMessage({ message, sessionId, userId, userType })
  → FAQ 매칭 or AI 응답

// After (확장)
processChatMessage({ message, sessionId, userId, userType })
  → 1. getMemberContext(userId)  // 이전 맥락 로드
  → 2. FAQ 매칭 or AI 응답 (맥락 포함)
  → 3. writeConversation(userId, conversation)  // 대화 저장
  → 4. extractKnowledge(conversation)  // 지식 추출 (비동기)
```

### 3.3 Vault 폴더 구조

```
📁 imPD-Memory-Vault/
├── 📁 _system/
│   ├── config.md                ← vault 설정 (경로, 기본값)
│   └── 📁 templates/
│       ├── conversation.md      ← 대화 기록 템플릿
│       ├── knowledge.md         ← 지식 항목 템플릿
│       ├── profile.md           ← 회원 프로필 템플릿
│       └── briefing.md          ← 온보딩 브리핑 템플릿
│
├── 📁 organization/             ← 조직 공통 지식
│   ├── brand-guidelines.md
│   ├── project-standards.md
│   └── onboarding-checklist.md
│
├── 📁 members/                  ← 회원별 폴더 (핵심)
│   └── 📁 {member-slug}/
│       ├── profile.md           ← YAML frontmatter로 메타데이터
│       ├── 📁 conversations/    ← 날짜별 대화 기록
│       │   └── YYYY-MM-DD-{topic}.md
│       ├── 📁 knowledge/        ← 추출된 지식
│       │   └── {category}-{topic}.md
│       └── 📁 decisions/        ← 의사결정 기록
│           └── YYYY-MM-DD-{decision}.md
│
└── 📁 projects/                 ← 프로젝트별 공유 지식
    └── 📁 {project-slug}/
        ├── overview.md
        ├── architecture-decisions.md
        └── lessons-learned.md
```

### 3.4 데이터 모델 (Frontmatter)

#### 회원 프로필 (`profile.md`)
```yaml
---
id: "member_001"
name: "김디자이너"
role: "UI/UX 디자이너"
type: "freelancer"          # freelancer | employee | partner
status: "active"            # active | inactive | archived
projects: ["choi-pd-ecosystem"]
tags: ["design", "figma", "branding"]
created: 2026-03-25
last_conversation: 2026-03-25
total_conversations: 15
total_knowledge_items: 8
---
```

#### 대화 기록 (`conversations/YYYY-MM-DD-{topic}.md`)
```yaml
---
member_id: "member_001"
session_id: "sess_abc123"
date: 2026-03-25
topic: "로고 디자인 논의"
tags: ["design", "logo", "branding"]
knowledge_extracted: true
related: ["knowledge/expertise-design-preferences.md"]
---
```

#### 지식 항목 (`knowledge/{category}-{topic}.md`)
```yaml
---
member_id: "member_001"
category: "expertise"       # decision | expertise | process | issue | preference
confidence: 0.92
source_conversation: "conversations/2026-03-25-로고디자인.md"
created: 2026-03-25
valid_until: null            # null = 영구, 날짜 = 만료
supersedes: null             # 이전 버전 대체 시 링크
tags: ["design", "color"]
---
```

## 4. 구현 단계 (3단계 로드맵)

### 4.1 Phase 1: 옵시디언 CLI 연동 + 대화 기록 (MVP)
**기간**: 2-3일 | **우선순위**: 높음

| 항목 | 작업 | 파일 |
|------|------|------|
| 1-1 | Obsidian CLI 클라이언트 구현 | `src/lib/obsidian/client.ts` |
| 1-2 | 마크다운 템플릿 시스템 | `src/lib/obsidian/templates.ts` |
| 1-3 | Vault 초기화 스크립트 | `scripts/init-vault.ts` |
| 1-4 | `/api/ai/chat` 확장 — 대화 저장 연동 | `src/app/api/ai/chat/route.ts` |
| 1-5 | 회원 프로필 자동 생성 | `src/lib/obsidian/client.ts` |
| 1-6 | 기본 검색 기능 | `src/lib/obsidian/search.ts` |

**완료 기준**: 챗봇 대화 시 회원별 폴더에 .md 파일 자동 생성

### 4.2 Phase 2: 지식 자동 추출 파이프라인
**기간**: 3-4일 | **우선순위**: 중간

| 항목 | 작업 | 파일 |
|------|------|------|
| 2-1 | Knowledge Extractor 구현 | `src/lib/obsidian/extractor.ts` |
| 2-2 | LLM 기반 분류 프롬프트 설계 | `src/lib/obsidian/prompts.ts` |
| 2-3 | 비동기 추출 큐 | `src/lib/obsidian/queue.ts` |
| 2-4 | 지식 중복/충돌 감지 | `src/lib/obsidian/dedup.ts` |
| 2-5 | 관리자 대시보드 — 추출된 지식 리뷰 UI | `src/app/admin/knowledge/page.tsx` |
| 2-6 | `/api/admin/knowledge` API | `src/app/api/admin/knowledge/route.ts` |

**완료 기준**: 대화 후 자동으로 분류된 지식 항목 생성, 관리자 리뷰 가능

### 4.3 Phase 3: 온보딩/핸드오프 자동화
**기간**: 2-3일 | **우선순위**: 중간

| 항목 | 작업 | 파일 |
|------|------|------|
| 3-1 | 온보딩 브리핑 생성기 | `src/lib/obsidian/briefing.ts` |
| 3-2 | 프로젝트별 지식 집계 | `src/lib/obsidian/aggregator.ts` |
| 3-3 | 핸드오프 처리 (개인정보 삭제 + 지식 보존) | `src/lib/obsidian/handoff.ts` |
| 3-4 | 브리핑 UI 페이지 | `src/app/admin/briefing/page.tsx` |
| 3-5 | 지식 만료/감쇠 관리 | `src/lib/obsidian/lifecycle.ts` |

**완료 기준**: 새 프리랜서 투입 시 1클릭 브리핑 생성, 이탈 시 자동 핸드오프

## 5. 기술 스택 결정

| 항목 | 선택 | 이유 |
|------|------|------|
| Vault 접근 | 파일시스템 직접 I/O (`fs/promises`) | 옵시디언 앱 실행 불필요, CLI 환경 최적화 |
| 마크다운 파싱 | `gray-matter` + `remark` | YAML frontmatter 파싱 + 마크다운 처리 |
| 전문 검색 | `minisearch` 또는 `flexsearch` | 경량 인메모리 검색, SQLite 보조 |
| 지식 추출 LLM | 기존 `ai.ts`의 `callAIModel()` 활용 | 추가 의존성 없음 |
| 임베딩/시맨틱 검색 | 기존 `contentEmbeddings` 테이블 활용 | Phase 2에서 지식 항목에 임베딩 추가 |

## 6. 기존 코드 연동 포인트

| 기존 코드 | 연동 방식 |
|-----------|----------|
| `src/lib/ai.ts` → `processChatMessage()` | 메모리 저장/로드 훅 추가 |
| `src/lib/db/schema.ts` → `chatbotConversations` | vault 파일 경로를 metadata에 저장 |
| `src/app/api/ai/chat/route.ts` | 응답 후 비동기 메모리 저장 트리거 |
| `src/lib/db/schema.ts` → `contentEmbeddings` | 지식 항목 임베딩 저장 |
| `src/app/admin/distributors/` | 회원 프로필과 분양사 데이터 연계 |

## 7. 리스크 및 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Vault 파일이 많아지면 검색 성능 저하 | 중간 | 인덱스 캐시 + SQLite 보조 인덱스 |
| LLM 지식 추출 정확도 불안정 | 높음 | 관리자 리뷰 UI로 검수 단계 추가 |
| 동시 파일 쓰기 충돌 | 낮음 | 파일 잠금 + 큐 기반 순차 쓰기 |
| 개인정보 보호 (프리랜서 데이터) | 높음 | 핸드오프 시 개인정보 자동 삭제 정책 |
| Vault 백업 누락 | 중간 | git 연동으로 vault 자동 버전 관리 |

## 8. 성공 지표 (KPI)

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 대화 기록률 | 100% | 챗봇 대화 수 vs vault 파일 수 |
| 지식 추출 정확도 | 80%+ | 관리자 리뷰 승인률 |
| 온보딩 시간 단축 | 50% | 브리핑 문서 활용 전/후 비교 |
| 지식 검색 성공률 | 90%+ | 검색 쿼리 대비 유효 결과 비율 |
| Vault 응답 시간 | < 500ms | 파일 읽기/쓰기 레이턴시 |

## 9. Superpowers 관점 의견

### 아키텍처 품질
- **강점**: 파일시스템 기반이므로 벤더 잠금 없음, 마크다운이라 이식성 최고
- **주의점**: 파일 I/O 기반이므로 동시성 제어가 중요 — 큐 기반 쓰기 패턴 필수
- **권장**: `gray-matter`로 frontmatter 파싱을 표준화하고, 모든 vault 접근을 `client.ts` 단일 진입점으로 통제

### 테스트 전략
- Phase 1 완료 후 통합 테스트: 챗봇 → vault 파일 생성 E2E 검증
- Knowledge Extractor는 프롬프트 품질이 핵심 — 골든 데이터셋으로 정확도 벤치마크
- 파일시스템 모킹으로 단위 테스트 가능 (`memfs` 또는 임시 디렉토리)

### 확장성 고려
- 현재 SQLite 기반 프로젝트에 적합한 파일 I/O 방식
- 향후 기업 확장 시 vault를 S3/GCS로 마이그레이션하거나, DB 기반 메모리로 전환 가능
- MCP 서버 래핑은 Phase 3 이후 선택사항으로 남겨둠

## 10. bkit 관점 의견

### PDCA 연계
- 이 기능은 **Dynamic 레벨** 프로젝트에 해당 (챗봇 + 파일 I/O + LLM 연동)
- Phase 1(MVP) 완료 후 즉시 gap-detector로 설계-구현 일치율 검증 권장
- 지식 추출 파이프라인(Phase 2)은 별도 PDCA 사이클로 분리하는 것도 고려

### 기존 인프라 활용도
- `chatbotConversations` 테이블, `ai.ts`, `/api/ai/chat` 등 **기존 AI 인프라가 80% 준비**되어 있음
- 신규 코드는 `src/lib/obsidian/` 디렉토리에 격리하여 기존 코드 영향 최소화
- `callAIModel()`이 현재 mock 상태 — Phase 2 시작 전에 실제 API 키 연동 필요

### 개발 파이프라인 매핑
| 파이프라인 단계 | 이 기능에서의 작업 |
|----------------|-------------------|
| Phase 1 (Schema) | vault frontmatter 구조 정의 ✅ (이 문서에서 완료) |
| Phase 4 (API) | `/api/ai/chat` 확장, `/api/admin/knowledge` 신규 |
| Phase 6 (UI) | 관리자 지식 리뷰 UI, 브리핑 UI |
| Phase 8 (Review) | gap-detector로 설계-구현 검증 |
