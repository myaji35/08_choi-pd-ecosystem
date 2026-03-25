/**
 * Obsidian Memory System - Public API
 */

export { ObsidianClient } from './client';
export { VaultSearch } from './search';
export {
  loadMemberContext,
  saveConversationTurn,
  endSession,
  getObsidianClient,
} from './memory-service';
export type {
  VaultConfig,
  MemberProfile,
  ConversationEntry,
  ConversationMessage,
  KnowledgeCategory,
  KnowledgeItem,
  BriefingRequest,
  BriefingDocument,
  BriefingSection,
  VaultSearchOptions,
  VaultSearchResult,
  MemberContext,
} from './types';
