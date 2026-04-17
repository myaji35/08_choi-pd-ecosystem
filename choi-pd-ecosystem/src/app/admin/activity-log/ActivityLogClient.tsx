'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Activity,
  LogIn,
  FileText,
  Download,
  CreditCard,
  HelpCircle,
} from 'lucide-react';

interface ActivityLog {
  log: {
    id: number;
    distributorId: number;
    activityType: 'login' | 'content_access' | 'download' | 'payment' | 'support_request';
    description: string;
    metadata: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
  };
  distributor: {
    id: number;
    name: string;
    email: string;
  } | null;
}

const activityConfig = {
  login: { label: '로그인', icon: LogIn, color: 'bg-[#00A1E0] text-white' },
  content_access: { label: '콘텐츠 접근', icon: FileText, color: 'bg-[#10B981] text-white' },
  download: { label: '다운로드', icon: Download, color: 'bg-[#7C3AED] text-white' },
  payment: { label: '결제', icon: CreditCard, color: 'bg-[#F59E0B] text-white' },
  support_request: { label: '문의', icon: HelpCircle, color: 'bg-[#EA580C] text-white' },
};

export default function ActivityLogPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 50;

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const offset = page * limit;
      const response = await fetch(`/api/admin/activity-log?limit=${limit}&offset=${offset}`);
      const data = await response.json();

      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const from = fromDate ? new Date(fromDate).getTime() : null;
    const to = toDate ? new Date(toDate).getTime() + 86400000 : null;
    return logs.filter((row) => {
      const log = row.log;
      if (typeFilter !== 'all' && log.activityType !== typeFilter) return false;
      if (from || to) {
        const t = new Date(log.createdAt).getTime();
        if (from && t < from) return false;
        if (to && t > to) return false;
      }
      if (q) {
        const hit =
          (log.description || '').toLowerCase().includes(q) ||
          (row.distributor?.name || '').toLowerCase().includes(q) ||
          (row.distributor?.email || '').toLowerCase().includes(q) ||
          (log.ipAddress || '').includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [logs, typeFilter, fromDate, toDate, searchQuery]);

  const exportCsv = () => {
    const esc = (s: string | null | undefined) =>
      s == null ? '' : /[",\n]/.test(String(s)) ? `"${String(s).replace(/"/g, '""')}"` : String(s);
    const header = 'id,distributorId,distributorName,activityType,description,ipAddress,createdAt';
    const body = filteredLogs
      .map((r) =>
        [
          r.log.id,
          r.log.distributorId,
          esc(r.distributor?.name || ''),
          r.log.activityType,
          esc(r.log.description),
          esc(r.log.ipAddress),
          new Date(r.log.createdAt).toISOString(),
        ].join(',')
      )
      .join('\n');
    const blob = new Blob([`${header}\n${body}\n`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getActivityBadge = (type: ActivityLog['log']['activityType']) => {
    const config = activityConfig[type];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-[#F3F2F2]">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#16325C" }}>활동 로그</h1>
            <p className="text-sm text-gray-600">수요자 활동 내역을 확인합니다</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* 필터 바 */}
        <Card className="mb-4 border-gray-200">
          <CardContent className="py-4">
            <div className="grid gap-3 md:grid-cols-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">검색</label>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="설명/수요자/IP"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">활동 유형</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                >
                  <option value="all">전체</option>
                  <option value="login">로그인</option>
                  <option value="content_access">콘텐츠 접근</option>
                  <option value="download">다운로드</option>
                  <option value="payment">결제</option>
                  <option value="support_request">문의</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">시작일</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">종료일</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={exportCsv} disabled={filteredLogs.length === 0}>
                CSV 다운로드 ({filteredLogs.length}건)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              최근 활동 내역
            </CardTitle>
            <CardDescription>
              최근 {limit}개의 활동 로그 (페이지 {page + 1})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">로딩 중...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-8 text-center text-gray-500">활동 로그가 없습니다</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>수요자</TableHead>
                        <TableHead>활동 유형</TableHead>
                        <TableHead>설명</TableHead>
                        <TableHead>IP 주소</TableHead>
                        <TableHead>발생 시간</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map(({ log, distributor }) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs">#{log.id}</TableCell>
                          <TableCell>
                            {distributor ? (
                              <div>
                                <div className="font-medium">{distributor.name}</div>
                                <div className="text-xs text-gray-500">{distributor.email}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">삭제된 사용자</span>
                            )}
                          </TableCell>
                          <TableCell>{getActivityBadge(log.activityType)}</TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate">{log.description}</div>
                            {log.metadata && (
                              <div className="text-xs text-gray-500 mt-1 truncate">
                                {log.metadata}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {log.ipAddress || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(log.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                  >
                    이전
                  </Button>
                  <span className="text-sm text-gray-600">페이지 {page + 1}</span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={logs.length < limit}
                  >
                    다음
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
