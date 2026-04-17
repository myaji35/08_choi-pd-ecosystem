'use client';

import { useState, useMemo } from 'react';

type Status = 'pending' | 'contacted' | 'closed';
type Type = 'b2b' | 'contact';

interface Row {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  type: Type;
  status: Status | null;
  createdAt: string | null;
}

const STATUS_LABEL: Record<Status, string> = {
  pending: '대기',
  contacted: '연락완료',
  closed: '종료',
};

const STATUS_COLOR: Record<Status, string> = {
  pending: '#D32F2F',
  contacted: '#F57C00',
  closed: '#616161',
};

const PAGE_SIZE = 20;

function csvEscape(value: string | null | undefined) {
  if (value == null) return '';
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function InquiriesClient({ initialRows }: { initialRows: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [filterType, setFilterType] = useState<Type | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((r) => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (filterType !== 'all' && r.type !== filterType) return false;
      if (q) {
        const hit =
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          (r.phone || '').toLowerCase().includes(q) ||
          r.message.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [rows, filterStatus, filterType, searchQuery]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const exportCsv = () => {
    const columns = ['id', 'type', 'status', 'name', 'email', 'phone', 'message', 'createdAt'];
    const header = columns.join(',');
    const body = filtered
      .map((r) =>
        [
          r.id,
          r.type,
          r.status ?? 'pending',
          csvEscape(r.name),
          csvEscape(r.email),
          csvEscape(r.phone),
          csvEscape(r.message),
          r.createdAt ?? '',
        ].join(',')
      )
      .join('\n');
    const csv = `${header}\n${body}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  async function updateStatus(id: number, status: Status) {
    setUpdating(id);
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      } else {
        alert(`상태 변경 실패: ${data.error ?? 'unknown'}`);
      }
    } catch (err) {
      alert(`네트워크 오류: ${(err as Error).message}`);
    } finally {
      setUpdating(null);
    }
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          placeholder="이름, 이메일, 전화, 내용 검색"
          className="w-full sm:w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
        />
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as Status | 'all');
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
        >
          <option value="all">상태 전체</option>
          <option value="pending">대기</option>
          <option value="contacted">연락완료</option>
          <option value="closed">종료</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value as Type | 'all');
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
        >
          <option value="all">유형 전체</option>
          <option value="b2b">B2B/기관</option>
          <option value="contact">일반</option>
        </select>
        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          CSV 내보내기
        </button>
        <div className="ml-auto text-sm text-gray-600">총 {filtered.length}건</div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
          조건에 맞는 문의가 없습니다.
        </div>
      ) : (
        <ul className="space-y-2">
          {pagedRows.map((r) => {
            const st = (r.status ?? 'pending') as Status;
            return (
              <li key={r.id} className="rounded-lg border border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span
                    className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                    style={{ background: STATUS_COLOR[st] }}
                  >
                    {STATUS_LABEL[st]}
                  </span>
                  <span
                    className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                    style={{ background: r.type === 'b2b' ? '#00A1E0' : '#616161' }}
                  >
                    {r.type === 'b2b' ? 'B2B' : '일반'}
                  </span>
                  <span className="font-semibold text-gray-900">{r.name}</span>
                  <span className="text-sm text-gray-600">{r.email}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString('ko-KR') : '-'}
                  </span>
                </button>

                {expanded === r.id && (
                  <div className="border-t border-gray-200 px-4 py-4">
                    <dl className="mb-3 grid grid-cols-[80px_1fr] gap-y-1 text-sm">
                      <dt className="text-gray-500">전화</dt>
                      <dd className="text-gray-900">{r.phone || '-'}</dd>
                      <dt className="text-gray-500">내용</dt>
                      <dd className="whitespace-pre-wrap text-gray-900">{r.message}</dd>
                    </dl>
                    <div className="flex flex-wrap gap-2">
                      {(['pending', 'contacted', 'closed'] as Status[]).map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={updating === r.id || st === s}
                          onClick={() => updateStatus(r.id, s)}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                        >
                          {st === s ? `현재: ${STATUS_LABEL[s]}` : `→ ${STATUS_LABEL[s]}`}
                        </button>
                      ))}
                      <a
                        href={`mailto:${r.email}`}
                        className="ml-auto rounded-lg bg-[#00A1E0] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0082B3]"
                      >
                        이메일 회신
                      </a>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} / {filtered.length}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              이전
            </button>
            <span className="flex items-center px-3 text-gray-700">
              {currentPage} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage >= pageCount}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
