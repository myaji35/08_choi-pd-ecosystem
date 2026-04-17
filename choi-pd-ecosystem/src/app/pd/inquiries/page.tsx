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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Mail, Phone, MessageSquare, CheckCircle, Clock, XCircle, Download, Search } from 'lucide-react';

interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  type: 'b2b' | 'contact';
  status: 'pending' | 'contacted' | 'closed';
  createdAt: Date;
}

const statusConfig = {
  pending: { label: '미처리', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  contacted: { label: '처리중', color: 'bg-blue-100 text-blue-800', icon: MessageSquare },
  closed: { label: '완료', color: 'bg-green-100 text-green-800', icon: CheckCircle },
};

const typeConfig = {
  b2b: { label: 'B2B 문의', color: 'bg-purple-100 text-purple-800' },
  contact: { label: '일반 문의', color: 'bg-gray-100 text-gray-800' },
};

export default function InquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter, typeFilter]);

  const fetchInquiries = async () => {
    try {
      setIsLoading(true);
      let url = '/api/pd/inquiries?';
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      if (typeFilter !== 'all') url += `type=${typeFilter}&`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setInquiries(data.inquiries);
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/pd/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        fetchInquiries();
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry(data.inquiry);
        }
      } else {
        alert('상태 변경 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 이 문의를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/pd/inquiries/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchInquiries();
        setIsDetailOpen(false);
      } else {
        alert('삭제 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to delete inquiry:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const openDetail = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsDetailOpen(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredInquiries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return inquiries;
    return inquiries.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        (i.phone || '').toLowerCase().includes(q) ||
        i.message.toLowerCase().includes(q)
    );
  }, [inquiries, searchQuery]);

  const pageCount = Math.max(1, Math.ceil(filteredInquiries.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedInquiries = filteredInquiries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // 통계 계산 (필터 반영)
  const stats = {
    total: filteredInquiries.length,
    pending: filteredInquiries.filter(i => i.status === 'pending').length,
    contacted: filteredInquiries.filter(i => i.status === 'contacted').length,
    closed: filteredInquiries.filter(i => i.status === 'closed').length,
  };

  const exportCsv = () => {
    const esc = (s: string | null | undefined) => {
      if (s == null) return '';
      return /[",\n]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : String(s);
    };
    const header = 'id,type,status,name,email,phone,message,createdAt';
    const body = filteredInquiries
      .map((i) =>
        [
          i.id,
          i.type,
          i.status,
          esc(i.name),
          esc(i.email),
          esc(i.phone),
          esc(i.message),
          new Date(i.createdAt).toISOString(),
        ].join(',')
      )
      .join('\n');
    const blob = new Blob([`${header}\n${body}\n`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pd-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/pd/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">문의 관리</h1>
              <p className="text-sm text-gray-600">B2B/일반 문의 관리</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-32 bg-white">
                <SelectValue placeholder="타입 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="b2b">B2B</SelectItem>
                <SelectItem value="contact">일반</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-32 bg-white">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="pending">미처리</SelectItem>
                <SelectItem value="contacted">처리중</SelectItem>
                <SelectItem value="closed">완료</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={filteredInquiries.length === 0}>
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
              <CardTitle className="text-sm font-medium">전체 문의</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">총 접수 건수</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">미처리</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">답변 대기 중</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">처리중</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.contacted}</div>
              <p className="text-xs text-muted-foreground mt-1">진행 중</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.closed}</div>
              <p className="text-xs text-muted-foreground mt-1">처리 완료</p>
            </CardContent>
          </Card>
        </div>

        {/* 검색 */}
        <Card className="border-gray-200 mb-6">
          <CardContent className="py-4">
            <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">검색</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="이름, 이메일, 전화, 내용 검색"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Inquiries Table */}
        <Card>
          <CardHeader>
            <CardTitle>문의 목록</CardTitle>
            <CardDescription>모든 문의를 확인하고 상태를 관리하세요</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">문의 로딩 중...</p>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">조건에 맞는 문의가 없습니다</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>전화</TableHead>
                      <TableHead>타입</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>접수일</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedInquiries.map((inquiry) => {
                      const statusInfo = statusConfig[inquiry.status];
                      const typeInfo = typeConfig[inquiry.type];
                      const StatusIcon = statusInfo.icon;

                      return (
                        <TableRow
                          key={inquiry.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => openDetail(inquiry)}
                        >
                          <TableCell className="font-medium">{inquiry.id}</TableCell>
                          <TableCell>{inquiry.name}</TableCell>
                          <TableCell className="text-sm">{inquiry.email}</TableCell>
                          <TableCell className="text-sm">{inquiry.phone || '-'}</TableCell>
                          <TableCell>
                            <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(inquiry.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDetail(inquiry);
                              }}
                            >
                              상세
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {pageCount > 1 && (
                  <div className="flex justify-between items-center mt-4 text-sm">
                    <span className="text-gray-600">
                      {(currentPage - 1) * PAGE_SIZE + 1}–
                      {Math.min(currentPage * PAGE_SIZE, filteredInquiries.length)} /{' '}
                      {filteredInquiries.length}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        이전
                      </Button>
                      <span className="flex items-center px-3 text-gray-700">
                        {currentPage} / {pageCount}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                        disabled={currentPage >= pageCount}
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

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>문의 상세</DialogTitle>
            <DialogDescription>
              문의 내용을 확인하고 상태를 변경하세요
            </DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">이름</label>
                  <p className="mt-1 text-sm">{selectedInquiry.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">타입</label>
                  <div className="mt-1">
                    <Badge className={typeConfig[selectedInquiry.type].color}>
                      {typeConfig[selectedInquiry.type].label}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">이메일</label>
                  <p className="mt-1 text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {selectedInquiry.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">전화</label>
                  <p className="mt-1 text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {selectedInquiry.phone || '-'}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">메시지</label>
                <div className="mt-1 p-4 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">접수일</label>
                  <p className="mt-1 text-sm">{formatDate(selectedInquiry.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">상태</label>
                  <Select
                    value={selectedInquiry.status}
                    onValueChange={(value) => handleStatusChange(selectedInquiry.id, value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">미처리</SelectItem>
                      <SelectItem value="contacted">처리중</SelectItem>
                      <SelectItem value="closed">완료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => selectedInquiry && handleDelete(selectedInquiry.id)}
            >
              삭제
            </Button>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
