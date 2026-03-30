'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Crown,
  DollarSign,
  Calendar,
} from 'lucide-react';

// ---- 타입 ----

interface Subscription {
  id: number;
  tenantId: number;
  tenantName: string;
  tenantSlug: string;
  plan: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  monthlyAmount: number;
}

interface SubscriptionStats {
  totalActive: number;
  totalTrialing: number;
  totalCanceling: number;
  totalPastDue: number;
  mrr: number;
  arr: number;
}

const PLAN_CONFIG: Record<string, { label: string; color: string }> = {
  free: { label: '무료', color: '#6b7280' },
  pro: { label: '프로', color: '#00A1E0' },
  enterprise: { label: '엔터프라이즈', color: '#7c3aed' },
};

const SUB_STATUS: Record<string, { label: string; color: string }> = {
  active: { label: '활성', color: '#059669' },
  trialing: { label: '체험', color: '#0284c7' },
  past_due: { label: '미결제', color: '#d97706' },
  canceled: { label: '취소', color: '#dc2626' },
  canceling: { label: '해지 예정', color: '#ea580c' },
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search) params.set('search', search);
      if (filterPlan) params.set('plan', filterPlan);
      if (filterStatus) params.set('status', filterStatus);

      const res = await fetch(`/api/superadmin/subscriptions?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
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
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-[#16325C]">구독 현황</h1>
        <p className="text-sm text-gray-500 mt-1">
          플랫폼 구독 및 수익 현황을 확인합니다.
        </p>
      </div>

      {/* KPI 카드 */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">MRR (월 반복 수익)</p>
                  <p className="text-xl font-bold text-[#16325C]">
                    {(stats.mrr || 0).toLocaleString()}원
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50">
                  <TrendingUp className="h-5 w-5 text-[#00A1E0]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">ARR (연간 수익)</p>
                  <p className="text-xl font-bold text-[#16325C]">
                    {(stats.arr || 0).toLocaleString()}원
                  </p>
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
                  <p className="text-xs text-gray-500">유료 구독</p>
                  <p className="text-xl font-bold text-[#16325C]">{stats.totalActive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">주의 (미결제/해지 예정)</p>
                  <p className="text-xl font-bold text-[#16325C]">
                    {(stats.totalPastDue || 0) + (stats.totalCanceling || 0)}
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
                placeholder="테넌트 이름 검색..."
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
              />
            </div>
            <select
              value={filterPlan}
              onChange={(e) => { setFilterPlan(e.target.value); setPage(1); }}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
            >
              <option value="">모든 플랜</option>
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
              <option value="trialing">체험</option>
              <option value="past_due">미결제</option>
              <option value="canceling">해지 예정</option>
              <option value="canceled">취소</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 구독 테이블 */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#16325C] text-base">
            구독 목록 ({total}건)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <CreditCard className="h-8 w-8 mb-2" />
              <p className="text-sm">구독 데이터가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">테넌트</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">플랜</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">상태</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">월 금액</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">현재 기간</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">해지 예정</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => {
                    const planCfg = PLAN_CONFIG[sub.plan] || PLAN_CONFIG.free;
                    const statusCfg = SUB_STATUS[sub.status] || SUB_STATUS.active;
                    return (
                      <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <span className="text-sm font-medium text-[#16325C]">{sub.tenantName}</span>
                            <p className="text-xs text-gray-400">{sub.tenantSlug}.impd.io</p>
                          </div>
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
                          <span className="text-sm font-medium text-[#16325C]">
                            {sub.monthlyAmount.toLocaleString()}원
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {new Date(sub.currentPeriodStart).toLocaleDateString('ko-KR')} ~{' '}
                            {new Date(sub.currentPeriodEnd).toLocaleDateString('ko-KR')}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {sub.cancelAtPeriodEnd ? (
                            <span className="flex items-center gap-1 text-xs text-amber-600">
                              <TrendingDown className="h-3 w-3" />
                              기간 만료 시 해지
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
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
