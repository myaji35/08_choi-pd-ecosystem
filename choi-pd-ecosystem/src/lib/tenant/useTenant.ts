'use client';

import { useContext } from 'react';
import { TenantContext } from './TenantProvider';
import type { TenantContextValue } from './types';

/**
 * 현재 테넌트 정보를 반환하는 훅
 *
 * @example
 * ```tsx
 * const { tenant, isLoading, canUseFeature } = useTenant();
 *
 * if (isLoading) return <Spinner />;
 * if (!canUseFeature('customDomain')) return <UpgradePrompt />;
 * ```
 */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant은 TenantProvider 내에서만 사용할 수 있습니다.');
  }
  return context;
}
