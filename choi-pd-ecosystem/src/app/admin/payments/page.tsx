'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Search,
} from 'lucide-react';

interface Payment {
  id: number;
  distributorId: number;
  planId: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string | null;
  transactionId: string | null;
  paidAt: Date | null;
  metadata: string | null;
  createdAt: Date;
}

const statusConfig = {
  pending: { label: '대기중', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  completed: { label: '완료', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  failed: { label: '실패', color: 'bg-red-100 text-red-800', icon: XCircle },
  refunded: { label: '환불', color: 'bg-gray-100 text-gray-800', icon: DollarSign },
};

const PAGE_SIZE = 20;

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const url = statusFilter !== 'all'
        ? `/api/admin/payments?status=${statusFilter}`
        : '/api/admin/payments';
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPayments(data.payments);
        setPage(1);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCsvExport = () => {
    const params = new URLSearchParams({ type: 'payments' });
    if (fromDate) params.set('from', new Date(fromDate).toISOString());
    if (toDate) params.set('to', new Date(toDate).toISOString());
    window.open(`/api/admin/reports/download?${params.toString()}`, '_blank');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 검색 + 기간 필터
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const from = fromDate ? new Date(fromDate).getTime() : null;
    const to = toDate ? new Date(toDate).getTime() + 86400000 : null;
    return payments.filter((p) => {
      if (q) {
        const hit =
          String(p.id).includes(q) ||
          String(p.distributorId).includes(q) ||
          (p.transactionId || '').toLowerCase().includes(q) ||
          (p.paymentMethod || '').toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (from || to) {
        const t = new Date(p.createdAt).getTime();
        if (from && t < from) return false;
        if (to && t > to) return false;
      }
      return true;
    });
  }, [payments, searchQuery, fromDate, toDate]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 통계 계산 (필터 반영)
  const stats = {
    total: filtered.length,
    completed: filtered.filter(p => p.status === 'completed').length,
    pending: filtered.filter(p => p.status === 'pending').length,
    totalRevenue: filtered
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">결제 관리</h1>
              <p className="text-sm text-gray-600">분양 수요자 결제 내역</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 bg-white">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="pending">대기중</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
                <SelectItem value="failed">실패</SelectItem>
                <SelectItem value="refunded">환불</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleCsvExport}>
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 px-4 md:px-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 결제</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">총 거래 건수</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">성공적인 결제</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">대기중</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">처리 대기</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 매출</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">확정 매출액</p>
            </CardContent>
          </Card>
        </div>

        {/* 검색 + 기간 필터 */}
        <Card className="border-gray-200 mb-6">
          <CardContent className="py-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">검색</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-9"
                    placeholder="ID, 수요자 ID, 거래 ID, 결제수단"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">시작일</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">종료일</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>결제 내역</CardTitle>
            <CardDescription>모든 결제 거래 내역을 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">결제 내역 로딩 중...</p>
              </div>
            ) : pagedRows.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">조건에 맞는 결제 내역이 없습니다</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>수요자 ID</TableHead>
                      <TableHead>플랜 ID</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>결제 수단</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>거래 ID</TableHead>
                      <TableHead>결제일</TableHead>
                      <TableHead>생성일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedRows.map((payment) => {
                      const statusInfo = statusConfig[payment.status];
                      const StatusIcon = statusInfo.icon;

                      return (
                        <TableRow
                          key={payment.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => router.push(`/admin/payments/${payment.id}`)}
                        >
                          <TableCell className="font-medium">{payment.id}</TableCell>
                          <TableCell>{payment.distributorId}</TableCell>
                          <TableCell>{payment.planId}</TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            {payment.paymentMethod ? (
                              <Badge variant="outline">{payment.paymentMethod}</Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">
                            {payment.transactionId || '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(payment.paidAt)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(payment.createdAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {pageCount > 1 && (
                  <div className="flex justify-between items-center mt-4 text-sm">
                    <span className="text-gray-600">
                      {(page - 1) * PAGE_SIZE + 1}–
                      {Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        이전
                      </Button>
                      <span className="flex items-center px-3 text-gray-700">
                        {page} / {pageCount}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                        disabled={page >= pageCount}
                      >
                        다음
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
