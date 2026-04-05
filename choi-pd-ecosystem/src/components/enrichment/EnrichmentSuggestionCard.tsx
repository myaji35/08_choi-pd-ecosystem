'use client';

import { useState, useCallback } from 'react';

// --- 타입 ---
interface Suggestion {
  id: number;
  source: string;
  dataType: string;
  value: string;
  confidence: number | null;
}

interface EnrichmentSuggestionCardProps {
  memberId: number;
  suggestions: Suggestion[];
  onComplete?: () => void;
}

// --- 데이터 타입 한국어 라벨 ---
const DATA_TYPE_LABELS: Record<string, string> = {
  photo_url: '프로필 사진',
  name: '이름',
  bio: '소개글',
  location: '지역',
  company: '회사',
  title: '직함',
  skills: '기술 스택',
  sns_url: 'SNS 링크',
};

// --- 소스 라벨 ---
const SOURCE_LABELS: Record<string, string> = {
  gravatar: 'Gravatar',
  github: 'GitHub',
  google: 'Google',
  linkedin: 'LinkedIn',
  sns_oauth: 'SNS 연동',
};

// --- Feather-style SVG 아이콘 (stroke 기반) ---
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className || ''}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  );
}

// --- 메인 컴포넌트 ---
export default function EnrichmentSuggestionCard({
  memberId,
  suggestions,
  onComplete,
}: EnrichmentSuggestionCardProps) {
  const [selected, setSelected] = useState<Set<number>>(
    new Set(suggestions.map((s) => s.id)),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSelection = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleApply = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const approvedIds = Array.from(selected);
      const rejectedIds = suggestions
        .filter((s) => !selected.has(s.id))
        .map((s) => s.id);

      const response = await fetch('/api/enrichment/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, approvedIds, rejectedIds }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '처리에 실패했습니다.');
      }

      onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setIsSubmitting(false);
    }
  }, [memberId, suggestions, selected, onComplete]);

  const handleSkip = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const rejectedIds = suggestions.map((s) => s.id);

      await fetch('/api/enrichment/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, approvedIds: [], rejectedIds }),
      });

      onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setIsSubmitting(false);
    }
  }, [memberId, suggestions, onComplete]);

  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
        <SearchIcon className="text-[#00A1E0]" />
        <div>
          <h3 className="text-sm font-semibold text-[#16325C]">
            프로필 자동 완성
          </h3>
          <p className="text-xs text-gray-500">
            공개 정보를 기반으로 프로필을 완성해드립니다.
          </p>
        </div>
      </div>

      {/* 제안 목록 */}
      <div className="divide-y divide-gray-200">
        {suggestions.map((suggestion) => {
          const isChecked = selected.has(suggestion.id);
          const confidencePercent = Math.round(
            (suggestion.confidence ?? 0.5) * 100,
          );
          const label =
            DATA_TYPE_LABELS[suggestion.dataType] || suggestion.dataType;
          const sourceLabel =
            SOURCE_LABELS[suggestion.source] || suggestion.source;

          return (
            <label
              key={suggestion.id}
              className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              {/* 체크박스 */}
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleSelection(suggestion.id)}
                className="h-4 w-4 rounded border-gray-300 text-[#00A1E0] focus:ring-[#00A1E0]"
              />

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {label}
                    {suggestion.dataType !== 'photo_url' && (
                      <span className="ml-2 text-sm text-gray-600 truncate">
                        {suggestion.value.length > 60
                          ? `${suggestion.value.slice(0, 60)}...`
                          : suggestion.value}
                      </span>
                    )}
                  </span>
                  {/* 신뢰도 배지 — solid 배경 */}
                  <span
                    className="ml-2 shrink-0 rounded px-2 py-0.5 text-xs font-medium text-white"
                    style={{
                      background:
                        confidencePercent >= 80
                          ? '#22c55e'
                          : confidencePercent >= 60
                            ? '#f59e0b'
                            : '#ef4444',
                    }}
                  >
                    {confidencePercent}% 신뢰도
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {sourceLabel}에서 발견
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mx-4 mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-4 py-3">
        <button
          onClick={handleSkip}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <XIcon className="text-gray-500" />
          건너뛰기
        </button>
        <button
          onClick={handleApply}
          disabled={isSubmitting || selected.size === 0}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#00A1E0] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0090c7] disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? (
            <LoaderIcon />
          ) : (
            <CheckIcon />
          )}
          선택 항목 적용 ({selected.size})
        </button>
      </div>
    </div>
  );
}
