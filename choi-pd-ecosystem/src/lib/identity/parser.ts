/**
 * identity.md 파서
 * ------------------------------------------------------------
 * 회원이 업로드한 아이덴티티 마크다운을 파싱해 구조화 JSON으로 반환한다.
 * - 섹션 제목 후보(한/영 동의어) 기반 휴리스틱 매칭
 * - LLM 없이도 동작 (Phase 1). 추후 Codex/Opus로 정교화 여지 남김.
 *
 * 추출 필드:
 *   agenda       : 한 줄 아젠다 / 슬로건
 *   tone[]       : 톤 앤 매너 형용사
 *   keywords[]   : 핵심 키워드
 *   target[]     : 타겟 오디언스
 *   usp[]        : 차별점 / Unique Selling Point
 *   antiPatterns[] : 피해야 할 것
 *   heroCopy     : 히어로 카피(있으면)
 *   hashtags[]   : # 로 시작하는 해시태그
 *   mentions[]   : @ 로 시작하는 멘션 / 수상·소속 태그
 *   sections[]   : 원본 섹션 목록(h2/h3 제목 + 첫 3줄)
 *   completeness : 0~100 (핵심 섹션 커버리지 점수)
 *   missing[]    : 누락된 필드 목록
 *   summary      : 1~2 문장 요약(첫 문단 압축)
 */

export interface ParsedIdentity {
  agenda: string | null;
  tone: string[];
  keywords: string[];
  target: string[];
  usp: string[];
  antiPatterns: string[];
  heroCopy: string | null;
  hashtags: string[];
  mentions: string[];
  sections: Array<{ title: string; preview: string }>;
  completeness: number;
  missing: string[];
  summary: string;
  parsedAt: string; // ISO
  rawBytes: number;
}

const SECTION_ALIASES: Record<keyof Omit<ParsedIdentity, 'sections' | 'completeness' | 'missing' | 'summary' | 'parsedAt' | 'rawBytes' | 'heroCopy' | 'hashtags' | 'mentions'>, string[]> = {
  agenda: ['아젠다', '비전', 'vision', 'agenda', '슬로건', 'slogan', '한 줄 소개', 'mission', '미션'],
  tone: ['톤', '톤 앤 매너', 'tone', '보이스', 'voice', '어조', '말투', '화법'],
  keywords: ['키워드', 'keywords', '핵심 키워드', '태그', 'tags', '핵심어'],
  target: ['타겟', '대상', 'target', 'audience', '오디언스', '고객', '타겟 고객'],
  usp: ['차별점', 'usp', '강점', '핵심 가치', 'value proposition', '밸류 프로포지션', '경쟁 우위', '고유 가치'],
  antiPatterns: ['피해야', 'anti', 'avoid', '안티 패턴', 'dont', "don't", '금지', '지양'],
};

const REQUIRED_FIELDS: (keyof typeof SECTION_ALIASES)[] = [
  'agenda',
  'tone',
  'keywords',
  'target',
  'usp',
];

/**
 * md 문서를 섹션 단위로 분리.
 * H1 은 제목, H2/H3 는 섹션 헤딩.
 */
