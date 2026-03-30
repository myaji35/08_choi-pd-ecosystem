'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ── Types ───────────────────────────────────────────────
interface ScheduledPost {
  id: number;
  contentType: 'posts' | 'courses' | 'works';
  contentId: number;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  accountId: number;
  message: string;
  imageUrl: string | null;
  link: string | null;
  scheduledAt: string;
  status: 'pending' | 'publishing' | 'published' | 'failed' | 'cancelled';
  publishedAt: string | null;
  error: string | null;
  retryCount: number;
  createdAt: string;
  account?: { id: number; platform: string; accountName: string };
}

interface SnsAccount {
  id: number;
  platform: string;
  accountName: string;
  isActive: boolean;
}

// ── Constants ───────────────────────────────────────────
const CHANNEL_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  instagram: { label: '인스타그램', color: '#E4405F', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
  twitter:   { label: '트위터(X)', color: '#1DA1F2', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
  facebook:  { label: '카카오', color: '#FEE500', icon: 'M12 2C6.48 2 2 5.82 2 10.5c0 2.95 1.96 5.54 4.88 7.01l-.72 2.63c-.06.22.18.4.37.28l3.08-2.05c.78.12 1.57.18 2.39.18 5.52 0 10-3.82 10-8.55S17.52 2 12 2z' },
  linkedin:  { label: '블로그', color: '#03C75A', icon: 'M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:    { label: '대기', color: '#F59E0B' },
  publishing: { label: '발행중', color: '#3B82F6' },
  published:  { label: '발행됨', color: '#22C55E' },
  failed:     { label: '실패', color: '#EF4444' },
  cancelled:  { label: '취소', color: '#6B7280' },
};

// ── Utility ─────────────────────────────────────────────
function getWeekDates(baseDate: Date): Date[] {
  const start = new Date(baseDate);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day; // 월요일 시작
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' });
}

function formatDateFull(date: Date): string {
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// ── Feather-style SVG Icon Components ───────────────────
function CalendarIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ListIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function PlusIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ChevronLeftIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function ClockIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CheckCircleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AlertCircleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function SendIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function ArrowLeftIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

// ── Channel SVG Icon ────────────────────────────────────
function ChannelIcon({ platform, size = 16 }: { platform: string; size?: number }) {
  const cfg = CHANNEL_CONFIG[platform];
  if (!cfg) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={cfg.color} xmlns="http://www.w3.org/2000/svg">
      <path d={cfg.icon} />
    </svg>
  );
}

// ── Status Badge ────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: cfg.color, color: 'white' }}
    >
      {status === 'pending' && <ClockIcon className="h-3 w-3" />}
      {status === 'published' && <CheckCircleIcon className="h-3 w-3" />}
      {status === 'failed' && <AlertCircleIcon className="h-3 w-3" />}
      {status === 'publishing' && <SendIcon className="h-3 w-3" />}
      {cfg.label}
    </span>
  );
}

// ── Post Card (Calendar) ────────────────────────────────
function PostCard({ post, onClick }: { post: ScheduledPost; onClick: () => void }) {
  const channel = CHANNEL_CONFIG[post.platform];
  const time = formatTime(new Date(post.scheduledAt));
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-2 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <ChannelIcon platform={post.platform} size={14} />
        <span className="text-xs font-semibold text-gray-700">{time}</span>
        <StatusBadge status={post.status || 'pending'} />
      </div>
      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{post.message}</p>
    </button>
  );
}

