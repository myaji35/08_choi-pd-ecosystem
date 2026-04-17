'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Eye,
  ExternalLink,
} from 'lucide-react';

interface Distributor {
  id: number;
  slug: string | null;
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
  pending: { label: '승인 대기', icon: Clock, color: 'bg-[#EA580C] text-white' },
  approved: { label: '승인됨', icon: CheckCircle, color: 'bg-[#00A1E0] text-white' },
  active: { label: '활성', icon: CheckCircle, color: 'bg-[#10B981] text-white' },
  suspended: { label: '정지', icon: Pause, color: 'bg-gray-500 text-white' },
  rejected: { label: '거부됨', icon: XCircle, color: 'bg-[#EF4444] text-white' },
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

const PAGE_SIZE = 20;
type SortKey = 'createdAt' | 'totalRevenue' | 'name';

export default function DistributorsListPage() {
  const router = useRouter();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDistributors();
  }, []);

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

  const filteredDistributors = useMemo(() => {
    let filtered = [...distributors];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.email.toLowerCase().includes(q) ||
          d.region?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    filtered.sort((a, b) => {
      let diff = 0;
      if (sortKey === 'createdAt') {
        diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortKey === 'totalRevenue') {
        diff = (a.totalRevenue || 0) - (b.totalRevenue || 0);
      } else {
        diff = a.name.localeCompare(b.name);
      }
      return sortDir === 'asc' ? diff : -diff;
    });

    return filtered;
  }, [distributors, searchQuery, statusFilter, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filteredDistributors.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedDistributors = filteredDistributors.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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
    <div className="min-h-screen bg-[#F3F2F2]">
      {/* Main Content */}
      <main className="container py-8">
        {/* Page title — notion-header(h-12, z-50) 아래에 안전하게 배치 */}
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-black" style={{ color: "#16325C" }}>
              전체 수요자 목록
            </h1>
            <p className="text-sm text-gray-600">
              모든 분양 수요자를 관리합니다 · 행을 클릭하면 상세/아이덴티티 관리로 이동합니다
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="이름, 이메일, 지역으로 검색..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900"
            >
              <option value="all">전체 상태</option>
              <option value="pending">승인 대기</option>
              <option value="approved">승인됨</option>
              <option value="active">활성</option>
              <option value="suspended">정지</option>
              <option value="rejected">거부됨</option>
            </select>
            <select
              value={`${sortKey}:${sortDir}`}
              onChange={(e) => {
                const [k, d] = e.target.value.split(':') as [SortKey, 'asc' | 'desc'];
                setSortKey(k);
                setSortDir(d);
                setPage(1);
              }}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900"
            >
              <option value="createdAt:desc">최신 등록순</option>
              <option value="createdAt:asc">오래된 등록순</option>
              <option value="totalRevenue:desc">매출 높은순</option>
              <option value="totalRevenue:asc">매출 낮은순</option>
              <option value="name:asc">이름 가나다순</option>
              <option value="name:desc">이름 역순</option>
            </select>
          </div>
          <Button className="bg-[#00A1E0] hover:bg-[#0082B3]" asChild>
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
                    {pagedDistributors.map((distributor) => (
                      <TableRow
                        key={distributor.id}
                        className="cursor-pointer transition-colors hover:bg-[#F3F2F2]"
                        onClick={() =>
                          router.push(`/admin/distributors/${distributor.id}`)
                        }
                      >
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
                            <Badge className="bg-[#00A1E0] text-white">
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
                          <div className="flex items-center justify-end gap-1">
                            {distributor.slug && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                onClick={(e) => e.stopPropagation()}
                                aria-label="홍보페이지 새 탭"
                                className="text-[#00A1E0] hover:bg-[#E6F6FD]"
                                title={`impd.me/${distributor.slug}`}
                              >
                                <a
                                  href={`/member/${distributor.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/admin/distributors/${distributor.id}`);
                              }}
                              aria-label="상세 보기"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {pageCount > 1 && (
                  <div className="flex justify-between items-center mt-4 text-sm">
                    <span className="text-gray-600">
                      {(currentPage - 1) * PAGE_SIZE + 1}–
                      {Math.min(currentPage * PAGE_SIZE, filteredDistributors.length)} /{' '}
                      {filteredDistributors.length}
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
    </div>
  );
}
