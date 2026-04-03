/**
 * SocialDoctors 홍보대행(캠페인) API 클라이언트
 *
 * choi-pd에서 SocialDoctors의 캠페인 API를 통해
 * 홍보대행 요청, 실행, 리포트 조회를 수행합니다.
 *
 * 인증 방식: social-pulse-client.ts와 동일 (X-Api-Key + X-Caller-App)
 */

const SOCIAL_PULSE_BASE_URL = process.env.SOCIAL_PULSE_API_URL ?? 'https://socialdoctors.co.kr';
const SOCIAL_PULSE_API_KEY = process.env.SOCIAL_PULSE_API_KEY ?? '';
const CLIENT_SLUG = 'choi-pd';
const CLIENT_NAME = '최PD';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Api-Key': SOCIAL_PULSE_API_KEY,
    'X-Caller-App': '0008_choi-pd',
  };
}

// ── 타입 정의 ──

export type CampaignType = 'CARD_NEWS' | 'VIDEO' | 'MIXED' | 'EVENT' | 'BRAND';
export type CampaignStatus = 'DRAFT' | 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type Platform = 'FACEBOOK' | 'INSTAGRAM' | 'X' | 'THREADS' | 'TIKTOK' | 'YOUTUBE';

export interface CampaignRequestOptions {
  title: string;
  description: string;
  type: CampaignType;
  platforms: Platform[];
  budget?: number;
}

export interface Campaign {
  id: string;
  clientName: string;
  clientSlug: string;
  title: string;
  description: string;
  type: CampaignType;
  platforms: Platform[];
  budget: number | null;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignListResponse {
  campaigns: Campaign[];
  total: number;
}

export interface CampaignExecuteResult {
  success: boolean;
  campaignId: string;
  status: CampaignStatus;
  executedAt?: string;
  error?: string;
}

export interface CampaignReportMetric {
  platform: Platform;
  impressions: number;
  clicks: number;
  engagement: number;
  reach: number;
}

export interface CampaignReport {
  campaignId: string;
  title: string;
  status: CampaignStatus;
  metrics: CampaignReportMetric[];
  totalImpressions: number;
  totalClicks: number;
  totalEngagement: number;
  totalReach: number;
  generatedAt: string;
}

export interface CampaignStats {
  total: number;
  byStatus: Record<CampaignStatus, number>;
  totalBudget: number;
  totalImpressions: number;
}

// ── API 함수 ──

/**
 * 홍보대행 캠페인 요청 생성
 * clientName, clientSlug는 자동 설정됩니다.
 */
export async function requestCampaign(options: CampaignRequestOptions): Promise<Campaign & { error?: string }> {
  if (!SOCIAL_PULSE_API_KEY) {
    console.warn('[Campaign] API 키가 설정되지 않았습니다. mockMode로 동작합니다.');
    return {
      id: `mock-campaign-${Date.now()}`,
      clientName: CLIENT_NAME,
      clientSlug: CLIENT_SLUG,
      title: options.title,
      description: options.description,
      type: options.type,
      platforms: options.platforms,
      budget: options.budget ?? null,
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const res = await fetch(`${SOCIAL_PULSE_BASE_URL}/api/campaigns`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      clientName: CLIENT_NAME,
      clientSlug: CLIENT_SLUG,
      title: options.title,
      description: options.description,
      type: options.type,
      platforms: options.platforms,
      budget: options.budget,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      ...({} as Campaign),
      id: '',
      clientName: CLIENT_NAME,
      clientSlug: CLIENT_SLUG,
      title: options.title,
      description: options.description,
      type: options.type,
      platforms: options.platforms,
      budget: options.budget ?? null,
      status: 'DRAFT',
      createdAt: '',
      updatedAt: '',
      error: data.error ?? `HTTP ${res.status}`,
    };
  }

  return data as Campaign;
}

/**
 * 캠페인 목록 조회
 */
export async function listCampaigns(status?: CampaignStatus, limit?: number): Promise<CampaignListResponse> {
  if (!SOCIAL_PULSE_API_KEY) {
    return { campaigns: [], total: 0 };
  }

  const params = new URLSearchParams({ clientSlug: CLIENT_SLUG });
  if (status) params.set('status', status);
  if (limit) params.set('limit', String(limit));

  const res = await fetch(`${SOCIAL_PULSE_BASE_URL}/api/campaigns?${params}`, {
    headers: getHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) return { campaigns: [], total: 0 };

  const data = await res.json();
  return data as CampaignListResponse;
}

/**
 * 캠페인 상세 조회
 */
export async function getCampaign(id: string): Promise<Campaign | null> {
  if (!SOCIAL_PULSE_API_KEY) {
    return null;
  }

  const res = await fetch(`${SOCIAL_PULSE_BASE_URL}/api/campaigns/${id}`, {
    headers: getHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data as Campaign;
}

/**
 * 캠페인 실행 요청
 */
export async function executeCampaign(id: string): Promise<CampaignExecuteResult> {
  if (!SOCIAL_PULSE_API_KEY) {
    console.warn('[Campaign] API 키가 설정되지 않았습니다. mockMode로 동작합니다.');
    return {
      success: true,
      campaignId: id,
      status: 'IN_PROGRESS',
      executedAt: new Date().toISOString(),
    };
  }

  const res = await fetch(`${SOCIAL_PULSE_BASE_URL}/api/campaigns/${id}/execute`, {
    method: 'POST',
    headers: getHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    return { success: false, campaignId: id, status: 'REQUESTED', error: data.error ?? `HTTP ${res.status}` };
  }

  return data as CampaignExecuteResult;
}

/**
 * 캠페인 리포트 조회
 */
export async function getCampaignReport(id: string): Promise<CampaignReport | null> {
  if (!SOCIAL_PULSE_API_KEY) {
    return null;
  }

  const res = await fetch(`${SOCIAL_PULSE_BASE_URL}/api/campaigns/${id}/report`, {
    headers: getHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data as CampaignReport;
}

/**
 * 캠페인 통계 조회 (집계)
 */
export async function getCampaignStats(): Promise<CampaignStats | null> {
  if (!SOCIAL_PULSE_API_KEY) {
    return null;
  }

  const params = new URLSearchParams({ clientSlug: CLIENT_SLUG });

  const res = await fetch(`${SOCIAL_PULSE_BASE_URL}/api/campaigns/stats?${params}`, {
    headers: getHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data as CampaignStats;
}
