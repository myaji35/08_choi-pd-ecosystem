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
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface PendingDistributor {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  businessType: 'individual' | 'company' | 'organization';
  region: string | null;
  createdAt: string;
  notes: string | null;
}

const businessTypeLabels = {
  individual: '개인',
  company: '기업',
  organization: '기관',
};

export default function PendingDistributorsPage() {
  const router = useRouter();
  const [pendingDistributors, setPendingDistributors] = useState<PendingDistributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingDistributors();
  }, []);

  const fetchPendingDistributors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/distributors?status=pending');
      if (response.ok) {
        const data = await response.json();
        setPendingDistributors(data.distributors || []);
      }
    } catch (error) {
      console.error('Failed to fetch pending distributors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('이 수요자를 승인하시겠습니까?')) return;

    setProcessingId(id);
    try {
      const response = await fetch(`/api/admin/distributors/${id}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('승인되었습니다');
        fetchPendingDistributors();
      } else {
        alert('승인에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('오류가 발생했습니다');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('거부 사유를 입력하세요 (선택사항):');
    if (reason === null) return; // 취소

    setProcessingId(id);
    try {
      const response = await fetch(`/api/admin/distributors/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        alert('거부되었습니다');
        fetchPendingDistributors();
      } else {
        alert('거부 처리에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('오류가 발생했습니다');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              승인 대기 중인 수요자
            </h1>
            <p className="text-sm text-gray-600">신규 신청을 검토하고 승인/거부 처리합니다</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Alert */}
        {pendingDistributors.length > 0 && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900">
                {pendingDistributors.length}건의 승인 대기 신청
              </h3>
              <p className="text-sm text-orange-700">
                신청 내용을 검토하고 승인 또는 거부 처리해주세요
              </p>
            </div>
          </div>
        )}

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>승인 대기 목록</CardTitle>
            <CardDescription>
              {pendingDistributors.length}개의 승인 대기 신청
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">로딩 중...</div>
            ) : pendingDistributors.length === 0 ? (
              <div className="py-12 text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">승인 대기 중인 신청이 없습니다</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>연락처</TableHead>
                      <TableHead>구분</TableHead>
                      <TableHead>지역</TableHead>
                      <TableHead>신청일</TableHead>
                      <TableHead>메모</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingDistributors.map((distributor) => (
                      <TableRow key={distributor.id}>
                        <TableCell className="font-mono text-xs">
                          #{distributor.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {distributor.name}
                        </TableCell>
                        <TableCell className="text-sm">
                          {distributor.email}
                        </TableCell>
                        <TableCell className="text-sm">
                          {distributor.phone || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {businessTypeLabels[distributor.businessType]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {distributor.region || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(distributor.createdAt)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm text-gray-600">
                          {distributor.notes || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(distributor.id)}
                              disabled={processingId === distributor.id}
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              승인
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(distributor.id)}
                              disabled={processingId === distributor.id}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              거부
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
