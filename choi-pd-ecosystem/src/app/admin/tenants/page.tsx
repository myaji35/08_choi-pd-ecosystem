'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ExternalLink,
  AlertCircle,
  Building2,
  Crown,
  Loader2,
} from 'lucide-react';

// ---- 타입 ----

interface TenantSummary {
  id: number;
  name: string;
  slug: string;
  profession: string;
  plan: string;
  status: string;
  memberCount: number;
  createdAt: string;
}

interface TenantStats {
  totalActive: number;
  totalFree: number;
  totalPro: number;
  totalEnterprise: number;
  mrr: number;
}

const PROFESSION_LABELS: Record<string, string> = {
  pd: 'PD/방송인',
  shopowner: '쇼핑몰',
  realtor: '부동산',
  educator: '교육자',
  insurance: '보험',
  freelancer: '프리랜서',
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: '활성', color: '#059669' },
  suspended: { label: '정지', color: '#d97706' },
  deleted: { label: '삭제', color: '#dc2626' },
};

const PLAN_CONFIG: Record<string, { label: string; color: string }> = {
  free: { label: '무료', color: '#6b7280' },
  pro: { label: '프로', color: '#00A1E0' },
  enterprise: { label: '엔터프라이즈', color: '#7c3aed' },
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchTenants = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search) params.set('search', search);
      if (filterPlan) params.set('plan', filterPlan);
      if (filterStatus) params.set('status', filterStatus);

      const res = await fetch(`/api/superadmin/tenants?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTenants(data.tenants || []);
        setTotal(data.total || 0);
        setStats(data.stats || null);
      }
    } catch {
      // 에러 시 빈 목록
    } finally {
      setIsLoading(false);
    }
  }, [page, search, filterPlan, filterStatus]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-[#16325C]">테넌트 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          플랫폼에 등록된 모든 테넌트를 관리합니다.
        </p>
      </div>

      {/* KPI 카드 */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50">
                  <Building2 className="h-5 w-5 text-[#00A1E0]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">활성 테넌트</p>
                  <p className="text-xl font-bold text-[#16325C]">{stats.totalActive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                  <Users className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">무료</p>
                  <p className="text-xl font-bold text-[#16325C]">{stats.totalFree}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50">
                  <Crown className="h-5 w-5 text-[#00A1E0]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">프로</p>
                  <p className="text-xl font-bold text-[#16325C]">{stats.totalPro}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-50">
                  <Crown className="h-5 w-5 text-[#7c3aed]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">엔터프라이즈</p>
                  <p className="text-xl font-bold text-[#16325C]">{stats.totalEnterprise}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                  <span className="text-green-600 font-bold text-sm">MRR</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">월 반복 수익</p>
                  <p className="text-xl font-bold text-[#16325C]">
                    {(stats.mrr || 0).toLocaleString()}원
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 필터 + 검색 */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="테넌트 이름 또는 slug 검색..."
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
              />
            </div>
            <select
              value={filterPlan}
              onChange={(e) => { setFilterPlan(e.target.value); setPage(1); }}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
            >
              <option value="">모든 플랜</option>
              <option value="free">무료</option>
              <option value="pro">프로</option>
              <option value="enterprise">엔터프라이즈</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
            >
              <option value="">모든 상태</option>
              <option value="active">활성</option>
              <option value="suspended">정지</option>
              <option value="deleted">삭제</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 테넌트 테이블 */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#16325C] text-base">
            테넌트 목록 ({total}건)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : tenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p className="text-sm">등록된 테넌트가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">이름</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">slug</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">직업군</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">플랜</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">상태</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">멤버</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">가입일</th>
                    <th className="text-right text-xs font-semibold text-gray-600 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t) => {
                    const planCfg = PLAN_CONFIG[t.plan] || PLAN_CONFIG.free;
                    const statusCfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.active;
                    return (
                      <tr key={t.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-[#16325C]">{t.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={`https://${t.slug}.impd.io`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#00A1E0] hover:underline flex items-center gap-1"
                          >
                            {t.slug}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {PROFESSION_LABELS[t.profession] || t.profession}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                            style={{ background: planCfg.color }}
                          >
                            {planCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                            style={{ background: statusCfg.color }}
                          >
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">{t.memberCount}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-500">
                            {new Date(t.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <span className="text-xs text-gray-500">
                {(page - 1) * limit + 1} - {Math.min(page * limit, total)} / {total}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
