# Design: Member Auto-Enrichment (회원 프로필 자동 강화)

## 1. 기술 설계

### 1.1 Drizzle ORM 스키마

```typescript
// src/lib/db/schema.ts에 추가

export const enrichmentCache = sqliteTable('enrichment_cache', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  memberId: integer('member_id').notNull(),
  source: text('source').notNull(),           // 'gravatar' | 'github' | 'google' | 'linkedin' | 'sns_oauth'
  dataType: text('data_type').notNull(),       // 'photo_url' | 'company' | 'title' | 'skills' | 'sns_url' | 'bio' | 'location'
  value: text('value').notNull(),
  confidence: real('confidence').default(0.5), // 0.0~1.0
  isApproved: integer('is_approved').default(0), // 0=pending, 1=approved, -1=rejected
  collectedAt: text('collected_at').notNull(),
  expiresAt: text('expires_at'),               // 30일 후 만료
});

export const enrichmentLog = sqliteTable('enrichment_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  memberId: integer('member_id').notNull(),
  action: text('action').notNull(),            // 'scan_started' | 'data_found' | 'user_approved' | 'user_rejected'
  source: text('source'),
  metadata: text('metadata'),                   // JSON
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});
```

### 1.2 수집기 (Enrichment Collectors)

#### 디렉토리 구조
```
src/lib/enrichment/
  ├── index.ts           # 수집 오케스트레이터
  ├── gravatar.ts        # Gravatar API
  ├── github.ts          # GitHub API
  ├── google-search.ts   # Google Custom Search
  └── types.ts           # 공통 타입
```

#### 공통 타입
```typescript
// src/lib/enrichment/types.ts
export interface EnrichmentResult {
  source: string;
  dataType: string;
  value: string;
  confidence: number;
}

export interface EnrichmentCollector {
  name: string;
  collect(email: string, name?: string): Promise<EnrichmentResult[]>;
}
```

#### 오케스트레이터
```typescript
// src/lib/enrichment/index.ts
import { gravatarCollector } from './gravatar';
import { githubCollector } from './github';

const COLLECTORS: EnrichmentCollector[] = [
  gravatarCollector,   // P0: 무료, 빠름, 합법
  githubCollector,     // P1: 무료, 공개 API
];

export async function enrichMember(memberId: number, email: string, name?: string) {
  const results: EnrichmentResult[] = [];
  
  for (const collector of COLLECTORS) {
    try {
      const data = await collector.collect(email, name);
      results.push(...data);
    } catch (error) {
      console.error(`[Enrichment:${collector.name}] Error:`, error);
    }
  }
  
  // enrichment_cache에 저장
  await saveToCache(memberId, results);
  return results;
}
```

### 1.3 API 라우트

```
src/app/api/enrichment/
  ├── scan/route.ts          # POST: 수집 시작
  ├── suggestions/[id]/route.ts  # GET: 제안 목록
  └── approve/route.ts       # POST: 승인/거부
```

#### POST /api/enrichment/scan
```typescript
export async function POST(req: Request) {
  const { memberId } = await req.json();
  
  // 회원 정보 조회
  const member = await db.query.distributors.findFirst({
    where: eq(distributors.id, memberId)
  });
  
  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  
  // 백그라운드 수집 시작
  const results = await enrichMember(memberId, member.email, member.name);
  
  // 로그 기록
  await db.insert(enrichmentLog).values({
    memberId, action: 'scan_started', source: 'system',
    metadata: JSON.stringify({ resultCount: results.length }),
    createdAt: new Date().toISOString(),
  });
  
  return NextResponse.json({ 
    status: 'completed', 
    suggestionsCount: results.length 
  });
}
```

#### GET /api/enrichment/suggestions/:id
```typescript
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const memberId = parseInt(params.id);
  
  const suggestions = await db.select()
    .from(enrichmentCache)
    .where(and(
      eq(enrichmentCache.memberId, memberId),
      eq(enrichmentCache.isApproved, 0)  // pending만
    ))
    .orderBy(desc(enrichmentCache.confidence));
  
  return NextResponse.json({ suggestions });
}
```

