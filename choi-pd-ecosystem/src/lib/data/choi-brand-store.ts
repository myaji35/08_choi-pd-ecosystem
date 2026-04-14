// /choi 브랜드 컬러 서버 측 로드/저장
// - 파일 저장: data/choi-brand.json (프로세스 수명 동안 유효)
// - 실패/부재 시 DEFAULT_CHOI_BRAND 사용 (fallback)
import { promises as fs } from 'fs';
import path from 'path';
import {
  DEFAULT_CHOI_BRAND,
  BRAND_COLOR_KEYS,
  type ChoiBrandColors,
} from './choi-brand';

const BRAND_FILE = path.join(process.cwd(), 'data', 'choi-brand.json');
const HEX = /^#[0-9a-fA-F]{6}$/;

export async function loadChoiBrand(): Promise<ChoiBrandColors> {
  try {
    const raw = await fs.readFile(BRAND_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<ChoiBrandColors>;
    return mergeWithDefaults(parsed);
  } catch {
    return DEFAULT_CHOI_BRAND;
  }
}

export async function saveChoiBrand(incoming: Partial<ChoiBrandColors>): Promise<ChoiBrandColors> {
  const merged = mergeWithDefaults(incoming);
  await fs.mkdir(path.dirname(BRAND_FILE), { recursive: true });
  await fs.writeFile(BRAND_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

export function validateBrand(input: unknown): { ok: true; value: Partial<ChoiBrandColors> } | { ok: false; error: string } {
  if (!input || typeof input !== 'object') return { ok: false, error: 'body must be an object' };
  const v = input as Record<string, unknown>;

  // 허용된 키 외 다른 키가 있으면 거부 (strict mode)
  const allowed = new Set<string>(BRAND_COLOR_KEYS);
  const unknownKeys = Object.keys(v).filter((k) => !allowed.has(k));
  if (unknownKeys.length > 0) {
    return { ok: false, error: `unknown keys: ${unknownKeys.join(', ')}` };
  }

  const result: Partial<ChoiBrandColors> = {};
  for (const k of BRAND_COLOR_KEYS) {
    if (v[k] == null) continue;
    if (typeof v[k] !== 'string' || !HEX.test(v[k] as string)) {
      return { ok: false, error: `invalid hex for ${k}` };
    }
    result[k] = v[k] as string;
  }

  // 최소 1개 유효 키 필수 (빈 요청으로 초기화 방지)
  if (Object.keys(result).length === 0) {
    return { ok: false, error: 'at least one valid brand color key is required' };
  }

  return { ok: true, value: result };
}

function mergeWithDefaults(partial: Partial<ChoiBrandColors>): ChoiBrandColors {
  const out: ChoiBrandColors = { ...DEFAULT_CHOI_BRAND };
  for (const k of BRAND_COLOR_KEYS) {
    const v = partial[k];
    if (typeof v === 'string' && HEX.test(v)) out[k] = v;
  }
  return out;
}
