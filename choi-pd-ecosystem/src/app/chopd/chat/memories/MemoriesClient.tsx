'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, ImageIcon } from 'lucide-react';
import { useSession } from '@/hooks/use-session';

// ── Types ──────────────────────────────────────────────────────────
interface Memory {
  id: string;
  category: 'education' | 'media' | 'meeting' | 'event' | 'other';
  summary: string;
  detail?: string;
  location?: string;
  imageUrls?: string[];
  createdAt: string; // ISO string
}

// ── Constants ──────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<
  Memory['category'],
  { label: string; color: string }
> = {
  education: { label: '교육', color: '#7C3AED' },
  media: { label: '미디어', color: '#DB2777' },
  meeting: { label: '미팅', color: '#2563EB' },
  event: { label: '행사', color: '#EA580C' },
  other: { label: '기타', color: '#6B7280' },
};

const CATEGORIES = ['all', ...Object.keys(CATEGORY_CONFIG)] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: '전체',
  education: '교육',
  media: '미디어',
  meeting: '미팅',
  event: '행사',
  other: '기타',
};

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

// ── Helpers ────────────────────────────────────────────────────────
function getRecentMonths(count: number) {
  const months: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
    months.push({ value, label });
  }
  return months;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  const months = Math.floor(days / 30);
  return `${months}개월 전`;
}

function groupByDate(memories: Memory[]): Map<string, Memory[]> {
  const map = new Map<string, Memory[]>();
  for (const m of memories) {
    const key = m.createdAt.slice(0, 10); // YYYY-MM-DD
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return map;
}

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_NAMES[d.getDay()]})`;
}

// ── Component ──────────────────────────────────────────────────────
export default function MemoriesClient() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const recentMonths = useMemo(() => getRecentMonths(6), []);

  // Auth guard
  useEffect(() => {
    if (!sessionLoading && !user) {
      router.push('/login');
    }
  }, [sessionLoading, user, router]);

  // Fetch memories
  const fetchMemories = useCallback(() => {
    if (sessionLoading || !user) return;

    const params = new URLSearchParams({ month });
    if (category !== 'all') params.set('category', category);

    setLoading(true);
    fetch(`/api/chat/memories?${params}`)
      .then((res) => (res.ok ? res.json() : { memories: [] }))
      .then((data) => setMemories(data.memories ?? []))
      .catch(() => setMemories([]))
      .finally(() => setLoading(false));
  }, [category, month, sessionLoading, user]);

  useEffect(() => {
    fetchMemories(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchMemories]);

  const grouped = useMemo(() => groupByDate(memories), [memories]);

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 h-14">
          <Link
            href="/chopd/chat"
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">활동 기록</h1>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="sticky top-14 z-20 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 space-y-3">
          {/* Category Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const isActive = category === cat;
              const color =
                cat === 'all' ? '#16325C' : CATEGORY_CONFIG[cat as Memory['category']].color;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
                  style={
                    isActive
                      ? { background: color, color: '#fff' }
                      : { background: '#F3F4F6', color: '#4B5563' }
                  }
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              );
            })}
          </div>

          {/* Month Picker */}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
          >
            {recentMonths.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]" />
          </div>
        ) : memories.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <ImageIcon className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-4">
              아직 기록된 활동이 없습니다.
              <br />
              챗봇에서 활동을 기록해보세요!
            </p>
            <Link
              href="/chopd/chat"
              className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ background: '#2563EB' }}
            >
              챗봇으로 이동
            </Link>
          </div>
        ) : (
          /* Timeline */
          <div className="space-y-6">
            {[...grouped.entries()].map(([dateKey, items]) => (
              <section key={dateKey}>
                {/* Date Header */}
                <div className="sticky top-[7.75rem] z-10 bg-gray-50 py-1">
                  <p className="text-sm font-medium text-gray-500">
                    {formatDateHeader(dateKey)}
                  </p>
                </div>

                {/* Cards with timeline line */}
                <div className="relative ml-4 mt-2 border-l-2 border-gray-200 pl-6 space-y-4">
                  {items.map((memory) => {
                    const d = new Date(memory.createdAt);
                    const cfg = CATEGORY_CONFIG[memory.category];
                    return (
                      <div key={memory.id} className="relative">
                        {/* Timeline dot */}
                        <div
                          className="absolute -left-[1.9rem] top-4 w-3 h-3 rounded-full border-2 border-white"
                          style={{ background: cfg.color }}
                        />

                        {/* Date indicator (left) + Card (right) */}
                        <div className="flex gap-3">
                          {/* Date indicator */}
                          <div className="shrink-0 w-10 pt-2 text-center">
                            <p className="text-lg font-bold text-gray-900 leading-tight">
                              {d.getDate()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {DAY_NAMES[d.getDay()]}
                            </p>
                          </div>

                          {/* Card */}
                          <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4">
                            {/* Badge */}
                            <span
                              className="inline-block px-2 py-0.5 rounded text-xs font-semibold mb-2"
                              style={{ background: cfg.color, color: '#fff' }}
                            >
                              {cfg.label}
                            </span>

                            {/* Summary */}
                            <p className="text-sm font-bold text-gray-900 mb-1">
                              {memory.summary}
                            </p>

                            {/* Location */}
                            {memory.location && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{memory.location}</span>
                              </div>
                            )}

                            {/* Detail */}
                            {memory.detail && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {memory.detail}
                              </p>
                            )}

                            {/* Image Thumbnails */}
                            {memory.imageUrls && memory.imageUrls.length > 0 && (
                              <div className="flex gap-2 mb-2 overflow-x-auto">
                                {memory.imageUrls.slice(0, 4).map((url, i) => (
                                  <img
                                    key={i}
                                    src={url}
                                    alt={`활동 이미지 ${i + 1}`}
                                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0"
                                  />
                                ))}
                                {memory.imageUrls.length > 4 && (
                                  <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-medium text-gray-500">
                                      +{memory.imageUrls.length - 4}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Timestamp */}
                            <p className="text-xs text-gray-400">
                              {relativeTime(memory.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
