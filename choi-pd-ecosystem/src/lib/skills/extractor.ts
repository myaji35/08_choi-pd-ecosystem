import matter from 'gray-matter';

export interface ExtractedItem {
  name: string;
  category: 'hard' | 'meta' | 'context';
  level?: 'novice' | 'intermediate' | 'expert';
  yearsExperience?: number | null;
}

export interface ExtractionResult {
  title: string | null;
  category: string;
  tags: string[];
  skills: ExtractedItem[];
  entities: {
    companies: string[];
    projects: string[];
    years: number[];
    amounts: string[];
  };
  body: string;
  source: 'heuristic' | 'llm';
}

const CATEGORY_HINTS: Record<string, string> = {
  '이력': 'bio',
  'bio': 'bio',
  'resume': 'bio',
  '포트폴리오': 'portfolio',
  'portfolio': 'portfolio',
  '작품': 'portfolio',
  '강의': 'curriculum',
  '커리큘럼': 'curriculum',
  'curriculum': 'curriculum',
  '수상': 'awards',
  'awards': 'awards',
  '인터뷰': 'interview',
};

// 휴리스틱 달란트 패턴 (한국어 + 영어)
const SKILL_PATTERNS: Array<{ regex: RegExp; category: 'hard' | 'meta' | 'context' }> = [
  { regex: /([가-힣]{2,}(?:\s?편집|\s?기획|\s?제작|\s?촬영|\s?디자인|\s?개발|\s?운영|\s?분석|\s?강의|\s?상담|\s?설계|\s?중개|\s?번역|\s?작성))/g, category: 'hard' },
  { regex: /(SNS\s?마케팅|콘텐츠\s?마케팅|디지털\s?마케팅|SEO|퍼포먼스\s?마케팅)/gi, category: 'hard' },
  { regex: /(유튜브|인스타그램|틱톡|블로그|뉴스레터|팟캐스트)\s?(?:운영|제작|크리에이터)?/gi, category: 'hard' },
  { regex: /(부동산\s?중개|매물\s?관리|임대차\s?계약)/g, category: 'hard' },
  { regex: /(보험\s?설계|재무\s?설계|자산\s?관리)/g, category: 'hard' },
  { regex: /(스토리텔링|커뮤니케이션|네트워킹|리더십|프레젠테이션|협상)/g, category: 'meta' },
  { regex: /(\d+년\s?(?:경력|경험|근무))/g, category: 'context' },
];

// 엔티티 패턴
const ENTITY_PATTERNS = {
  company: /([가-힣A-Za-z0-9]+(?:주식회사|㈜|\(주\)|Corp\.?|Inc\.?|LLC))/g,
  year: /(19|20)\d{2}\s?년?/g,
  amount: /₩[\d,]+|[\d,]+\s?원|\$[\d,]+/g,
  project: /['"]([^'"]{3,40})['"]|「([^」]{3,40})」/g,
};

function extractTitle(body: string, fm: Record<string, unknown>): string | null {
  if (typeof fm.title === 'string') return fm.title;
  const match = body.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function detectCategory(filename: string, title: string | null, tags: string[]): string {
  const hay = `${filename} ${title || ''} ${tags.join(' ')}`.toLowerCase();
  for (const [kw, cat] of Object.entries(CATEGORY_HINTS)) {
    if (hay.includes(kw.toLowerCase())) return cat;
  }
  return 'other';
}

function heuristicSkills(body: string): ExtractedItem[] {
  const seen = new Map<string, ExtractedItem>();
  for (const { regex, category } of SKILL_PATTERNS) {
    let m: RegExpExecArray | null;
    const local = new RegExp(regex.source, regex.flags);
    while ((m = local.exec(body)) !== null) {
      const name = (m[1] || m[0]).trim();
      if (name.length < 2 || name.length > 40) continue;
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, { name, category });
      }
    }
  }

  // 연차 → expert 추정
  const years = body.match(/(\d+)\s?년\s?(?:경력|경험)/);
  if (years) {
    const y = parseInt(years[1]);
    for (const item of seen.values()) {
      if (item.category === 'hard' && !item.yearsExperience) {
        item.yearsExperience = y;
        item.level = y >= 10 ? 'expert' : y >= 3 ? 'intermediate' : 'novice';
      }
    }
  }
  return [...seen.values()].slice(0, 30);
}

function heuristicEntities(body: string) {
  const companies = new Set<string>();
  const projects = new Set<string>();
  const years = new Set<number>();
  const amounts = new Set<string>();

  const patchMatches = (pattern: RegExp, sink: Set<string>) => {
    let m: RegExpExecArray | null;
    const p = new RegExp(pattern.source, pattern.flags);
    while ((m = p.exec(body)) !== null) {
      const v = (m[1] || m[2] || m[0]).trim();
      if (v) sink.add(v);
    }
  };

  patchMatches(ENTITY_PATTERNS.company, companies);
  patchMatches(ENTITY_PATTERNS.amount, amounts);
  patchMatches(ENTITY_PATTERNS.project, projects);

  let m: RegExpExecArray | null;
  const yp = new RegExp(ENTITY_PATTERNS.year.source, ENTITY_PATTERNS.year.flags);
  while ((m = yp.exec(body)) !== null) {
    const y = parseInt(m[0].replace(/[^0-9]/g, ''));
    if (y >= 1990 && y <= 2100) years.add(y);
  }

  return {
    companies: [...companies].slice(0, 20),
    projects: [...projects].slice(0, 20),
    years: [...years].slice(0, 20),
    amounts: [...amounts].slice(0, 20),
  };
}

/**
 * Claude API (Anthropic)이 있으면 LLM으로, 없으면 휴리스틱으로 추출.
 */
async function extractWithLLM(markdown: string): Promise<{ skills: ExtractedItem[]; entities: ExtractionResult['entities'] } | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `다음 한국어 마크다운 문서에서 달란트(skills)와 엔티티를 추출해 JSON으로만 응답해. 추가 설명 금지.

문서:
${markdown.slice(0, 6000)}

JSON 스키마:
{
  "skills": [{"name": "...", "category": "hard|meta|context", "level": "novice|intermediate|expert", "yearsExperience": null}],
  "entities": {"companies": [...], "projects": [...], "years": [...], "amounts": [...]}
}`,
          },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.content?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      entities: parsed.entities || { companies: [], projects: [], years: [], amounts: [] },
    };
  } catch (err) {
    console.error('[extractor] LLM extraction failed:', err);
    return null;
  }
}

export async function extractFromMarkdown(
  filename: string,
  markdownRaw: string
): Promise<ExtractionResult> {
  const { data: fm, content } = matter(markdownRaw);
  const title = extractTitle(content, fm);
  const tags = Array.isArray(fm.tags) ? (fm.tags as string[]) : [];
  const category = typeof fm.category === 'string' ? fm.category : detectCategory(filename, title, tags);

  const llmResult = await extractWithLLM(content);
  if (llmResult) {
    return {
      title,
      category,
      tags,
      skills: llmResult.skills,
      entities: llmResult.entities,
      body: content,
      source: 'llm',
    };
  }

  return {
    title,
    category,
    tags,
    skills: heuristicSkills(content),
    entities: heuristicEntities(content),
    body: content,
    source: 'heuristic',
  };
}