#### POST /api/enrichment/approve
```typescript
export async function POST(req: Request) {
  const { memberId, approvedIds, rejectedIds } = await req.json();
  
  // 승인된 항목 → 프로필에 반영
  if (approvedIds?.length) {
    await db.update(enrichmentCache)
      .set({ isApproved: 1 })
      .where(inArray(enrichmentCache.id, approvedIds));
    
    // 실제 프로필 업데이트
    const approved = await db.select().from(enrichmentCache)
      .where(inArray(enrichmentCache.id, approvedIds));
    
    for (const item of approved) {
      await applyToProfile(memberId, item);
    }
  }
  
  // 거부된 항목 → 다시 추천하지 않음
  if (rejectedIds?.length) {
    await db.update(enrichmentCache)
      .set({ isApproved: -1 })
      .where(inArray(enrichmentCache.id, rejectedIds));
  }
  
  return NextResponse.json({ success: true });
}
```

### 1.4 UI 컴포넌트

#### EnrichmentSuggestionCard
```
src/components/enrichment/
  ├── EnrichmentSuggestionCard.tsx   # 제안 카드
  ├── EnrichmentBanner.tsx           # 프로필 페이지 상단 배너
  └── EnrichmentSettingsToggle.tsx   # 설정 ON/OFF
```

##### 디자인 (SLDS 스타일)
```
┌─────────────────────────────────────────────────┐
│ 🔍 프로필 자동 완성                              │
│ 공개 정보를 기반으로 프로필을 완성해드릴까요?      │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ ☑ 프로필 사진                   95% 신뢰도  │ │
│ │   Gravatar에서 발견                         │ │
│ ├─────────────────────────────────────────────┤ │
│ │ ☑ 직업: Full-Stack Engineer     85% 신뢰도  │ │
│ │   GitHub에서 발견                            │ │
│ ├─────────────────────────────────────────────┤ │
│ │ ☐ 기술: TypeScript, React       90% 신뢰도  │ │
│ │   GitHub 리포 분석                           │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│        [선택 항목 적용]    [건너뛰기]             │
└─────────────────────────────────────────────────┘
```

## 2. 구현 순서

### Phase 1 (즉시 구현)
1. `enrichment_cache`, `enrichment_log` 스키마 추가 → `npm run db:push`
2. `src/lib/enrichment/types.ts` — 공통 타입
3. `src/lib/enrichment/gravatar.ts` — Gravatar 수집기
4. `src/lib/enrichment/index.ts` — 오케스트레이터
5. `src/app/api/enrichment/scan/route.ts` — 수집 API
6. `src/app/api/enrichment/suggestions/[id]/route.ts` — 제안 조회
7. `src/app/api/enrichment/approve/route.ts` — 승인/거부
8. `src/components/enrichment/EnrichmentSuggestionCard.tsx` — UI

### Phase 2
9. `src/lib/enrichment/github.ts` — GitHub 수집기
10. 프로필 페이지에 EnrichmentBanner 통합

### Phase 3
11. SNS OAuth 연동 (Instagram, X)
12. 온보딩 플로우에 자동 완성 스텝 추가

## 3. 보안 체크리스트

- [ ] enrichment_cache 30일 자동 만료 구현
- [ ] 사용자 동의 UI 구현 (GDPR Article 6)
- [ ] 거부 시 재수집 차단 (isApproved = -1)
- [ ] API Rate Limit (분당 10회)
- [ ] 수집 로그 전체 기록
- [ ] source 필드: "uploaded" / uploaded_by: "System Auto-Collection"

## 4. 테스트 계획

- [ ] Gravatar 수집기 단위 테스트
- [ ] API 라우트 통합 테스트
- [ ] 승인/거부 플로우 E2E
- [ ] 만료된 캐시 정리 테스트

---

**작성일**: 2026-04-05
**상태**: Design 완료 — Do (구현) 단계 즉시 진행
