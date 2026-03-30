'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Tenant, TenantContextValue, PlanLimits } from './types';

// 기본 테넌트 (chopd — 최PD)
const DEFAULT_TENANT: Tenant = {
  id: 1,
  name: '최범희 PD',
  slug: 'chopd',
  profession: 'pd',
  businessType: 'individual',
  plan: 'enterprise',
  status: 'active',
  region: null,
  branding: {
    logoUrl: null,
    faviconUrl: null,
    primaryColor: '#00A1E0',
    secondaryColor: '#16325C',
    fontFamily: 'Inter',
    footerText: '2026 imPD - 최범희 PD',
  },
  limits: {
    maxSnsAccounts: -1, // 무제한
    maxStorage: 53687091200, // 50GB
    maxTeamMembers: -1,
    maxCourses: -1,
    maxDistributors: -1,
    customDomain: true,
  },
  createdAt: '2024-01-01T00:00:00Z',
};

export const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  isLoading: true,
  error: null,
  isDefaultTenant: true,
  canUseFeature: () => true,
  refresh: async () => {},
});

interface TenantProviderProps {
  children: ReactNode;
  /** 서버에서 주입하거나 미들웨어에서 추출한 slug */
  initialSlug?: string;
}

export function TenantProvider({ children, initialSlug }: TenantProviderProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenant = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // slug이 없거나 chopd면 기본 테넌트 사용
      const slug = initialSlug || 'chopd';

      if (slug === 'chopd') {
        setTenant(DEFAULT_TENANT);
        setIsLoading(false);
        return;
      }

      // 다른 테넌트는 API에서 조회
      const res = await fetch(`/api/tenants/by-slug/${slug}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || '테넌트를 찾을 수 없습니다.');
      }

      const data = await res.json();
      setTenant(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '테넌트 로드 실패';
      setError(message);
      // 에러 시 기본 테넌트로 fallback
      setTenant(DEFAULT_TENANT);
    } finally {
      setIsLoading(false);
    }
  }, [initialSlug]);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  const isDefaultTenant = tenant?.slug === 'chopd' || tenant?.id === 1;

  const canUseFeature = useCallback(
    (feature: keyof PlanLimits): boolean => {
      if (!tenant) return false;
      const limit = tenant.limits[feature];
      // -1 = 무제한, boolean 체크 (customDomain)
      if (typeof limit === 'boolean') return limit;
      if (limit === -1) return true;
      return limit > 0;
    },
    [tenant]
  );

  const value: TenantContextValue = {
    tenant,
    isLoading,
    error,
    isDefaultTenant,
    canUseFeature,
    refresh: fetchTenant,
  };

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}
