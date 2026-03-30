# Iteration 3 Plan — 82점 → 90+ 목표

## 병목 분석 (QA Iteration 2)

| 병목 | 현재 | 목표 | 점수 영향 |
|------|------|------|----------|
| DB tenantId | 50/78 (64%) | 78/78 (100%) | +3점 |
| API 마이그레이션 | 29/136 (21%) | 70/136 (51%+) | +4점 |
| API 인증 간극 | admin/pd 미들웨어 인증 없음 | 미들웨어에서 인증 체크 | +2점 |

## Sprint 1: DB tenantId 완성 (28개 테이블)

**비디오 계열 (8개)**: videos, videoChapters, videoSubtitles, watchHistory, liveStreams, videoComments, videoPlaylists, playlistVideos

**멤버 계열 (8개)**: members, memberModules, memberPortfolios, memberServices, memberTestimonials, memberSocialLinks, memberContactInfo, memberAnalytics (존재하면)

**조직 계열 (9개)**: organizations, organizationBranding, teams, organizationMembers, ssoConfigurations, supportTickets, supportTicketComments, slaMetrics, userBulkImportLogs

**채팅 계열 (3개)**: chatConversations, chatMessages, chatMemories (chatbotConversations와 별개인지 확인)

## Sprint 2: 핵심 API 마이그레이션 (40개 우선)

가장 빈도 높은 API 그룹 우선:
- `/api/admin/members/*` — 회원 관리
- `/api/admin/social/*` — SNS 관리
- `/api/admin/newsletter/*` — 뉴스레터
- `/api/admin/subscription-plans/*` — 구독 플랜
- `/api/pd/courses/[id]/*` — 개별 과정
- `/api/videos/*` — 비디오
- `/api/chat/*` — 채팅

## Sprint 3: 미들웨어 인증 강화

`src/middleware.ts`에서 `/api/admin/*`, `/api/pd/*` 경로에 대해:
- 세션 쿠키 또는 x-clerk-user-id 헤더 확인
- 없으면 401 반환 (dev mode 예외)

## 에이전트 투입
- backend-dev: Sprint 1 + 2 (DB + API)
- devops: Sprint 3 (미들웨어 인증)
