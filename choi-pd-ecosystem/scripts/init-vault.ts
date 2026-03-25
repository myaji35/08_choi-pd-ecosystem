#!/usr/bin/env tsx
/**
 * Obsidian Vault 초기화 스크립트
 * 실행: npx tsx scripts/init-vault.ts [vault-path]
 */

import { ObsidianClient } from '../src/lib/obsidian/client';
import { promises as fs } from 'fs';
import path from 'path';

async function main() {
  const vaultPath = process.argv[2] || './data/obsidian-vault';

  console.log(`Initializing Obsidian vault at: ${vaultPath}`);

  const client = new ObsidianClient({ basePath: vaultPath });
  await client.initVault();

  // _system/config.md 생성
  const configContent = `---
vault_name: "imPD Memory Vault"
created: ${new Date().toISOString().split('T')[0]}
version: "1.0.0"
---

# imPD Memory Vault 설정

- **용도**: 회원(프리랜서)별 대화 메모리 관리
- **자동 생성**: 챗봇 대화 시 회원 프로필 및 대화 기록 자동 생성
`;

  await fs.writeFile(
    path.join(vaultPath, '_system', 'config.md'),
    configContent,
    'utf-8'
  );

  // organization 기본 파일
  await fs.writeFile(
    path.join(vaultPath, 'organization', 'brand-guidelines.md'),
    `---
title: "브랜드 가이드라인"
updated: ${new Date().toISOString().split('T')[0]}
---

# 브랜드 가이드라인

(조직 공통 지식을 여기에 기록)
`,
    'utf-8'
  );

  // vault 전용 .gitignore
  await fs.writeFile(
    path.join(vaultPath, '.gitignore'),
    `# 회원 대화 기록은 git에 포함하지 않음
members/*/conversations/
# 프로필은 포함 (메타데이터만)
!members/*/profile.md
`,
    'utf-8'
  );

  console.log('Vault initialized successfully!');
  console.log('  - _system/config.md');
  console.log('  - organization/brand-guidelines.md');
  console.log('  - .gitignore');
}

main().catch(console.error);
