'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Search,
  Filter,
  UserPlus,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  Pause,
  Eye
} from 'lucide-react';

interface Distributor {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  businessType: 'individual' | 'company' | 'organization';
  region: string | null;
  status: 'pending' | 'approved' | 'active' | 'suspended' | 'rejected';
  subscriptionPlan: 'basic' | 'premium' | 'enterprise' | null;
  totalRevenue: number;
  createdAt: string;
}

const statusConfig = {
  pending: { label: '승인 대기', icon: Clock, color: 'bg-orange-100 text-orange-800' },
  approved: { label: '승인됨', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
  active: { label: '활성', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  suspended: { label: '정지', icon: Pause, color: 'bg-gray-100 text-gray-800' },
  rejected: { label: '거부됨', icon: XCircle, color: 'bg-red-100 text-red-800' },
};

const businessTypeLabels = {
  individual: '개인',
  company: '기업',
  organization: '기관',
};

const planLabels = {
  basic: 'Basic',
  premium: 'Premium',
  enterprise: 'Enterprise',
};

export default function DistributorsListPage() {
  const router = useRouter();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [filteredDistributors, setFilteredDistributors] = useState<Distributor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDistributors();
  }, []);

  useEffect(() => {
    filterDistributors();
  }, [searchQuery, statusFilter, distributors]);

  const fetchDistributors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/distributors');
      if (response.ok) {
        const data = await response.json();
        setDistributors(data.distributors || []);
      }
    } catch (error) {
      console.error('Failed to fetch distributors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDistributors = () => {
    let filtered = [...distributors];

    if (searchQuery) {
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.region?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    setFilteredDistributors(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getStatusBadge = (status: Distributor['status']) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge className={config.color} variant="outline">
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
            <h1 className="text-xl font-bold">전체 수요자 목록</h1>
            <p className="text-sm text-gray-600">모든 분양 수요자를 관리합니다</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Actions Bar */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="이름, 이메일, 지역으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm"
            >
              <option value="all">전체 상태</option>
              <option value="pending">승인 대기</option>
              <option value="approved">승인됨</option>
              <option value="active">활성</option>
              <option value="suspended">정지</option>
              <option value="rejected">거부됨</option>
            </select>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" asChild>
            <Link href="/admin/distributors/new">
              <UserPlus className="mr-2 h-4 w-4" />
              신규 수요자 등록
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{distributors.length}</div>
              <p className="text-xs text-gray-600">전체</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">
                {distributors.filter((d) => d.status === 'pending').length}
              </div>
              <p className="text-xs text-gray-600">승인 대기</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {distributors.filter((d) => d.status === 'active').length}
              </div>
              <p className="text-xs text-gray-600">활성</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-600">
                {distributors.filter((d) => d.status === 'suspended').length}
              </div>
              <p className="text-xs text-gray-600">정지</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {distributors.filter((d) => d.status === 'rejected').length}
              </div>
              <p className="text-xs text-gray-600">거부됨</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>수요자 목록</CardTitle>
            <CardDescription>
              {filteredDistributors.length}개의 수요자
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">로딩 중...</div>
            ) : filteredDistributors.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                등록된 수요자가 없습니다
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>구분</TableHead>
                      <TableHead>지역</TableHead>
                      <TableHead>플랜</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>매출</TableHead>
                      <TableHead>등록일</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDistributors.map((distributor) => (
                      <TableRow key={distributor.id}>
                        <TableCell className="font-mono text-xs">
                          #{distributor.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {distributor.name}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {distributor.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {businessTypeLabels[distributor.businessType]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {distributor.region || '-'}
                        </TableCell>
                        <TableCell>
                          {distributor.subscriptionPlan ? (
                            <Badge className="bg-blue-100 text-blue-800">
                              {planLabels[distributor.subscriptionPlan]}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(distributor.status)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(distributor.totalRevenue)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(distributor.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/distributors/${distributor.id}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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
