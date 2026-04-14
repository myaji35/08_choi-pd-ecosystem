'use client';

import { useState, useEffect } from 'react';
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
  login: { label: '로그인', icon: LogIn, color: 'bg-blue-100 text-blue-800' },
  content_access: { label: '콘텐츠 접근', icon: FileText, color: 'bg-green-100 text-green-800' },
  download: { label: '다운로드', icon: Download, color: 'bg-purple-100 text-purple-800' },
  payment: { label: '결제', icon: CreditCard, color: 'bg-yellow-100 text-yellow-800' },
  support_request: { label: '문의', icon: HelpCircle, color: 'bg-orange-100 text-orange-800' },
};

export default function ActivityLogPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">활동 로그</h1>
            <p className="text-sm text-gray-600">수요자 활동 내역을 확인합니다</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
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
            ) : logs.length === 0 ? (
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
                      {logs.map(({ log, distributor }) => (
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
