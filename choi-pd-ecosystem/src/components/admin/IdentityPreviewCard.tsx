'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sparkles,
  Target,
  Tag,
  Users,
  Award,
  Ban,
  Hash,
  AtSign,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface Parsed {
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
  rawBytes: number;
}

interface Props {
  distributorId: string;
  /** 업로드 직후 부모가 전달 (없으면 자체 fetch) */
  refreshKey?: number | string;
}

const MISSING_LABELS: Record<string, string> = {
  agenda: '아젠다 / 비전',
  tone: '톤 앤 매너',
  keywords: '핵심 키워드',
  target: '타겟 고객',
  usp: '차별점 (USP)',
};

export function IdentityPreviewCard({ distributorId, refreshKey }: Props) {
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [parsedAt, setParsedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetch(`/api/admin/distributors/${distributorId}/identity`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data?.success) {
          setError(data?.error || '조회 실패');
          return;
        }
        setHasContent(!!data.identity?.content);
        setParsed(data.identity?.parsed ?? null);
        setParsedAt(data.identity?.parsedAt ?? null);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [distributorId, refreshKey]);

  if (loading) {
    return (
      <Card className="border-gray-200">
        <CardContent className="py-8 text-center text-sm text-gray-500">
          아이덴티티 분석 중…
        </CardContent>
      </Card>
    );
  }

  if (!hasContent) {
    return (
      <Card className="border-dashed border-2 border-gray-300 bg-gray-50/60">
        <CardContent className="py-8 text-center">
          <FileText className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600">
            아직 업로드된 identity.md 가 없습니다.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            아래에서 .md 파일을 업로드하면 브랜드/톤/키워드가 자동 추출됩니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error || !parsed) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-4 text-sm text-red-700">
          {error || '파싱 결과 없음'}
        </CardContent>
      </Card>
    );
  }

  const completeness = parsed.completeness ?? 0;
  const pctColor =
    completeness >= 80 ? '#10B981' : completeness >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2" style={{ color: '#16325C' }}>
              <Sparkles className="h-5 w-5 text-[#00A1E0]" />
              아이덴티티 분석
            </CardTitle>
            <CardDescription>
              업로드된 identity.md 에서 자동 추출한 브랜드 DNA 요약입니다.
            </CardDescription>
          </div>
          {/* 완성도 도넛 */}
          <div className="flex flex-col items-center">
            <div
              className="relative flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(${pctColor} ${completeness * 3.6}deg, #E5E7EB 0deg)`,
              }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                <span className="text-sm font-black" style={{ color: pctColor }}>
                  {completeness}%
                </span>
              </div>
            </div>
            <span className="mt-1 text-[10px] font-semibold text-gray-500">완성도</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* 1. 아젠다 */}
        {parsed.agenda && (
          <div
            className="rounded-lg border-l-4 p-3"
            style={{ borderColor: '#00A1E0', background: '#F3FBFE' }}
          >
            <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-[#0082B3]">
              <Target className="h-3.5 w-3.5" /> 아젠다
            </div>
            <p className="text-sm font-semibold leading-snug" style={{ color: '#16325C' }}>
              {parsed.agenda}
            </p>
          </div>
        )}

        {/* 2. 히어로 카피 (있을 때만) */}
        {parsed.heroCopy && (
          <blockquote
            className="rounded-lg border border-gray-200 bg-white p-3 text-sm italic text-gray-700"
            style={{ borderLeft: '3px solid #7C3AED' }}
          >
            "{parsed.heroCopy}"
          </blockquote>
        )}

        {/* 3. 칩 그리드 (tone/keywords/target/usp) */}
        <div className="grid gap-3 md:grid-cols-2">
          <ChipGroup
            icon={<Sparkles className="h-3.5 w-3.5" />}
            label="톤 앤 매너"
            items={parsed.tone}
            chipBg="#EEF2FF"
            chipFg="#4338CA"
          />
          <ChipGroup
            icon={<Tag className="h-3.5 w-3.5" />}
            label="핵심 키워드"
            items={parsed.keywords}
            chipBg="#ECFDF5"
            chipFg="#047857"
          />
          <ChipGroup
            icon={<Users className="h-3.5 w-3.5" />}
            label="타겟 고객"
            items={parsed.target}
            chipBg="#FEF3C7"
            chipFg="#B45309"
          />
          <ChipGroup
            icon={<Award className="h-3.5 w-3.5" />}
            label="차별점 (USP)"
            items={parsed.usp}
            chipBg="#FCE7F3"
            chipFg="#BE185D"
          />
        </div>

        {/* 4. Anti-patterns (있을 때만) */}
        {parsed.antiPatterns.length > 0 && (
          <ChipGroup
            icon={<Ban className="h-3.5 w-3.5" />}
            label="피해야 할 것"
            items={parsed.antiPatterns}
            chipBg="#FEE2E2"
            chipFg="#B91C1C"
          />
        )}

        {/* 5. 해시태그 / 멘션 */}
        {(parsed.hashtags.length > 0 || parsed.mentions.length > 0) && (
          <div className="grid gap-3 md:grid-cols-2">
            {parsed.hashtags.length > 0 && (
              <ChipGroup
                icon={<Hash className="h-3.5 w-3.5" />}
                label="해시태그"
                items={parsed.hashtags}
                chipBg="#F3F4F6"
                chipFg="#374151"
              />
            )}
            {parsed.mentions.length > 0 && (
              <ChipGroup
                icon={<AtSign className="h-3.5 w-3.5" />}
                label="멘션 / 수상"
                items={parsed.mentions}
                chipBg="#F3F4F6"
                chipFg="#374151"
              />
            )}
          </div>
        )}

        {/* 6. 섹션 아웃라인 */}
        {parsed.sections.length > 0 && (
          <div>
            <div className="mb-1.5 text-xs font-semibold text-gray-600">섹션 구조</div>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2">
              {parsed.sections.slice(0, 12).map((s, i) => (
                <div
                  key={`${i}-${s.title}`}
                  className="rounded bg-white px-2.5 py-1.5 text-xs"
                >
                  <div className="font-semibold text-gray-900">{s.title}</div>
                  {s.preview && (
                    <div className="mt-0.5 line-clamp-1 text-[11px] text-gray-500">
                      {s.preview}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. 누락 체크리스트 */}
        {parsed.missing.length > 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-amber-800">
              <AlertTriangle className="h-3.5 w-3.5" />
              보강 권장 ({parsed.missing.length}개)
            </div>
            <ul className="ml-5 list-disc space-y-0.5 text-xs text-amber-800">
              {parsed.missing.map((m) => (
                <li key={m}>{MISSING_LABELS[m] || m} 섹션 추가 권장</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            핵심 섹션 모두 충족 — 사이트 반영 준비 완료
          </div>
        )}

        {/* 8. 메타 */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-[11px] text-gray-500">
          <span>본문 {parsed.rawBytes.toLocaleString()} bytes</span>
          {parsedAt && (
            <span>
              파싱 {new Date(parsedAt).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ChipGroup({
  icon,
  label,
  items,
  chipBg,
  chipFg,
}: {
  icon: React.ReactNode;
  label: string;
  items: string[];
  chipBg: string;
  chipFg: string;
}) {
  if (!items || items.length === 0) {
    return (
      <div>
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          {icon} {label}
        </div>
        <div className="text-xs italic text-gray-400">— 미정의</div>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
        {icon} {label}{' '}
        <span className="ml-0.5 text-[10px] font-normal text-gray-400">
          ({items.length})
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.slice(0, 12).map((v, i) => (
          <span
            key={`${i}-${v}`}
            className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{ background: chipBg, color: chipFg }}
          >
            {v}
          </span>
        ))}
        {items.length > 12 && (
          <span className="text-[11px] text-gray-400">+{items.length - 12}</span>
        )}
      </div>
    </div>
  );
}
