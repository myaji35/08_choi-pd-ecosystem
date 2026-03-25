/**
 * Obsidian Memory System - Vault Search
 * frontmatter 파싱 + 전문 검색
 */

import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { VaultSearchOptions, VaultSearchResult } from './types';

export class VaultSearch {
  constructor(private basePath: string) {}

  async search(options: VaultSearchOptions): Promise<VaultSearchResult[]> {
    const { query, memberId, category, dateFrom, dateTo, limit = 20 } = options;
    const results: VaultSearchResult[] = [];

    // 검색 범위 결정
    const searchDir = memberId
      ? path.join(this.basePath, 'members', memberId)
      : this.basePath;

    let files: string[];
    try {
      files = await this.walkDir(searchDir);
    } catch {
      return [];
    }

    const queryLower = query.toLowerCase();

    for (const filePath of files) {
      if (!filePath.endsWith('.md')) continue;

      try {
        const raw = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter, content: body } = matter(raw);

        // frontmatter 필터
        if (category && frontmatter.category !== category) continue;
        if (dateFrom && frontmatter.date && frontmatter.date < dateFrom)
          continue;
        if (dateTo && frontmatter.date && frontmatter.date > dateTo)
          continue;

        // 전문 검색 (키워드 매칭)
        const bodyLower = body.toLowerCase();
        if (!bodyLower.includes(queryLower)) continue;

        // 스코어 계산
        const occurrences = bodyLower.split(queryLower).length - 1;
        const score = occurrences / Math.max(body.length / 100, 1);

        // excerpt 추출
        const idx = bodyLower.indexOf(queryLower);
        const start = Math.max(0, idx - 50);
        const end = Math.min(body.length, idx + queryLower.length + 50);
        const excerpt = body.slice(start, end).replace(/\n/g, ' ');

        results.push({
          filePath: path.relative(this.basePath, filePath),
          score,
          excerpt: `...${excerpt}...`,
          frontmatter,
        });
      } catch {
        // 개별 파일 오류 무시
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  private async walkDir(dir: string): Promise<string[]> {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return [];
    }

    const files: string[] = [];
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await this.walkDir(fullPath)));
      } else {
        files.push(fullPath);
      }
    }
    return files;
  }
}
