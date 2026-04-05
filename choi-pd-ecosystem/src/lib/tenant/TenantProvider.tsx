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

export const TenantContext = createContext<TenantContextValue | undefined>(
  undefined
);

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

      // 명시적 slug이 있으면 해당 테넌트 조회
      if (initialSlug) {
        if (initialSlug === 'chopd') {
          setTenant(DEFAULT_TENANT);
          setIsLoading(false);
          return;
        }

        const res = await fetch(`/api/tenants/by-slug/${initialSlug}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || '테넌트를 찾을 수 없습니다.');
        }
        const data = await res.json();
        setTenant(data);
        return;
      }

      // slug 없음 → 현재 로그인한 사용자의 소유 테넌트 조회
      const myRes = await fetch('/api/tenants');
      if (myRes.ok) {
        const myData = await myRes.json();
        if (myData.tenants && myData.tenants.length > 0) {
          // 첫 번째 소유 테넌트 사용
          const myTenant = myData.tenants[0];
          setTenant({
            id: myTenant.id,
            name: myTenant.name,
            slug: myTenant.slug,
            profession: myTenant.profession,
            businessType: myTenant.businessType || 'individual',
            plan: myTenant.plan || 'free',
            status: myTenant.status || 'active',
            region: myTenant.region || null,
            settings: myTenant.settings || null,
            branding: {
              logoUrl: myTenant.logoUrl || null,
              faviconUrl: myTenant.faviconUrl || null,
              primaryColor: myTenant.primaryColor || '#00A1E0',
              secondaryColor: myTenant.secondaryColor || '#16325C',
              fontFamily: myTenant.fontFamily || 'Inter',
              footerText: `© ${new Date().getFullYear()} ${myTenant.name}`,
            },
            limits: {
              maxSnsAccounts: myTenant.plan === 'free' ? 2 : myTenant.plan === 'pro' ? 10 : -1,
              maxStorage: myTenant.plan === 'free' ? 524288000 : myTenant.plan === 'pro' ? 5368709120 : 53687091200,
              maxTeamMembers: myTenant.plan === 'free' ? 1 : myTenant.plan === 'pro' ? 3 : -1,
              maxCourses: myTenant.plan === 'free' ? 10 : -1,
              maxDistributors: myTenant.plan === 'free' ? 5 : myTenant.plan === 'pro' ? 50 : -1,
              customDomain: myTenant.plan !== 'free',
            },
            createdAt: myTenant.createdAt,
          });
          return;
        }
      }

      // 테넌트가 없으면 기본 테넌트로 fallback (chopd 공개 페이지용)
      setTenant(DEFAULT_TENANT);
    } catch (err) {
      const message = err instanceof Error ? err.message : '테넌트 로드 실패';
      setError(message);
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
