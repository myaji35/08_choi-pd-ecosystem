/**
 * 직업별 회원 페이지 템플릿 시스템
 *
 * Rails i18n의 config/locales/*.yml 방식과 동일한 개념:
 * - 각 직업별 설정은 src/lib/templates/{profession}.json 파일에 분리
 * - 새 직업 추가 시 JSON 파일만 추가하면 됨 (코드 수정 불필요)
 * - 런타임에 fs 읽기 없이 빌드타임에 import (시스템 부담 0)
 */

// ── JSON 파일 import (빌드타임 정적 로드) ────────────────────
import insuranceAgent from './templates/insurance_agent.json';
import realtor from './templates/realtor.json';
import educator from './templates/educator.json';
import author from './templates/author.json';
import shopowner from './templates/shopowner.json';
import freelancer from './templates/freelancer.json';
import custom from './templates/custom.json';

// ── 타입 정의 ────────────────────────────────────────────────
export interface MemberTemplate {
  profession: string;
  label: string;
  hero: {
    title: string;
    subtitle: string;
  };
  cta: {
    primary: string;
    secondary: string;
  };
  modules: {
    defaults: string[];
    labels: Record<string, string>;
  };
  theme: {
    accentColor: string;
    coverGradient: string;
  };
}

// ── 템플릿 레지스트리 ────────────────────────────────────────
// 새 직업 추가 시:
// 1. src/lib/templates/{profession}.json 파일 생성
// 2. 위에 import 추가
// 3. 아래 TEMPLATES에 등록
const TEMPLATES: Record<string, MemberTemplate> = {
  insurance_agent: insuranceAgent as MemberTemplate,
  realtor: realtor as MemberTemplate,
  educator: educator as MemberTemplate,
  author: author as MemberTemplate,
  shopowner: shopowner as MemberTemplate,
  freelancer: freelancer as MemberTemplate,
  custom: custom as MemberTemplate,
};

// ── API ──────────────────────────────────────────────────────

/**
 * 회원의 profession에 맞는 템플릿 반환
 * 없으면 custom(기본) 템플릿 반환
 */
export function getTemplate(profession: string | null | undefined): MemberTemplate {
  if (!profession) return TEMPLATES.custom;
  return TEMPLATES[profession] || TEMPLATES.custom;
}

/**
 * 히어로 텍스트에서 {name} 플레이스홀더 치환
 */
export function resolveHeroText(text: string, name: string): string {
  return text.replace(/{name}/g, name);
}

/**
 * 직업 목록 (선택 UI용)
 */
export const PROFESSION_OPTIONS = Object.values(TEMPLATES).map((t) => ({
  value: t.profession,
  label: t.label,
}));

/**
 * 모든 템플릿 반환 (관리자 UI용)
 */
export function getAllTemplates(): MemberTemplate[] {
  return Object.values(TEMPLATES);
}
