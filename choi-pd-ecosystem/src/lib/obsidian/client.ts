/**
 * Obsidian Memory System - Vault Client
 * 파일시스템 직접 I/O로 Obsidian vault 관리 (단일 진입점)
 */

import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type {
  VaultConfig,
  MemberProfile,
  ConversationEntry,
  ConversationMessage,
  KnowledgeItem,
  MemberContext,
} from './types';
import {
  renderProfile,
  renderConversation,
  renderKnowledge,
  renderConversationAppend,
} from './templates';

const DEFAULT_CONFIG: VaultConfig = {
  basePath: process.env.OBSIDIAN_VAULT_PATH || './data/obsidian-vault',
  autoCreateMember: true,
  maxConversationsPerDay: 50,
};

export class ObsidianClient {
  private config: VaultConfig;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(config?: Partial<VaultConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── 경로 헬퍼 ──────────────────────────────────

  private memberDir(memberId: string): string {
    return path.join(this.config.basePath, 'members', this.slugify(memberId));
  }

  private conversationPath(memberId: string, date: string, topic: string): string {
    const slug = this.slugify(topic);
    return path.join(
      this.memberDir(memberId),
      'conversations',
      `${date}-${slug}.md`
    );
  }

  private knowledgePath(memberId: string, category: string, title: string): string {
    const slug = this.slugify(title);
    return path.join(
      this.memberDir(memberId),
      'knowledge',
      `${category}-${slug}.md`
    );
  }

  private slugify(text: string): string {
    return text
      .replace(/[^a-zA-Z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .slice(0, 60);
  }

  // ── 큐 기반 순차 쓰기 ──────────────────────────

  private enqueueWrite<T>(fn: () => Promise<T>): Promise<T> {
    let resolve: (value: T) => void;
    let reject: (err: unknown) => void;
    const resultPromise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    this.writeQueue = this.writeQueue
      .then(() => fn().then(resolve!).catch(reject!))
      .catch(() => {});

    return resultPromise;
  }

  // ── Vault 초기화 ───────────────────────────────

  async initVault(): Promise<void> {
    const dirs = [
      '_system/templates',
      'organization',
      'members',
      'projects',
    ];
    for (const dir of dirs) {
      await fs.mkdir(path.join(this.config.basePath, dir), { recursive: true });
    }
  }

  // ── 회원 프로필 ────────────────────────────────

  async getMemberProfile(memberId: string): Promise<MemberProfile | null> {
    const profilePath = path.join(this.memberDir(memberId), 'profile.md');
    try {
      const content = await fs.readFile(profilePath, 'utf-8');
      const { data } = matter(content);
      return data as MemberProfile;
    } catch {
      return null;
    }
  }

  async createMemberProfile(profile: MemberProfile): Promise<void> {
    const dir = this.memberDir(profile.id);
    await fs.mkdir(path.join(dir, 'conversations'), { recursive: true });
    await fs.mkdir(path.join(dir, 'knowledge'), { recursive: true });
    await fs.mkdir(path.join(dir, 'decisions'), { recursive: true });

    const content = renderProfile(profile);
    await fs.writeFile(path.join(dir, 'profile.md'), content, 'utf-8');
  }

  async updateMemberProfile(
    memberId: string,
    updates: Partial<MemberProfile>
  ): Promise<void> {
    const profile = await this.getMemberProfile(memberId);
    if (!profile) return;

    const merged = { ...profile, ...updates };
    const content = renderProfile(merged);
    await fs.writeFile(
      path.join(this.memberDir(memberId), 'profile.md'),
      content,
      'utf-8'
    );
  }

  // ── 대화 기록 ──────────────────────────────────

  async writeConversation(entry: ConversationEntry): Promise<string> {
    if (this.config.autoCreateMember) {
      const exists = await this.getMemberProfile(entry.memberId);
      if (!exists) {
        await this.createMemberProfile({
          id: entry.memberId,
          name: entry.memberId,
          role: 'unknown',
          type: 'freelancer',
          status: 'active',
          projects: [],
          tags: [],
          created: new Date().toISOString().split('T')[0],
          lastConversation: entry.date,
          totalConversations: 0,
          totalKnowledgeItems: 0,
        });
      }
    }

    const filePath = this.conversationPath(
      entry.memberId,
      entry.date,
      entry.topic
    );
    const content = renderConversation(entry);

    return this.enqueueWrite(async () => {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, 'utf-8');

      const currentProfile = await this.getMemberProfile(entry.memberId);
      await this.updateMemberProfile(entry.memberId, {
        lastConversation: entry.date,
        totalConversations: (currentProfile?.totalConversations || 0) + 1,
      });

      return filePath;
    });
  }

  async appendToConversation(
    filePath: string,
    message: ConversationMessage
  ): Promise<void> {
    return this.enqueueWrite(async () => {
      const existing = await fs.readFile(filePath, 'utf-8');
      const appendText = renderConversationAppend(
        message.role as 'user' | 'assistant',
        message.content,
        message.timestamp
      );
      await fs.writeFile(filePath, existing + appendText, 'utf-8');
    });
  }

  // ── 지식 항목 ──────────────────────────────────

  async writeKnowledge(item: KnowledgeItem): Promise<string> {
    const filePath = this.knowledgePath(
      item.memberId,
      item.category,
      item.title
    );
    const content = renderKnowledge(item);

    return this.enqueueWrite(async () => {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, 'utf-8');

      const currentProfile = await this.getMemberProfile(item.memberId);
      await this.updateMemberProfile(item.memberId, {
        totalKnowledgeItems:
          (currentProfile?.totalKnowledgeItems || 0) + 1,
      });

      return filePath;
    });
  }

  // ── 회원 컨텍스트 로드 (챗봇용) ─────────────────

  async getMemberContext(memberId: string): Promise<MemberContext> {
    const profile = await this.getMemberProfile(memberId);
    if (!profile) {
      return { profile: null, recentConversations: [], keyKnowledge: [] };
    }

    // 최근 대화 5건 로드
    const convDir = path.join(this.memberDir(memberId), 'conversations');
    const recentConversations: string[] = [];
    try {
      const files = await fs.readdir(convDir);
      const mdFiles = files
        .filter((f) => f.endsWith('.md'))
        .sort()
        .reverse()
        .slice(0, 5);

      for (const file of mdFiles) {
        const content = await fs.readFile(path.join(convDir, file), 'utf-8');
        const { data } = matter(content);
        recentConversations.push(`[${data.date}] ${data.topic}`);
      }
    } catch {
      // 폴더 없으면 빈 배열
    }

    // 핵심 지식 로드
    const knowledgeDir = path.join(this.memberDir(memberId), 'knowledge');
    const keyKnowledge: string[] = [];
    try {
      const files = await fs.readdir(knowledgeDir);
      const mdFiles = files.filter((f) => f.endsWith('.md'));

      for (const file of mdFiles) {
        const content = await fs.readFile(
          path.join(knowledgeDir, file),
          'utf-8'
        );
        const { data, content: body } = matter(content);
        if (data.review_status !== 'rejected') {
          keyKnowledge.push(
            `[${data.category}] ${body.trim().slice(0, 200)}`
          );
        }
      }
    } catch {
      // 폴더 없으면 빈 배열
    }

    return { profile, recentConversations, keyKnowledge };
  }

  // ── 회원 목록 ──────────────────────────────────

  async listMembers(filter?: {
    status?: string;
  }): Promise<MemberProfile[]> {
    const membersDir = path.join(this.config.basePath, 'members');
    const profiles: MemberProfile[] = [];

    try {
      const dirs = await fs.readdir(membersDir);
      for (const dir of dirs) {
        if (dir.startsWith('.')) continue;
        const profile = await this.getMemberProfile(dir);
        if (profile) {
          if (filter?.status && profile.status !== filter.status) continue;
          profiles.push(profile);
        }
      }
    } catch {
      // members 디렉토리 없으면 빈 배열
    }

    return profiles;
  }

  // ── Vault 경로 getter ──────────────────────────

  getBasePath(): string {
    return this.config.basePath;
  }
}
