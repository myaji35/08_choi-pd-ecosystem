'use client';

/**
 * ISS-067: Admin Reviews Client
 * 상태 필터 탭 + 테이블 + 드롭다운으로 상태 변경.
 */

import { useMemo, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';

type Status = 'new' | 'triaged' | 'responded' | 'archived';

export interface AdminReviewRow {
  id: number;
  memberSlug: string | null;
  reviewerName: string;
  rating: number;
  content: string | null;
  status: Status;
  source: 'public_form' | 'admin_submitted' | null;
  createdAt: string | null;
}

const STATUS_TABS: { key: 'all' | Status; label: string; color: string }[] = [
  { key: 'all', label: '전체', color: '#16325C' },
  { key: 'new', label: '신규', color: '#EA580C' },
  { key: 'triaged', label: '확인', color: '#00A1E0' },
  { key: 'responded', label: '답변', color: '#10B981' },
  { key: 'archived', label: '보관', color: '#6B7280' },
];

const STATUS_LABELS: Record<Status, string> = {
  new: '신규',
  triaged: '확인',
  responded: '답변',
  archived: '보관',
};

const STATUS_COLORS: Record<Status, string> = {
  new: '#EA580C',
  triaged: '#00A1E0',
  responded: '#10B981',
  archived: '#6B7280',
};

interface Props {
  initialRows: AdminReviewRow[];
}

export default function ReviewsClient({ initialRows }: Props) {
  const [rows, setRows] = useState<AdminReviewRow[]>(initialRows);
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [updating, setUpdating] = useState<number | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length, new: 0, triaged: 0, responded: 0, archived: 0 };
    for (const r of rows) c[r.status] = (c[r.status] || 0) + 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    if (filter === 'all') return rows;
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  async function changeStatus(id: number, newStatus: Status) {
    const prev = rows;
    // 낙관적 업데이트
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    setUpdating(id);

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        // 롤백
        setRows(prev);
        const data = await res.json().catch(() => ({} as { error?: string }));
        alert(data?.error || '상태 변경에 실패했습니다');
      }
    } catch {
      setRows(prev);
      alert('네트워크 오류가 발생했습니다');
    } finally {
      setUpdating(null);
    }
  }

  function formatDate(iso: string | null): string {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  return (
    <div className="space-y-4">
      {/* 상태 필터 탭 */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="리뷰 상태 필터">
        {STATUS_TABS.map((tab) => {
          const isActive = filter === tab.key;
          const count = counts[tab.key] ?? 0;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setFilter(tab.key)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                isActive
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
              style={isActive ? { background: tab.color } : undefined}
            >
              {tab.label}
              <span
                className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full text-xs font-bold text-white"
                style={{ background: isActive ? 'rgba(255,255,255,0.25)' : tab.color }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 테이블 */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Star className="w-10 h-10 mx-auto text-gray-300" strokeWidth={2} fill="none" />
            <p className="mt-3 text-sm font-semibold text-gray-600">아직 리뷰가 없습니다</p>
            <p className="mt-1 text-xs text-gray-400">
              고객이 리뷰를 남기면 이곳에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">별점</th>
                  <th className="px-4 py-3 text-left font-semibold">작성자</th>
                  <th className="px-4 py-3 text-left font-semibold">내용</th>
                  <th className="px-4 py-3 text-left font-semibold">페이지</th>
                  <th className="px-4 py-3 text-left font-semibold">상태</th>
                  <th className="px-4 py-3 text-left font-semibold">날짜</th>
                  <th className="px-4 py-3 text-left font-semibold">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`w-4 h-4 ${n <= r.rating ? 'text-amber-400' : 'text-gray-200'}`}
                            strokeWidth={2}
                            fill={n <= r.rating ? 'currentColor' : 'none'}
                          />
                        ))}
                        <span className="ml-1 text-xs font-semibold text-gray-700">{r.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {r.reviewerName}
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-md">
                      <p className="line-clamp-2">{r.content || '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {r.memberSlug ? `/p/${r.memberSlug}` : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ background: STATUS_COLORS[r.status] }}
                      >
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={r.status}
                        onChange={(e) => changeStatus(r.id, e.target.value as Status)}
                        disabled={updating === r.id}
                        className="bg-white px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0] disabled:opacity-50"
                        aria-label="상태 변경"
                      >
                        <option value="new">신규</option>
                        <option value="triaged">확인</option>
                        <option value="responded">답변</option>
                        <option value="archived">보관</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <MessageSquare className="w-3.5 h-3.5" strokeWidth={2} />
        <span>
          총 <strong className="text-gray-900">{rows.length}</strong>건 리뷰 ·
          현재 보기 <strong className="text-gray-900">{filtered.length}</strong>건
        </span>
      </div>
    </div>
  );
}
