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
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Send,
  ExternalLink,
  Search,
} from 'lucide-react';

interface Invoice {
  id: number;
  paymentId: number;
  distributorId: number;
  invoiceNumber: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: string | null;
  paidAt: string | null;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  pdfUrl: string | null;
  createdAt: string;
  payment?: { id: number; status: string } | null;
  distributor?: { id: number; name: string; email: string } | null;
}

const statusConfig: Record<Invoice['status'], { label: string; color: string; icon: typeof FileText }> = {
  draft: { label: '임시', color: 'bg-gray-500 text-white', icon: FileText },
  sent: { label: '발송됨', color: 'bg-[#00A1E0] text-white', icon: Send },
  paid: { label: '결제됨', color: 'bg-[#10B981] text-white', icon: CheckCircle },
  overdue: { label: '연체', color: 'bg-[#EF4444] text-white', icon: AlertCircle },
  cancelled: { label: '취소됨', color: 'bg-gray-500 text-white', icon: AlertCircle },
};

const PAGE_SIZE = 20;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
}

function formatDate(date: string | null) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [resending, setResending] = useState<number | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const url =
        statusFilter !== 'all'
          ? `/api/admin/invoices?status=${statusFilter}`
          : '/api/admin/invoices';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setInvoices(data.invoices);
        setPage(1);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const from = fromDate ? new Date(fromDate).getTime() : null;
    const to = toDate ? new Date(toDate).getTime() + 86400000 : null;

    return invoices.filter((inv) => {
      if (q) {
        const hit =
          inv.invoiceNumber.toLowerCase().includes(q) ||
          (inv.distributor?.name || '').toLowerCase().includes(q) ||
          (inv.distributor?.email || '').toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (from || to) {
        const t = new Date(inv.createdAt).getTime();
        if (from && t < from) return false;
        if (to && t > to) return false;
      }
      return true;
    });
  }, [invoices, searchQuery, fromDate, toDate]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total: filtered.length,
    paid: filtered.filter((i) => i.status === 'paid').length,
    overdue: filtered.filter((i) => i.status === 'overdue').length,
    totalAmount: filtered
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.totalAmount, 0),
  };

  const handleResend = async (invoiceId: number) => {
    setResending(invoiceId);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/resend`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || '영수증 재발송 실패');
      } else {
        alert('영수증을 재발송했습니다.');
        fetchInvoices();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '재발송 실패');
    } finally {
      setResending(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2F2]">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "#16325C" }}>영수증 관리</h1>
              <p className="text-sm text-gray-600">분양 수요자 영수증 발행</p>
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-white">
              <SelectValue placeholder="상태 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="draft">임시</SelectItem>
              <SelectItem value="sent">발송됨</SelectItem>
              <SelectItem value="paid">결제됨</SelectItem>
              <SelectItem value="overdue">연체</SelectItem>
              <SelectItem value="cancelled">취소됨</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="container py-8 px-4 md:px-6">
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 영수증</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">결제 완료</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">연체</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">결제 완료 금액</CardTitle>
              <Download className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.totalAmount)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 검색/기간 필터 */}
        <Card className="border-gray-200 mb-6">
          <CardContent className="py-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">검색</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-9"
                    placeholder="영수증번호, 수요자 이름/이메일"
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

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>영수증 목록</CardTitle>
            <CardDescription>모든 영수증을 확인하고 관리하세요</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">영수증 로딩 중...</p>
              </div>
            ) : pagedRows.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                조건에 맞는 영수증이 없습니다.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>영수증 번호</TableHead>
                        <TableHead>수요자</TableHead>
                        <TableHead>금액 (공급가)</TableHead>
                        <TableHead>세금</TableHead>
                        <TableHead>총액</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>납기일</TableHead>
                        <TableHead>결제일</TableHead>
                        <TableHead className="text-right">액션</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedRows.map((invoice) => {
                        const statusInfo = statusConfig[invoice.status];
                        const StatusIcon = statusInfo.icon;
                        return (
                          <TableRow key={invoice.id} className="hover:bg-gray-50">
                            <TableCell
                              className="font-medium cursor-pointer"
                              onClick={() =>
                                invoice.payment &&
                                router.push(`/admin/payments/${invoice.paymentId}`)
                              }
                            >
                              <span className="text-blue-600 hover:underline">
                                {invoice.invoiceNumber}
                              </span>
                            </TableCell>
                            <TableCell>
                              {invoice.distributor ? (
                                <div>
                                  <div className="font-medium">{invoice.distributor.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {invoice.distributor.email}
                                  </div>
                                </div>
                              ) : (
                                `ID: ${invoice.distributorId}`
                              )}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatCurrency(invoice.amount)}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatCurrency(invoice.taxAmount || 0)}
                            </TableCell>
                            <TableCell className="font-bold text-blue-600">
                              {formatCurrency(invoice.totalAmount)}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusInfo.color}>
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {statusInfo.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{formatDate(invoice.dueDate)}</TableCell>
                            <TableCell className="text-sm">{formatDate(invoice.paidAt)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end">
                                {invoice.pdfUrl && (
                                  <Button asChild variant="outline" size="sm">
                                    <a
                                      href={invoice.pdfUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="PDF 다운로드"
                                    >
                                      <Download className="h-3 w-3" />
                                    </a>
                                  </Button>
                                )}
                                {invoice.status !== 'cancelled' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleResend(invoice.id)}
                                    disabled={resending === invoice.id}
                                    title="재발송"
                                  >
                                    <Send className="h-3 w-3" />
                                  </Button>
                                )}
                                {invoice.payment && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      router.push(`/admin/payments/${invoice.paymentId}`)
                                    }
                                    title="결제 상세"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {pageCount > 1 && (
                  <div className="flex justify-between items-center mt-4 text-sm">
                    <span className="text-gray-600">
                      {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} /{' '}
                      {filtered.length}
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
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
