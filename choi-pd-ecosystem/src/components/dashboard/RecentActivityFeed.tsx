'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, LogIn, Download, CreditCard, MessageSquare, FileText } from 'lucide-react';

interface ActivityRow {
  id: number;
  distributorId: number;
  activityType: string;
  description: string;
  createdAt: string;
  distributor?: { name?: string; email?: string } | null;
}

const iconMap: Record<string, typeof Activity> = {
  login: LogIn,
  download: Download,
  payment: CreditCard,
  support_request: MessageSquare,
  content_access: FileText,
};

const typeLabel: Record<string, string> = {
  login: '로그인',
  download: '다운로드',
  payment: '결제',
  support_request: '지원 요청',
  content_access: '콘텐츠 열람',
};

function formatRelative(dateStr: string) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return date.toLocaleDateString('ko-KR');
}

export default function RecentActivityFeed({
  title = '최근 활동',
  description = '수요자 활동 최근 10건',
  limit = 10,
  moreHref = '/admin/activity-log',
}: {
  title?: string;
  description?: string;
  limit?: number;
  moreHref?: string;
}) {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/activity-log?limit=${limit}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list: ActivityRow[] = Array.isArray(data.activities)
          ? data.activities
          : Array.isArray(data.logs)
            ? data.logs
            : Array.isArray(data.data)
              ? data.data
              : [];
        if (!cancelled) setRows(list.slice(0, limit));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '불러오기 실패');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return (
    <Card className="border-gray-200">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href={moreHref}>전체 보기</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 text-center text-sm text-gray-500">불러오는 중...</div>
        ) : error ? (
          <div className="py-6 text-center text-sm text-red-600">{error}</div>
        ) : rows.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-500">
            아직 활동이 없습니다.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {rows.map((row) => {
              const Icon = iconMap[row.activityType] || Activity;
              const label = typeLabel[row.activityType] || row.activityType;
              const who = row.distributor?.name || `수요자 #${row.distributorId}`;
              return (
                <li key={row.id} className="flex items-start gap-3 py-2.5 text-sm">
                  <Icon className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900">
                      <span className="font-medium">{who}</span>
                      <span className="text-gray-500"> · {label}</span>
                    </div>
                    <div className="text-xs text-gray-500 truncate">{row.description}</div>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {formatRelative(row.createdAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
