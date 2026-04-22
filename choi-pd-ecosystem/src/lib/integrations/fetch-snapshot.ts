/**
 * 통합 연동 스냅샷 페처 — 표준 스펙 준수 프로젝트 호출 + 어댑터 폴백.
 * docs/integration-contract.md v1 참조.
 */

import { db } from '@/lib/db';
import { integrationSyncLog, type IntegrationProject } from '@/lib/db/schema';
import { decryptData } from '@/lib/workflows';

export interface StandardKpi {
  key: string;
  label: string;
  value: number;
  unit?: string | null;
}

export interface StandardRecentItem {
  id: string;
  title: string;
  url: string;
  type?: string | null;
  thumbnail?: string | null;
  publishedAt?: string | null;
}

export interface StandardSnapshot {
  externalId: string;
  displayName: string;
  role?: string | null;
  profileUrl: string;
  publicUrl?: string | null;
  kpis: StandardKpi[];
  recentItems: StandardRecentItem[];
  lastActivityAt: string;
}

export interface FetchResult {
  ok: boolean;
  status: number;
  snapshot?: StandardSnapshot;
  error?: string;
  durationMs: number;
  raw?: string;
}

function authHeaders(project: IntegrationProject): Record<string, string> {
  if (!project.authCredential || project.authType === 'none') return {};
  let cred = project.authCredential;
  // 암호화 저장 포맷(iv:authTag:ciphertext) 인 경우 복호화
  if (/^[0-9a-f]{32}:[0-9a-f]{32}:/.test(cred)) {
    try {
      cred = decryptData(cred);
    } catch {
      return {};
    }
  }
  switch (project.authType) {
    case 'api_key':
      return { 'X-API-Key': cred };
    case 'bearer':
    case 'oauth2':
      return { Authorization: `Bearer ${cred}` };
    default:
      return {};
  }
}

function buildUrl(project: IntegrationProject, externalId: string): string {
  const base = project.apiBaseUrl || project.baseUrl;
  const template =
    project.endpointTemplate || '/api/integrations/public/{external_id}';
  const path = template.replace('{external_id}', encodeURIComponent(externalId));
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : '/' + path}`;
}

/** 표준 계약 응답을 최소한으로 검증. 누락 필드는 빈 값 채움. */
function normalize(raw: unknown, externalId: string): StandardSnapshot {
  const r = (raw || {}) as Record<string, unknown>;
  return {
    externalId: String(r.externalId || externalId),
    displayName: String(r.displayName || externalId),
    role: (r.role as string) ?? null,
    profileUrl: String(r.profileUrl || ''),
    publicUrl: (r.publicUrl as string) ?? null,
    kpis: Array.isArray(r.kpis)
      ? r.kpis.slice(0, 6).map((k) => {
          const kk = k as Record<string, unknown>;
          return {
            key: String(kk.key || ''),
            label: String(kk.label || ''),
            value: Number(kk.value || 0),
            unit: (kk.unit as string) ?? null,
          };
        })
      : [],
    recentItems: Array.isArray(r.recentItems)
      ? r.recentItems.slice(0, 10).map((it) => {
          const ii = it as Record<string, unknown>;
          return {
            id: String(ii.id || ''),
            title: String(ii.title || ''),
            url: String(ii.url || ''),
            type: (ii.type as string) ?? null,
            thumbnail: (ii.thumbnail as string) ?? null,
            publishedAt: (ii.publishedAt as string) ?? null,
          };
        })
      : [],
    lastActivityAt: String(r.lastActivityAt || new Date().toISOString()),
  };
}

/**
 * 표준 스펙 호출. 실패 시 에러 반환 + 로그.
 */
export async function fetchSnapshot(
  project: IntegrationProject,
  externalId: string,
  action: 'fetch' | 'refresh' | 'test' | 'manual',
): Promise<FetchResult> {
  const started = Date.now();
  const url = buildUrl(project, externalId);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json', ...authHeaders(project) },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const durationMs = Date.now() - started;

    const text = await res.text();
    let raw: unknown = null;
    try {
      raw = JSON.parse(text);
    } catch {
      // 응답이 JSON 아님
    }

    if (!res.ok) {
      await db.insert(integrationSyncLog).values({
        tenantId: project.tenantId ?? 1,
        projectId: project.id,
        action,
        status: 'error',
        durationMs,
        httpStatus: res.status,
        errorMessage: `HTTP ${res.status}`,
        responseSample: text.slice(0, 1024),
      });
      return {
        ok: false,
        status: res.status,
        error: `HTTP ${res.status}`,
        durationMs,
        raw: text.slice(0, 1024),
      };
    }

    const snapshot = normalize(raw, externalId);
    await db.insert(integrationSyncLog).values({
      tenantId: project.tenantId ?? 1,
      projectId: project.id,
      action,
      status: 'ok',
      durationMs,
      httpStatus: res.status,
      responseSample: text.slice(0, 1024),
    });
    return { ok: true, status: res.status, snapshot, durationMs };
  } catch (error) {
    const durationMs = Date.now() - started;
    const msg = error instanceof Error ? error.message : 'unknown';
    const isTimeout = msg.includes('abort');
    await db.insert(integrationSyncLog).values({
      tenantId: project.tenantId ?? 1,
      projectId: project.id,
      action,
      status: isTimeout ? 'timeout' : 'error',
      durationMs,
      errorMessage: msg,
    });
    return { ok: false, status: 0, error: msg, durationMs };
  }
}
