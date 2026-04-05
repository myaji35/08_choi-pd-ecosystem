import { db } from '@/lib/db';
import { enrichmentCache, enrichmentLog } from '@/lib/db/schema';
import { gravatarCollector } from './gravatar';
import { socialLookupCollector } from './social-lookup';
import type { EnrichmentCollector, EnrichmentResult } from './types';

// 수집기 목록 — 순서대로 실행, 결과는 suggestion으로 저장 (사용자 동의 필요)
const COLLECTORS: EnrichmentCollector[] = [
  gravatarCollector,      // 무료, 빠름, 합법
  socialLookupCollector,  // GitHub + 소셜 URL 탐색
];

/**
 * 회원 프로필 자동 강화 오케스트레이터
 * - 등록된 수집기를 순차 실행하고 결과를 enrichment_cache에 저장
 * - source: "uploaded", uploaded_by: "System Auto-Collection" (법적 안전장치)
 */
export async function enrichMember(
  memberId: number,
  email: string,
  name?: string,
): Promise<EnrichmentResult[]> {
  const allResults: EnrichmentResult[] = [];

  // 스캔 시작 로그
  await db.insert(enrichmentLog).values({
    memberId,
    action: 'scan_started',
    source: 'system',
    metadata: JSON.stringify({
      collectors: COLLECTORS.map((c) => c.name),
      uploaded_by: 'System Auto-Collection',
    }),
    createdAt: new Date().toISOString(),
  });

  for (const collector of COLLECTORS) {
    try {
      const data = await collector.collect(email, name);
      allResults.push(...data);

      // 각 수집 결과 로그
      if (data.length > 0) {
        await db.insert(enrichmentLog).values({
          memberId,
          action: 'data_found',
          source: collector.name,
          metadata: JSON.stringify({
            count: data.length,
            types: data.map((d) => d.dataType),
            uploaded_by: 'System Auto-Collection',
          }),
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(`[Enrichment:${collector.name}] Error:`, error);
    }
  }

  // enrichment_cache에 저장
  await saveToCache(memberId, allResults);

  return allResults;
}

/** 수집 결과를 enrichment_cache 테이블에 저장 */
async function saveToCache(memberId: number, results: EnrichmentResult[]): Promise<void> {
  const now = new Date().toISOString();
  // 30일 후 만료
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  for (const result of results) {
    try {
      await db.insert(enrichmentCache).values({
        memberId,
        source: result.source,
        dataType: result.dataType,
        value: result.value,
        confidence: result.confidence,
        isApproved: 0,
        collectedAt: now,
        expiresAt,
      });
    } catch (error) {
      console.error('[Enrichment:saveToCache] 저장 실패:', error);
    }
  }
}

export type { EnrichmentResult, EnrichmentCollector } from './types';