function splitSections(md: string): Array<{ title: string; body: string; level: number }> {
  const lines = md.split(/\r?\n/);
  const sections: Array<{ title: string; body: string; level: number }> = [];
  let current: { title: string; body: string; level: number } | null = null;

  for (const line of lines) {
    const h = /^(#{1,4})\s+(.+?)\s*$/.exec(line);
    if (h) {
      if (current) sections.push(current);
      current = { title: h[2].trim(), body: '', level: h[1].length };
    } else if (current) {
      current.body += line + '\n';
    } else {
      // 최상단 프리엠블 — 암묵적 "intro" 섹션
      current = { title: '__intro__', body: line + '\n', level: 0 };
    }
  }
  if (current) sections.push(current);
  return sections;
}

/** 섹션 본문을 bullet / 줄 단위 배열로 뽑아낸다. */
function extractBullets(body: string, max = 8): string[] {
  const lines = body
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const bullets: string[] = [];

  for (const line of lines) {
    // "- foo", "* foo", "1. foo" 형식
    const m = /^(?:[-*+]|\d+[.)])\s+(.+)$/.exec(line);
    if (m) {
      const v = cleanInline(m[1]);
      if (v) bullets.push(v);
      continue;
    }
    // "| foo | bar |" 테이블 행 (첫 컬럼만 사용)
    const t = /^\|\s*([^|]+?)\s*\|/.exec(line);
    if (t && !/^[-:| ]+$/.test(line)) {
      const v = cleanInline(t[1]);
      if (v && v !== '지표' && v !== '항목') bullets.push(v);
      continue;
    }
    // 쉼표 분리 (한 줄 요약형)
    if (line.includes(',') && line.length < 120 && !/^[#>]/.test(line)) {
      line.split(/[,、]/).forEach((p) => {
        const v = cleanInline(p);
        if (v && v.length <= 30) bullets.push(v);
      });
    }
  }
  // 중복 제거 + 길이 제한
  return Array.from(new Set(bullets)).slice(0, max);
}

function cleanInline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`>]/g, '')
    .trim();
}

/** 섹션 제목이 alias 목록 중 하나와 매칭되는지 */
function matchesAny(title: string, aliases: string[]): boolean {
  const t = title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
  return aliases.some((a) => {
    const al = a.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
    return t.includes(al);
  });
}

/** 첫 문단(빈 줄 전까지) 압축 */
function firstParagraph(body: string, maxChars = 160): string {
  const para = body
    .split(/\n\s*\n/)[0]
    .split(/\r?\n/)
    .map((l) => cleanInline(l))
    .filter((l) => l && !/^[#|>-]/.test(l))
    .join(' ')
    .trim();
  return para.length > maxChars ? para.slice(0, maxChars - 1) + '…' : para;
}

function extractHashtagsAndMentions(md: string): { hashtags: string[]; mentions: string[] } {
  const hashtags = Array.from(new Set(md.match(/#[가-힣A-Za-z0-9_]{2,30}/g) || []));
  const mentions = Array.from(new Set(md.match(/@[가-힣A-Za-z0-9_]{2,30}/g) || []));
  return { hashtags: hashtags.slice(0, 20), mentions: mentions.slice(0, 20) };
}

export function parseIdentityMarkdown(md: string): ParsedIdentity {
  const now = new Date().toISOString();
  if (!md || typeof md !== 'string') {
    return {
      agenda: null,
      tone: [],
      keywords: [],
      target: [],
      usp: [],
      antiPatterns: [],
      heroCopy: null,
      hashtags: [],
      mentions: [],
      sections: [],
      completeness: 0,
      missing: [...REQUIRED_FIELDS],
      summary: '',
      parsedAt: now,
      rawBytes: 0,
    };
  }

  const sections = splitSections(md);
  const result: ParsedIdentity = {
    agenda: null,
    tone: [],
    keywords: [],
    target: [],
    usp: [],
    antiPatterns: [],
    heroCopy: null,
    hashtags: [],
    mentions: [],
    sections: [],
    completeness: 0,
    missing: [],
    summary: '',
    parsedAt: now,
    rawBytes: new Blob([md]).size,
  };

  // 최상단 h1 이면 agenda 후보, 첫 문단은 summary 후보
  const h1 = sections.find((s) => s.level === 1);
  if (h1) {
    result.agenda = result.agenda || cleanInline(h1.title);
    if (!result.summary) result.summary = firstParagraph(h1.body);
  }

  // intro 섹션에서 인용구(>) 또는 첫 줄 → heroCopy 후보
  const intro = sections.find((s) => s.title === '__intro__');
  if (intro) {
    const quote = intro.body
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find((l) => l.startsWith('>'));
    if (quote) result.heroCopy = quote.replace(/^>+\s*/, '').trim();
    if (!result.summary) result.summary = firstParagraph(intro.body);
  }

  // alias 기반 섹션 매칭
  for (const field of Object.keys(SECTION_ALIASES) as (keyof typeof SECTION_ALIASES)[]) {
    const aliases = SECTION_ALIASES[field];
    const matched = sections.find((s) => s.title !== '__intro__' && matchesAny(s.title, aliases));
    if (!matched) continue;

    if (field === 'agenda') {
      if (!result.agenda) {
        const firstLine = matched.body
          .split(/\r?\n/)
          .map((l) => cleanInline(l))
          .find((l) => l && !/^[#|>-]/.test(l));
        result.agenda = firstLine || cleanInline(matched.title);
      }
    } else {
      result[field] = extractBullets(matched.body) as never;
    }
  }

  // 해시태그/멘션 (전체 문서에서)
  const hm = extractHashtagsAndMentions(md);
  result.hashtags = hm.hashtags;
  result.mentions = hm.mentions;

  // 섹션 스냅샷(미리보기용, 최대 20개)
  result.sections = sections
    .filter((s) => s.title !== '__intro__' && s.level >= 2)
    .slice(0, 20)
    .map((s) => ({
      title: s.title,
      preview: firstParagraph(s.body, 120),
    }));

  // 완성도 계산
  const filled = REQUIRED_FIELDS.filter((f) => {
    const v = result[f];
    return Array.isArray(v) ? v.length > 0 : !!v;
  });
  result.completeness = Math.round((filled.length / REQUIRED_FIELDS.length) * 100);
  result.missing = REQUIRED_FIELDS.filter((f) => !filled.includes(f));

  // summary fallback
  if (!result.summary && result.agenda) {
    result.summary = result.agenda;
  }

  return result;
}
