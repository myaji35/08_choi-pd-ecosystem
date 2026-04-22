/**
 * Schema Index — 도메인별 분리된 스키마를 re-export
 * 기존 import { xxx } from '@/lib/db/schema' 호환 유지
 *
 * 도메인별 파일:
 * - tenant.ts:       테넌트, 멤버, SaaS 구독/인보이스
 * - content.ts:      코스, 포스트, 작품, 문의, 리드, 설정, 어드민, 히어로
 * - sns.ts:          SNS 계정, 예약 포스팅, 이력
 * - distribution.ts: 수요자, 활동로그, 리소스, 구독플랜, 결제, 영수증
 * - kanban.ts:       칸반 프로젝트, 컬럼, 태스크, 알림
 * - security.ts:     감사로그, 보안이벤트, GDPR, IP제어, 2FA, 세션
 * - enterprise.ts:   조직, 브랜딩, 팀, SSO, 지원티켓, SLA
 * - analytics.ts:    이벤트, 코호트, AB테스트, 퍼널, RFM
 * - ai.ts:           AI 추천, 임베딩, 챗봇, 생성콘텐츠, 태깅, FAQ
 * - automation.ts:   워크플로우, 연동, 웹훅, 템플릿
 * - video.ts:        영상, 챕터, 자막, 라이브, 댓글, 재생목록
 * - member.ts:       회원, 포트폴리오, 서비스, 포스트, 문의, 후기
 * - chat.ts:         대화, 메시지, 메모리, 업로드
 */

export * from './tenant';
export * from './content';
export * from './sns';
export * from './distribution';
export * from './kanban';
export * from './security';
export * from './enterprise';
export * from './analytics';
export * from './ai';
export * from './automation';
export * from './video';
export * from './member';
export * from './chat';
export * from './pomelli';
export * from './talent';
export * from './follower';
export * from './integration-projects';
