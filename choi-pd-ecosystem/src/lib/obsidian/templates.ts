/**
 * Obsidian Memory System - Markdown Templates
 * YAML frontmatter + 마크다운 렌더링
 */

import type { MemberProfile, ConversationEntry, KnowledgeItem } from './types';

export function renderProfile(profile: MemberProfile): string {
  return `---
id: "${profile.id}"
name: "${profile.name}"
role: "${profile.role}"
type: "${profile.type}"
status: "${profile.status}"
projects: ${JSON.stringify(profile.projects)}
tags: ${JSON.stringify(profile.tags)}
created: ${profile.created}
lastConversation: ${profile.lastConversation}
totalConversations: ${profile.totalConversations}
totalKnowledgeItems: ${profile.totalKnowledgeItems}
---

## ${profile.name}

- **역할**: ${profile.role}
- **유형**: ${profile.type}
- **상태**: ${profile.status}
- **프로젝트**: ${profile.projects.join(', ') || '없음'}
`;
}

export function renderConversation(entry: ConversationEntry): string {
  const frontmatter = `---
member_id: "${entry.memberId}"
session_id: "${entry.sessionId}"
date: ${entry.date}
topic: "${entry.topic}"
tags: ${JSON.stringify(entry.tags)}
knowledge_extracted: ${entry.knowledgeExtracted}
related: ${JSON.stringify(entry.relatedKnowledge)}
---`;

  const messages = entry.messages
    .map((m) => {
      const roleLabel = m.role === 'user' ? '**사용자**' : '**AI**';
      return `${roleLabel} (${m.timestamp}):\n${m.content}`;
    })
    .join('\n\n---\n\n');

  return `${frontmatter}\n\n# ${entry.topic}\n\n${messages}\n`;
}

export function renderKnowledge(item: KnowledgeItem): string {
  return `---
member_id: "${item.memberId}"
category: "${item.category}"
confidence: ${item.confidence}
source_conversation: "${item.sourceConversation}"
created: ${item.created}
valid_until: ${item.validUntil ? `"${item.validUntil}"` : 'null'}
supersedes: ${item.supersedes ? `"${item.supersedes}"` : 'null'}
tags: ${JSON.stringify(item.tags)}
review_status: "${item.reviewStatus}"
---

# ${item.title}

${item.content}
`;
}

export function renderConversationAppend(
  role: 'user' | 'assistant',
  content: string,
  timestamp: string
): string {
  const roleLabel = role === 'user' ? '**사용자**' : '**AI**';
  return `\n---\n\n${roleLabel} (${timestamp}):\n${content}\n`;
}
