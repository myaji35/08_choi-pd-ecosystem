'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Download,
  CreditCard,
  Users,
  Activity,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

type ReportType = 'payments' | 'distributors' | 'activity';

const REPORTS: { type: ReportType; title: string; description: string; icon: typeof Download }[] = [
  {
    type: 'payments',
    title: '결제 내역',
    description: '기간별 결제 기록 (금액, 상태, 수단, 거래ID)',
    icon: CreditCard,
  },
  {
    type: 'distributors',
    title: '수요자 전체',
    description: '등록된 수요자 전체 목록과 누적 매출',
    icon: Users,
  },
  {
    type: 'activity',
    title: '활동 로그',
    description: '수요자 활동 로그 (로그인, 다운로드, 결제 등, 최대 5000건)',
    icon: Activity,
  },
];

export default function AdminReportsPage() {
  const router = useRouter();
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [downloadingType, setDownloadingType] = useState<ReportType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (type: ReportType) => {
    setDownloadingType(type);
    setError(null);
    try {
      const params = new URLSearchParams({ type });
      if (from) params.set('from', new Date(from).toISOString());
      if (to) params.set('to', new Date(to).toISOString());

      const res = await fetch(`/api/admin/reports/download?${params.toString()}`);
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || `다운로드 실패 (${res.status})`);
      }

      const blob = await res.blob();
      const disposition = res.headers.get('content-disposition') || '';
      const match = /filename="([^"]+)"/.exec(disposition);
      const filename = match ? match[1] : `${type}-report.csv`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '다운로드 실패');
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          대시보드
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">리포트 다운로드</h1>
          <p className="text-sm text-gray-600 mt-0.5">필요한 데이터를 CSV로 내보냅니다</p>
        </div>
      </div>

      {/* 기간 필터 */}
      <Card className="border-gray-200 mb-6">
        <CardHeader>
          <CardTitle className="text-base">기간 필터</CardTitle>
          <CardDescription>비워두면 전체 기간으로 내보내집니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="from" className="text-xs font-semibold text-gray-600 mb-1.5 block">
                시작일
              </Label>
              <Input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="to" className="text-xs font-semibold text-gray-600 mb-1.5 block">
                종료일
              </Label>
              <Input
                id="to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* 리포트 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          const isDownloading = downloadingType === r.type;
          return (
            <Card key={r.type} className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-5 w-5 text-blue-600" />
                  {r.title}
                </CardTitle>
                <CardDescription>{r.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleDownload(r.type)}
                  disabled={isDownloading}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-1" />
                  {isDownloading ? '다운로드 중...' : 'CSV 다운로드'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 심화 분석 링크 */}
      <Card className="mt-8 border-gray-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            심화 분석 대시보드
          </CardTitle>
          <CardDescription>차트와 실시간 지표는 통계 대시보드를 확인하세요</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/analytics">통계 대시보드</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/activity-log">활동 로그</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/payments">결제 내역</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
