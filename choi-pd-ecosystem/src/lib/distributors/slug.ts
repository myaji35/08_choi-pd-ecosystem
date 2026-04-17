// ID (slug) 규칙 & 추천 — distributors / members 공용

export const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

export const RESERVED_SLUGS = new Set([
  'admin', 'api', 'app', 'pd', 'chopd', 'choi',
  'login', 'logout', 'register', 'signup', 'onboarding',
  'settings', 'profile', 'dashboard', 'public', 'static',
  'assets', 'images', 'media', '_next', 'help', 'support',
  'terms', 'privacy', 'pricing', 'docs', 'blog', 'press',
  'about', 'contact', 'member', 'members', 'users', 'user',
  'distributors', 'distributor', 'reports', 'impd', 'www',
]);

export type SlugValidation =
  | { ok: true; normalized: string }
  | { ok: false; reason: string };

export function validateSlug(raw: string): SlugValidation {
  if (!raw || typeof raw !== 'string') {
    return { ok: false, reason: 'ID를 입력해주세요' };
  }
  const normalized = raw.trim().toLowerCase().replace(/\s+/g, '-');
  if (normalized.length < 3) {
    return { ok: false, reason: '최소 3자 이상 필요' };
  }
  if (normalized.length > 30) {
    return { ok: false, reason: '최대 30자까지 가능' };
  }
  if (!SLUG_REGEX.test(normalized)) {
    return { ok: false, reason: '영문 소문자 · 숫자 · 하이픈만 가능 (양끝 하이픈 금지)' };
  }
  if (RESERVED_SLUGS.has(normalized)) {
    return { ok: false, reason: '예약된 ID입니다' };
  }
  return { ok: true, normalized };
}

/** 이메일/이름에서 초기 slug 제안 */
export function suggestSlug(opts: { email?: string | null; name?: string | null }): string {
  const { email, name } = opts;

  // 이메일 로컬파트 우선
  if (email && email.includes('@')) {
    const local = email.split('@')[0].toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');
    if (local.length >= 3) return local.slice(0, 30);
  }

  // 이름 → 영문 로마자/숫자만 유지
  if (name) {
    const ascii = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    if (ascii.length >= 3) return ascii.slice(0, 30);
  }

  return '';
}