// ═══════════════════════════════════════════════════════
// ── Main Component ──────────────────────────────────────
// ═══════════════════════════════════════════════════════
export default function ScheduleDashboardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [accounts, setAccounts] = useState<SnsAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View toggle: 'calendar' | 'list'
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Calendar week base
  const [weekBase, setWeekBase] = useState(() => new Date());
  const weekDates = useMemo(() => getWeekDates(weekBase), [weekBase]);

  // Status filter
  const [statusFilter, setStatusFilter] = useState('all');

  // Add / detail dialog
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [detailPost, setDetailPost] = useState<ScheduledPost | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New post form
  const [form, setForm] = useState({
    contentType: 'posts' as 'posts' | 'courses' | 'works',
    contentId: '1',
    platform: 'instagram' as 'facebook' | 'instagram' | 'twitter' | 'linkedin',
    accountId: '',
    message: '',
    imageUrl: '',
    link: '',
    scheduledAt: '',
  });

  // Responsive: auto-switch to list on mobile
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setViewMode('list');
    };
    handler(mql);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // ── Data Fetching ───────────────────────────────────
  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const url = `/api/pd/scheduled-posts${params.toString() ? `?${params}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setPosts(data.posts);
    } catch (err) {
      console.error('Failed to fetch scheduled posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/pd/sns-accounts?activeOnly=true');
      const data = await res.json();
      if (data.success) setAccounts(data.accounts);
    } catch (err) {
      console.error('Failed to fetch SNS accounts:', err);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  // ── Submit Handler ──────────────────────────────────
  const handleSubmit = async () => {
    if (!form.message.trim() || !form.scheduledAt || !form.accountId) return;
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/pd/scheduled-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          contentId: parseInt(form.contentId) || 1,
          accountId: parseInt(form.accountId),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddOpen(false);
        resetForm();
        fetchPosts();
      } else {
        alert('예약 생성 실패: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('예약 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      contentType: 'posts',
      contentId: '1',
      platform: 'instagram',
      accountId: '',
      message: '',
      imageUrl: '',
      link: '',
      scheduledAt: '',
    });
  };

  // ── Week Navigation ─────────────────────────────────
  const prevWeek = () => {
    const d = new Date(weekBase);
    d.setDate(d.getDate() - 7);
    setWeekBase(d);
  };
  const nextWeek = () => {
    const d = new Date(weekBase);
    d.setDate(d.getDate() + 7);
    setWeekBase(d);
  };
  const goToday = () => setWeekBase(new Date());

  // ── Filtered Posts ──────────────────────────────────
  const filteredPosts = useMemo(() => {
    if (statusFilter === 'all') return posts;
    return posts.filter(p => p.status === statusFilter);
  }, [posts, statusFilter]);

  // ── Posts grouped by day (for calendar) ─────────────
  const postsByDay = useMemo(() => {
    const map: Record<string, ScheduledPost[]> = {};
    weekDates.forEach(d => {
      map[d.toISOString().slice(0, 10)] = [];
    });
    filteredPosts.forEach(p => {
      const key = new Date(p.scheduledAt).toISOString().slice(0, 10);
      if (map[key]) map[key].push(p);
    });
    // sort each day by time
    Object.values(map).forEach(arr => arr.sort((a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    ));
    return map;
  }, [filteredPosts, weekDates]);

  // ── Stats ───────────────────────────────────────────
  const stats = useMemo(() => ({
    total: posts.length,
    pending: posts.filter(p => p.status === 'pending').length,
    published: posts.filter(p => p.status === 'published').length,
    failed: posts.filter(p => p.status === 'failed').length,
  }), [posts]);

  const today = new Date();

  // ── Time Slots for Calendar ─────────────────────────
  const TIME_SLOTS = [6, 8, 10, 12, 14, 16, 18, 20, 22];

  return (
    <div className="min-h-screen bg-[#F3F2F2]">
      {/* ── Header ───────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="container flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold" style={{ color: '#16325C' }}>예약 발행</h1>
              <p className="text-xs text-gray-500">SNS 콘텐츠 예약 관리</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle - desktop only */}
            <div className="hidden md:flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-[#16325C] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                캘린더
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#16325C] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ListIcon className="h-3.5 w-3.5" />
                목록
              </button>
            </div>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-28 h-8 text-xs border-gray-300 bg-white">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="pending">대기</SelectItem>
                <SelectItem value="published">발행됨</SelectItem>
                <SelectItem value="failed">실패</SelectItem>
              </SelectContent>
            </Select>

            {/* New post */}
            <Button
              onClick={() => setIsAddOpen(true)}
              className="h-8 text-xs font-semibold text-white"
              style={{ background: '#00A1E0' }}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              새 예약
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 px-4 md:px-6 space-y-6">
        {/* ── KPI Cards ──────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '전체 예약', value: stats.total, icon: <CalendarIcon className="h-4 w-4" />, color: '#16325C' },
            { label: '대기중', value: stats.pending, icon: <ClockIcon />, color: '#F59E0B' },
            { label: '발행됨', value: stats.published, icon: <CheckCircleIcon />, color: '#22C55E' },
            { label: '실패', value: stats.failed, icon: <AlertCircleIcon />, color: '#EF4444' },
          ].map((kpi) => (
            <Card key={kpi.label} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500">{kpi.label}</span>
                  <span style={{ color: kpi.color }}>{kpi.icon}</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Calendar View ──────────────────────────── */}
        {viewMode === 'calendar' && (
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold" style={{ color: '#16325C' }}>
                  주간 캘린더
                </CardTitle>
                <div className="flex items-center gap-2">
                  <button onClick={prevWeek} className="p-1 rounded hover:bg-gray-100 text-gray-500">
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={goToday}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold border border-gray-300 hover:bg-gray-50 text-gray-600"
                  >
                    오늘
                  </button>
                  <button onClick={nextWeek} className="p-1 rounded hover:bg-gray-100 text-gray-500">
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#00A1E0' }} />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[700px]">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b border-gray-200">
                      {weekDates.map((d) => {
                        const isToday = isSameDay(d, today);
                        const key = d.toISOString().slice(0, 10);
                        const count = postsByDay[key]?.length || 0;
                        return (
                          <div
                            key={key}
                            className={`px-3 py-2.5 text-center border-r border-gray-200 last:border-r-0 ${
                              isToday ? 'bg-blue-50' : 'bg-gray-50'
                            }`}
                          >
                            <div className={`text-xs font-semibold ${isToday ? 'text-[#00A1E0]' : 'text-gray-500'}`}>
                              {formatDateShort(d)}
                            </div>
                            {count > 0 && (
                              <span
                                className="inline-block mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white"
                                style={{ background: '#00A1E0' }}
                              >
                                {count}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Time Slots */}
                    {TIME_SLOTS.map((hour) => (
                      <div key={hour} className="grid grid-cols-7 border-b border-gray-100 min-h-[80px]">
                        {weekDates.map((d) => {
                          const key = d.toISOString().slice(0, 10);
                          const dayPosts = (postsByDay[key] || []).filter(p => {
                            const h = new Date(p.scheduledAt).getHours();
                            const nextSlotIdx = TIME_SLOTS.indexOf(hour) + 1;
                            const nextHour = nextSlotIdx < TIME_SLOTS.length ? TIME_SLOTS[nextSlotIdx] : 24;
                            return h >= hour && h < nextHour;
                          });
                          const isToday = isSameDay(d, today);
                          return (
                            <div
                              key={`${key}-${hour}`}
                              className={`px-1.5 py-1.5 border-r border-gray-100 last:border-r-0 relative ${
                                isToday ? 'bg-blue-50/30' : ''
                              }`}
                            >
                              {/* Time label on first column */}
                              {d === weekDates[0] && (
                                <span className="absolute -left-0 top-1 text-[10px] text-gray-400 font-mono pl-0.5">
                                  {String(hour).padStart(2, '0')}:00
                                </span>
                              )}
                              <div className="space-y-1 mt-3">
                                {dayPosts.map(post => (
                                  <PostCard
                                    key={post.id}
                                    post={post}
                                    onClick={() => setDetailPost(post)}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── List View ──────────────────────────────── */}
        {viewMode === 'list' && (
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold" style={{ color: '#16325C' }}>
                예약 목록
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#00A1E0' }} />
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-16">
                  <CalendarIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">예약된 포스트가 없습니다</p>
                  <Button
                    onClick={() => setIsAddOpen(true)}
                    className="mt-4 text-xs text-white"
                    style={{ background: '#00A1E0' }}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    첫 예약 만들기
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs font-semibold text-gray-600">채널</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600">콘텐츠</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600 hidden md:table-cell">계정</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600">예약 시간</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600">상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPosts.map((post) => (
                        <TableRow
                          key={post.id}
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => setDetailPost(post)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ChannelIcon platform={post.platform} size={18} />
                              <span className="text-sm font-medium text-gray-700">
                                {CHANNEL_CONFIG[post.platform]?.label || post.platform}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] md:max-w-xs">
                            <p className="text-sm text-gray-900 truncate">{post.message}</p>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm text-gray-600">
                              {post.account?.accountName || `ID: ${post.accountId}`}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-700">
                              {formatDateFull(new Date(post.scheduledAt))}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={post.status || 'pending'} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* ── Detail Dialog ────────────────────────────── */}
      <Dialog open={!!detailPost} onOpenChange={(open) => !open && setDetailPost(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#16325C' }}>
              <ChannelIcon platform={detailPost?.platform || 'instagram'} size={20} />
              예약 상세
            </DialogTitle>
          </DialogHeader>
          {detailPost && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">채널:</span>
                <span className="text-sm font-medium">{CHANNEL_CONFIG[detailPost.platform]?.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">상태:</span>
                <StatusBadge status={detailPost.status || 'pending'} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">예약 시간:</span>
                <span className="text-sm">{formatDateFull(new Date(detailPost.scheduledAt))}</span>
              </div>
              {detailPost.account && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">계정:</span>
                  <span className="text-sm">{detailPost.account.accountName}</span>
                </div>
              )}
              <div>
                <span className="text-xs font-semibold text-gray-500 block mb-1">콘텐츠:</span>
                <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3 border border-gray-200 leading-relaxed">
                  {detailPost.message}
                </p>
              </div>
              {detailPost.imageUrl && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 block mb-1">이미지:</span>
                  <p className="text-sm text-blue-600 break-all">{detailPost.imageUrl}</p>
                </div>
              )}
              {detailPost.link && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 block mb-1">링크:</span>
                  <a href={detailPost.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline break-all">
                    {detailPost.link}
                  </a>
                </div>
              )}
              {detailPost.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <span className="text-xs font-semibold text-red-600 block mb-1">오류:</span>
                  <p className="text-sm text-red-700">{detailPost.error}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailPost(null)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Dialog ───────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#16325C' }}>새 예약 발행</DialogTitle>
            <DialogDescription>SNS 콘텐츠를 예약 발행합니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Channel Selection - Visual Cards */}
            <div>
              <Label className="block text-xs font-semibold text-gray-600 mb-1.5">채널 선택</Label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(CHANNEL_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, platform: key as typeof form.platform, accountId: '' }))}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-all ${
                      form.platform === key
                        ? 'border-[#00A1E0] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <ChannelIcon platform={key} size={24} />
                    <span className="text-[10px] font-semibold text-gray-600">{cfg.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Account */}
            <div>
              <Label className="block text-xs font-semibold text-gray-600 mb-1.5">계정</Label>
              <Select
                value={form.accountId}
                onValueChange={(v) => setForm(f => ({ ...f, accountId: v }))}
              >
                <SelectTrigger className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]">
                  <SelectValue placeholder="계정 선택" />
                </SelectTrigger>
                <SelectContent>
                  {accounts
                    .filter(a => a.platform === form.platform)
                    .map(a => (
                      <SelectItem key={a.id} value={a.id.toString()}>
                        {a.accountName}
                      </SelectItem>
                    ))}
                  {accounts.filter(a => a.platform === form.platform).length === 0 && (
                    <SelectItem value="__none" disabled>
                      연결된 계정이 없습니다
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Content Type + ID */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="block text-xs font-semibold text-gray-600 mb-1.5">콘텐츠 타입</Label>
                <Select
                  value={form.contentType}
                  onValueChange={(v: typeof form.contentType) => setForm(f => ({ ...f, contentType: v }))}
                >
                  <SelectTrigger className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="posts">게시글</SelectItem>
                    <SelectItem value="courses">강좌</SelectItem>
                    <SelectItem value="works">작품</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="block text-xs font-semibold text-gray-600 mb-1.5">콘텐츠 ID</Label>
                <Input
                  type="number"
                  value={form.contentId}
                  onChange={(e) => setForm(f => ({ ...f, contentId: e.target.value }))}
                  placeholder="1"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <Label className="block text-xs font-semibold text-gray-600 mb-1.5">콘텐츠 내용</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="발행할 콘텐츠 내용을 입력하세요..."
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
              />
              <p className="text-xs text-gray-400 mt-1">{form.message.length}자</p>
            </div>

            {/* Image + Link */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label className="block text-xs font-semibold text-gray-600 mb-1.5">이미지 URL (선택)</Label>
                <Input
                  value={form.imageUrl}
                  onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
                />
              </div>
              <div>
                <Label className="block text-xs font-semibold text-gray-600 mb-1.5">링크 URL (선택)</Label>
                <Input
                  value={form.link}
                  onChange={(e) => setForm(f => ({ ...f, link: e.target.value }))}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
                />
              </div>
            </div>

            {/* Schedule date/time */}
            <div>
              <Label className="block text-xs font-semibold text-gray-600 mb-1.5">예약 시간</Label>
              <Input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsAddOpen(false); resetForm(); }}>
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !form.message.trim() || !form.scheduledAt || !form.accountId}
              className="text-white font-semibold"
              style={{ background: '#00A1E0' }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                  예약 중...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <SendIcon className="h-3.5 w-3.5" />
                  예약하기
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
