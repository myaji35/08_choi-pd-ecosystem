'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { ArrowLeft, FileText, Download, CheckCircle, Clock, AlertCircle, Send } from 'lucide-react';

interface Invoice {
  id: number;
  paymentId: number;
  distributorId: number;
  invoiceNumber: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: Date | null;
  paidAt: Date | null;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  pdfUrl: string | null;
  createdAt: Date;
  payment?: any;
  distributor?: any;
}

const statusConfig = {
  draft: { label: '임시', color: 'bg-gray-100 text-gray-800', icon: FileText },
  sent: { label: '발송됨', color: 'bg-blue-100 text-blue-800', icon: Send },
  paid: { label: '결제됨', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  overdue: { label: '연체', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  cancelled: { label: '취소됨', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
};

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const url = statusFilter !== 'all'
        ? `/api/admin/invoices?status=${statusFilter}`
        : '/api/admin/invoices';
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setIsLoading(false);
    }
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
    });
  };

  // 통계 계산
  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalAmount: invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.totalAmount, 0),
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
              <h1 className="text-xl font-bold">영수증 관리</h1>
              <p className="text-sm text-gray-600">분양 수요자 영수증 발행</p>
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
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

      {/* Main Content */}
      <main className="container py-8 px-4 md:px-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 영수증</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">발행된 영수증</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">결제 완료</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
              <p className="text-xs text-muted-foreground mt-1">결제된 영수증</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">연체</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground mt-1">납기일 초과</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 금액</CardTitle>
              <Download className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.totalAmount)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">결제 완료 금액</p>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>영수증 목록</CardTitle>
            <CardDescription>모든 영수증을 확인하고 관리하세요</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">영수증 로딩 중...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">영수증이 없습니다</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>영수증 번호</TableHead>
                      <TableHead>수요자</TableHead>
                      <TableHead>금액 (VAT별도)</TableHead>
                      <TableHead>세금</TableHead>
                      <TableHead>총액</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>납기일</TableHead>
                      <TableHead>결제일</TableHead>
                      <TableHead>생성일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => {
                      const statusInfo = statusConfig[invoice.status];
                      const StatusIcon = statusInfo.icon;

                      return (
                        <TableRow
                          key={invoice.id}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <TableCell className="font-medium">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>
                            {invoice.distributor ? (
                              <div>
                                <div className="font-medium">{invoice.distributor.name}</div>
                                <div className="text-xs text-gray-500">{invoice.distributor.email}</div>
                              </div>
                            ) : (
                              `ID: ${invoice.distributorId}`
                            )}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(invoice.amount)}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {formatCurrency(invoice.taxAmount)}
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
                          <TableCell className="text-sm">
                            {formatDate(invoice.dueDate)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(invoice.paidAt)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(invoice.createdAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
