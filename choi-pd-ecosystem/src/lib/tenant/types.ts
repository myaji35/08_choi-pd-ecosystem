'use client';

// 직업군 타입
export type Profession =
  | 'pd'
  | 'shopowner'
  | 'realtor'
  | 'educator'
  | 'insurance'
  | 'freelancer';

// 플랜 타입
export type PlanType = 'free' | 'pro' | 'enterprise';

// 테넌트 상태
export type TenantStatus = 'active' | 'suspended' | 'deleted';

// 테넌트 브랜딩
export interface TenantBranding {
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  footerText: string;
}

// 플랜 제한
export interface PlanLimits {
  maxSnsAccounts: number;
  maxStorage: number; // bytes
  maxTeamMembers: number;
  maxCourses: number;
  maxDistributors: number;
  customDomain: boolean;
}

// 테넌트 정보
export interface Tenant {
  id: number;
  name: string;
  slug: string;
  profession: Profession;
  businessType: 'individual' | 'company' | 'organization';
  plan: PlanType;
  status: TenantStatus;
  region: string | null;
  branding: TenantBranding;
  limits: PlanLimits;
  createdAt: string;
}

// 테넌트 컨텍스트에서 제공하는 값
export interface TenantContextValue {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  isDefaultTenant: boolean;
  /** 플랜 기능 제한 체크 */
  canUseFeature: (feature: keyof PlanLimits) => boolean;
  /** 테넌트 정보 새로고침 */
  refresh: () => Promise<void>;
}
