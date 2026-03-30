'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useTenant } from '@/lib/tenant/useTenant';
import type { Profession } from '@/lib/tenant/types';

// JSON 임포트
import baseLabels from './base.json';
import pdLabels from './professions/pd.json';
import shopownerLabels from './professions/shopowner.json';

// ---- 타입 정의 ----

/** 중첩 객체의 dot-notation 키 타입 */
type NestedKeyOf<T extends object> = {
  [K in keyof T & string]: T[K] extends object
    ? `${K}.${NestedKeyOf<T[K]>}`
    : K;
}[keyof T & string];

type Labels = typeof baseLabels;
type LabelKey = NestedKeyOf<Labels>;

// ---- 직업군별 라벨 맵 ----

const professionMap: Record<Profession, Record<string, unknown>> = {
  pd: pdLabels,
  shopowner: shopownerLabels,
  realtor: {},       // TODO: realtor.json 추가 시 교체
  educator: {},      // TODO: educator.json 추가 시 교체
  insurance: {},     // TODO: insurance.json 추가 시 교체
  freelancer: {},    // TODO: freelancer.json 추가 시 교체
};

// ---- 유틸리티 함수 ----

/** 두 객체를 deep merge (source가 우선) */
function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>
): T {
  const result = { ...target } as Record<string, unknown>;
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object'
    ) {
      result[key] = deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>
      );
    } else {
      result[key] = source[key];
    }
  }
  return result as T;
}

/** dot-notation 키로 중첩 객체에서 값 꺼내기 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // fallback: 키 자체를 반환
    }
  }
  return typeof current === 'string' ? current : path;
}

/** 직업군에 맞는 라벨 세트 생성 */
function buildLabels(profession: Profession): Labels {
  const overrides = professionMap[profession] || {};
  return deepMerge(baseLabels as Record<string, unknown>, overrides) as Labels;
}

// ---- Context & Provider ----

interface TranslationContextValue {
  /** dot-notation 키로 라벨 조회 (예: 'distributor.title') */
  t: (key: LabelKey | string) => string;
  /** 전체 라벨 객체 */
  labels: Labels;
}

const TranslationContext = createContext<TranslationContextValue>({
  t: (key: string) => key,
  labels: baseLabels,
});

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { tenant } = useTenant();
  const profession = tenant?.profession || 'pd';

  const labels = useMemo(() => buildLabels(profession), [profession]);

  const t = useMemo(
    () => (key: string) => getNestedValue(labels as unknown as Record<string, unknown>, key),
    [labels]
  );

  const value = useMemo(() => ({ t, labels }), [t, labels]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * 직업군별 라벨을 반환하는 훅
 *
 * @example
 * ```tsx
 * const { t } = useTranslation();
 * return <h1>{t('distributor.title')}</h1>; // PD: "유통사", 쇼핑몰: "입점업체"
 * ```
 */
export function useTranslation(): TranslationContextValue {
  return useContext(TranslationContext);
}
