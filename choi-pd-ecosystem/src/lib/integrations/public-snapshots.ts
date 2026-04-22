/**
 * 공개 페이지(/[slug])용 통합 프로젝트 스냅샷 로더.
 *
 * 전략:
 *   1. DB에서 isPublic=true인 연결만 조회
 *   2. last_snapshot_json이 있으면 즉시 사용 (graceful degrade)
 *   3. 스냅샷이 오래됐거나 없으면 백그라운드 fetch 시도(타임아웃 짧게)
 *   4. fetch 실패해도 기존 스냅샷 반환 — 공개 페이지는 절대 500이 되지 않도록
 */

import { db } from '@/lib/db';
import {
  distributorIntegrations,
  integrationProjects,
  distributors,
  type IntegrationProject,
} from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import {
  fetchSnapshot,
  type StandardSnapshot,
} from '@/lib/integrations/fetch-snapshot';

export interface PublicIntegrationEntry {
  linkId: number;
  projectKey: string;
  projectName: string;
  projectBaseUrl: string;
  brandColor: string | null;
  logoUrl: string | null;
  externalId: string;
  externalUrl: string | null;
  role: string | null;
  snapshot: StandardSnapshot | null;
  /** 'live' = 방금 호출 성공, 'cache' = 스냅샷 캐시, 'none' = 표시할 데이터 없음 */
  source: 'live' | 'cache' | 'none';
  /** 표시용: 마지막 동기화 시각 */
  lastSyncedAt: string | null;
}

const REFRESH_STALE_MS = 5 * 60 * 1000; // 5분

function parseSnapshot(json: string | null): StandardSnapshot | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as StandardSnapshot;
  } catch {
    return null;
  }
}

/**
 * 슬러그 기준으로 해당 회원의 공개 연동 스냅샷 목록을 반환한다.
 */
export async function loadPublicIntegrations(slug: string): Promise<PublicIntegrationEntry[]> {
  if (!slug) return [];

  // 1. distributor 조회
  const [dist] = await db
    .select({ id: distributors.id })
    .from(distributors)
    .where(eq(distributors.slug, slug));
  if (!dist) return [];

  // 2. 공개 연결 + 프로젝트 조인 (isPublic && project.isEnabled)
  const rows = await db
    .select({
      link: distributorIntegrations,
      project: integrationProjects,
    })
    .from(distributorIntegrations)
    .innerJoin(integrationProjects, eq(distributorIntegrations.projectId, integrationProjects.id))
    .where(
      and(
        eq(distributorIntegrations.distributorId, dist.id),
        eq(distributorIntegrations.isPublic, true),
        eq(integrationProjects.isEnabled, true),
      ),
    );

  if (rows.length === 0) return [];

  // 3. 각 연결마다 캐시 우선, stale이면 live fetch 시도
  const results = await Promise.all(
    rows.map(async ({ link, project }) => {
      const cached = parseSnapshot(link.lastSnapshotJson);
      const lastSyncTime = link.lastSyncedAt ? new Date(link.lastSyncedAt).getTime() : 0;
      const isStale = Date.now() - lastSyncTime > REFRESH_STALE_MS;

      let snapshot: StandardSnapshot | null = cached;
      let source: 'live' | 'cache' | 'none' = cached ? 'cache' : 'none';

      if (isStale) {
        try {
          const fetched = await fetchSnapshot(
            project as IntegrationProject,
            link.externalId,
            'fetch',
          );
          if (fetched.ok && fetched.snapshot) {
            snapshot = fetched.snapshot;
            source = 'live';
            // 비동기적으로 캐시 업데이트 (응답 지연 방지)
            const now = new Date();
            await db
              .update(distributorIntegrations)
              .set({
                lastSnapshotJson: JSON.stringify(fetched.snapshot),
                lastSyncedAt: now,
                syncStatus: 'ok',
                syncError: null,
                updatedAt: now,
              })
              .where(eq(distributorIntegrations.id, link.id));
          }
        } catch {
          // 모든 예외 흡수 — graceful degrade
        }
      }

      return {
        linkId: link.id,
        projectKey: project.key,
        projectName: project.name,
        projectBaseUrl: project.baseUrl,
        brandColor: project.brandColor,
        logoUrl: project.logoUrl,
        externalId: link.externalId,
        externalUrl: link.externalUrl,
        role: link.role,
        snapshot,
        source,
        lastSyncedAt: link.lastSyncedAt ? new Date(link.lastSyncedAt).toISOString() : null,
      } as PublicIntegrationEntry;
    }),
  );

  // 4. 표시할 데이터가 전혀 없는 항목은 제외
  return results.filter((r) => r.snapshot !== null);
}
