# Member Chatbot + Long-term Memory Design

## Overview

회원별 AI 챗봇. 텍스트 대화에서 활동 정보(날짜/장소/카테고리)를 자동 추출하여 롱텀 메모리에 저장. 사진은 갤러리용으로 저장만 하고 AI 분석하지 않음.

## Architecture

```
[Chat UI] → POST /api/chat/messages
              ├─ 사진 있으면 → /api/chat/upload → 파일 저장
              ├─ 최근 기억 N건 로드 (컨텍스트)
              ├─ GPT-4o-mini 호출 (텍스트만)
              │    ├─ 대화 응답 (friendly)
              │    └─ 구조화 데이터 추출 (JSON)
              ├─ chat_messages에 저장
              └─ 활동 감지 시 → member_memories에 저장
```

## Database Schema

### chat_conversations
```
id          INTEGER PK AUTO
memberId    INTEGER FK → members NOT NULL
title       TEXT (AI 자동 생성, nullable)
createdAt   TIMESTAMP DEFAULT NOW
updatedAt   TIMESTAMP DEFAULT NOW
```

### chat_messages
```
id              INTEGER PK AUTO
conversationId  INTEGER FK → chat_conversations NOT NULL
role            TEXT ('user' | 'assistant') NOT NULL
content         TEXT NOT NULL
imageUrls       TEXT (JSON array, nullable)
createdAt       TIMESTAMP DEFAULT NOW
```

### member_memories
```
id              INTEGER PK AUTO
memberId        INTEGER FK → members NOT NULL
type            TEXT ('activity' | 'note' | 'preference') DEFAULT 'activity'
date            TEXT (YYYY-MM-DD, nullable)
location        TEXT (nullable)
category        TEXT ('education' | 'media' | 'meeting' | 'event' | 'other') DEFAULT 'other'
summary         TEXT NOT NULL
detail          TEXT (nullable)
imageUrls       TEXT (JSON array, nullable)
sourceMessageId INTEGER FK → chat_messages (nullable)
createdAt       TIMESTAMP DEFAULT NOW
```

### member_uploads
```
id          INTEGER PK AUTO
memberId    INTEGER FK → members NOT NULL
filename    TEXT NOT NULL
storagePath TEXT NOT NULL
fileSize    INTEGER NOT NULL
mimeType    TEXT NOT NULL
createdAt   TIMESTAMP DEFAULT NOW
```

## API Endpoints

### Conversations
- `GET /api/chat/conversations` — 회원의 대화 목록 (세션 쿠키 인증)
- `POST /api/chat/conversations` — 새 대화 생성

### Messages
- `GET /api/chat/conversations/[id]/messages` — 대화 메시지 조회
- `POST /api/chat/messages` — 메시지 전송 + AI 응답 반환
  - Body: `{ conversationId, content, imageUrls? }`
  - Response: `{ userMessage, assistantMessage, memory? }`

### Upload
- `POST /api/chat/upload` — 사진 업로드
  - FormData: `file` (image/*)
  - Response: `{ url, filename }`
  - 저장 경로: `public/uploads/members/{memberId}/{timestamp}_{filename}`

### Memories
- `GET /api/chat/memories` — 회원 기억 조회
  - Query: `?q=검색어&month=2026-03&category=education`
- `GET /api/chat/memories/search` — 자연어 기억 검색

## AI Integration

- Provider: OpenAI GPT-4o-mini
- Env: `OPENAI_API_KEY`
- System prompt: 활동 기록 비서 역할, JSON 추출 지시
- Context: 최근 기억 20건을 system message에 포함
- Response format: 대화 응답 + optional structured data

### AI Response Format
```json
{
  "reply": "기록했습니다! 오늘 강남역에서 특강하셨군요. 이번 달 3번째네요.",
  "memory": {
    "date": "2026-03-26",
    "location": "강남역 세미나실",
    "category": "education",
    "summary": "스마트폰 창업 특강 진행"
  }
}
```
`memory`가 null이면 일반 대화 (기억 저장 안 함).

## Pages

### /chopd/chat
- 좌측: 대화 목록 (최신순)
- 우측: 채팅창 (카카오톡 스타일)
- 하단: 텍스트 입력 + 사진 첨부 버튼
- 모바일: 대화 목록 → 채팅창 전환

### /chopd/chat/memories
- 타임라인 뷰 (날짜 기준 그룹핑)
- 카드: 날짜, 장소, 카테고리 배지, 요약, 썸네일
- 필터: 카테고리별, 월별

## Auth
- 기존 JWT 세션 쿠키 사용 (impd_session)
- 모든 API에서 memberId 검증 → 타 회원 데이터 접근 불가

## File Storage
- 로컬 파일 시스템: `public/uploads/members/{memberId}/`
- 이미지 리사이즈 없음 (MVP)
- 향후: S3/GCS 전환 가능

## Tech Stack
- OpenAI SDK: `openai` npm package
- UI: shadcn/ui components (Button, Input, Card, ScrollArea, Dialog)
- State: React useState/useEffect (Zustand 불필요)
