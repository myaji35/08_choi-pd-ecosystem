/**
 * Obsidian Memory System - Type Definitions
 * 회원(프리랜서)별 대화 메모리 관리를 위한 타입 정의
 */

// ============================================================
// Vault Configuration
// ============================================================

export interface VaultConfig {
  basePath: string;
  autoCreateMember: boolean;
  maxConversationsPerDay: number;
}

// ============================================================
// Member (회원/프리랜서)
// ============================================================

export interface MemberProfile {
  id: string;
  name: string;
  role: string;
  type: 'freelancer' | 'employee' | 'partner';
  status: 'active' | 'inactive' | 'archived';
  projects: string[];
  tags: string[];
  created: string;
  lastConversation: string;
  totalConversations: number;
  totalKnowledgeItems: number;
}

// ============================================================
// Conversation (대화 기록)
// ============================================================

export interface ConversationEntry {
  memberId: string;
  sessionId: string;
  date: string;
  topic: string;
  tags: string[];
  messages: ConversationMessage[];
  knowledgeExtracted: boolean;
  relatedKnowledge: string[];
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  intent?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================
// Knowledge (추출된 지식)
// ============================================================

export type KnowledgeCategory =
  | 'decision'
  | 'expertise'
  | 'process'
  | 'issue'
  | 'preference';

export interface KnowledgeItem {
  memberId: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  confidence: number;
  sourceConversation: string;
  created: string;
  validUntil: string | null;
  supersedes: string | null;
  tags: string[];
  reviewStatus: 'pending' | 'approved' | 'rejected';
}

// ============================================================
// Briefing (온보딩 브리핑) - Phase 3
// ============================================================

export interface BriefingRequest {
  projectId: string;
  targetMemberId?: string;
  includeCategories?: KnowledgeCategory[];
  maxItems?: number;
}

export interface BriefingDocument {
  projectId: string;
  generatedAt: string;
  sections: BriefingSection[];
  sourceCount: number;
}

export interface BriefingSection {
  title: string;
  category: KnowledgeCategory;
  items: KnowledgeItem[];
}

// ============================================================
// Search
// ============================================================

export interface VaultSearchOptions {
  query: string;
  memberId?: string;
  category?: KnowledgeCategory;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export interface VaultSearchResult {
  filePath: string;
  score: number;
  excerpt: string;
  frontmatter: Record<string, unknown>;
}

// ============================================================
// Member Context (챗봇용 컨텍스트)
// ============================================================

export interface MemberContext {
  profile: MemberProfile | null;
  recentConversations: string[];
  keyKnowledge: string[];
}
