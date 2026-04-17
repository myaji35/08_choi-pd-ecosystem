import { db } from '@/lib/db';
import { skills, type Skill, type NewSkill } from '@/lib/db/schema';
import { and, eq, sql } from 'drizzle-orm';

// ── Axis 추론 규칙 (canonicalName → 레이더 축) ────────────────
const AXIS_KEYWORDS: Record<string, string[]> = {
  expertise: ['편집', '촬영', '디자인', '기획', '강의', '상담', '설계', '중개', '코칭', '개발', '작성', '번역', '통역', '연출', '제작'],
  communication: ['소통', '관계', '네트워킹', '인터뷰', '발표', '강연', '프레젠테이션', '라이팅', '협상'],
  marketing: ['마케팅', 'sns', '유튜브', '인스타', '광고', '브랜딩', '콘텐츠', '캠페인', '카피', '세일즈'],
  operations: ['예약', '결제', '운영', '관리', '프로세스', '세금', '회계', '정산', '일정', '스케줄'],
  data: ['분석', '데이터', '리포트', '지표', 'kpi', '대시보드', '엑셀', 'sql', '통계'],
  network: ['네트워크', '커뮤니티', '파트너', '리드', '영업', '제휴', '협력'],
};

// ── 일반적 한국어 ↔ 영어 alias 사전 ──────────────────────────
const BUILT_IN_ALIASES: Record<string, string[]> = {
  '영상 편집': ['영상편집', '비디오 편집', '비디오편집', 'video editing', 'video edit'],
  '콘텐츠 기획': ['기획', '콘텐츠기획', 'content planning', 'editorial planning'],
  'SNS 운영': ['sns', 'sns운영', 'sns 마케팅', 'social media'],
  '강의 운영': ['강의', '교육', '강연', 'teaching', 'training'],
  '고객 상담': ['상담', '컨설팅', 'consulting'],
  '부동산 중개': ['중개', '매물', '임대차'],
  '세금계산서 발행': ['세금계산서', '정산', '회계'],
};

function normalize(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

function inferAxis(canonicalName: string): string | null {
  const n = normalize(canonicalName);
  for (const [axis, kws] of Object.entries(AXIS_KEYWORDS)) {
    if (kws.some((kw) => n.includes(kw))) return axis;
  }
  return null;
}

function jaroWinklerLite(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.92;
  const setA = new Set(na.replace(/\s/g, '').split(''));
  const setB = new Set(nb.replace(/\s/g, '').split(''));
  const inter = [...setA].filter((c) => setB.has(c)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : inter / union;
}

function isAliasMatch(table: string, aliasesJson: string, surface: string): boolean {
  const s = normalize(surface);
  if (normalize(table) === s) return true;
  try {
    const arr = JSON.parse(aliasesJson) as string[];
    return arr.some((a) => normalize(a) === s);
  } catch {
    return false;
  }
}

export interface ResolvedSkill {
  skillId: number;
  canonicalName: string;
  category: 'hard' | 'meta' | 'context';
  axis: string | null;
  matchedAs: 'exact' | 'alias' | 'fuzzy' | 'created';
}

/**
 * Entity Resolution: 표면형(surface) → canonical skills 레코드.
 * 없으면 생성. 있으면 aliases에 병합.
 */
export async function resolveSkill(
  tenantId: number,
  surface: string,
  category: 'hard' | 'meta' | 'context' = 'hard'
): Promise<ResolvedSkill> {
  const clean = surface.trim();
  if (!clean) throw new Error('skill surface empty');

  // 1차: 내장 별칭 사전으로 canonical 결정
  let canonicalGuess = clean;
  for (const [canon, aliases] of Object.entries(BUILT_IN_ALIASES)) {
    if (normalize(canon) === normalize(clean) || aliases.some((a) => normalize(a) === normalize(clean))) {
      canonicalGuess = canon;
      break;
    }
  }

  // 2차: DB exact / alias / fuzzy 매칭
  const existing = await db
    .select()
    .from(skills)
    .where(eq(skills.tenantId, tenantId))
    .all();

  // exact canonical
  const exact = existing.find((s) => normalize(s.canonicalName) === normalize(canonicalGuess));
  if (exact) return toResolved(exact, 'exact');

  // alias
  const aliasHit = existing.find((s) => isAliasMatch(s.canonicalName, s.aliases || '[]', clean));
  if (aliasHit) return toResolved(aliasHit, 'alias');

  // fuzzy
  let best: { row: Skill; score: number } | null = null;
  for (const s of existing) {
    const score = jaroWinklerLite(s.canonicalName, clean);
    if (score >= 0.85 && (!best || score > best.score)) {
      best = { row: s, score };
    }
  }
  if (best) {
    // alias에 surface 추가
    await addAlias(best.row.id, clean);
    return toResolved(best.row, 'fuzzy');
  }

  // 3차: 신규 생성
  const axis = inferAxis(canonicalGuess);
  const initialAliases =
    BUILT_IN_ALIASES[canonicalGuess] && canonicalGuess !== clean
      ? [...(BUILT_IN_ALIASES[canonicalGuess] || []), clean]
      : clean !== canonicalGuess
        ? [clean]
        : [];

  const inserted = await db
    .insert(skills)
    .values({
      tenantId,
      canonicalName: canonicalGuess,
      aliases: JSON.stringify(initialAliases),
      category,
      axis: axis as NewSkill['axis'],
    } as NewSkill)
    .returning();

  const row = inserted[0];
  return {
    skillId: row.id,
    canonicalName: row.canonicalName,
    category: row.category as 'hard' | 'meta' | 'context',
    axis: row.axis,
    matchedAs: 'created',
  };
}

async function addAlias(skillId: number, surface: string) {
  const row = await db.select().from(skills).where(eq(skills.id, skillId)).get();
  if (!row) return;
  let arr: string[] = [];
  try {
    arr = JSON.parse(row.aliases || '[]');
  } catch {}
  if (!arr.map(normalize).includes(normalize(surface))) {
    arr.push(surface);
    await db.update(skills).set({ aliases: JSON.stringify(arr) }).where(eq(skills.id, skillId));
  }
}

function toResolved(
  row: Skill,
  matchedAs: 'exact' | 'alias' | 'fuzzy'
): ResolvedSkill {
  return {
    skillId: row.id,
    canonicalName: row.canonicalName,
    category: row.category as 'hard' | 'meta' | 'context',
    axis: row.axis,
    matchedAs,
  };
}
