'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Check, Zap, Crown, Building2, Plus, Pencil, Trash2, Power } from 'lucide-react';

interface SubscriptionPlan {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  price: number;
  features: string | null;
  maxDistributors: number | null;
  maxResources: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PlanFormState {
  name: string;
  displayName: string;
  description: string;
  price: string;
  features: string;
  maxDistributors: string;
  maxResources: string;
  isActive: boolean;
}

const EMPTY_FORM: PlanFormState = {
  name: '',
  displayName: '',
  description: '',
  price: '',
  features: '',
  maxDistributors: '',
  maxResources: '',
  isActive: true,
};

const planIcons: Record<string, typeof Zap> = {
  basic: Zap,
  premium: Crown,
  enterprise: Building2,
};

const planColors: Record<string, string> = {
  basic: 'from-blue-500 to-cyan-500',
  premium: 'from-purple-500 to-pink-500',
  enterprise: 'from-orange-500 to-red-500',
};

function parseFeatures(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
}

export default function SubscriptionPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [form, setForm] = useState<PlanFormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/subscription-plans');
      const data = await res.json();
      if (data.success) setPlans(data.plans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingPlan(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      displayName: plan.displayName,
      description: plan.description || '',
      price: String(plan.price),
      features: parseFeatures(plan.features).join('\n'),
      maxDistributors: plan.maxDistributors != null ? String(plan.maxDistributors) : '',
      maxResources: plan.maxResources != null ? String(plan.maxResources) : '',
      isActive: plan.isActive,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.displayName.trim() || !form.price) {
      setFormError('내부 이름, 표시 이름, 가격은 필수입니다.');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      const body = {
        name: form.name.trim(),
        displayName: form.displayName.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        features: form.features
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        maxDistributors: form.maxDistributors ? Number(form.maxDistributors) : null,
        maxResources: form.maxResources ? Number(form.maxResources) : null,
        isActive: form.isActive,
      };

      const url = editingPlan
        ? `/api/admin/subscription-plans/${editingPlan.id}`
        : '/api/admin/subscription-plans';
      const method = editingPlan ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || '저장 실패');

      setDialogOpen(false);
      await fetchPlans();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    try {
      const res = await fetch(`/api/admin/subscription-plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      if (res.ok) fetchPlans();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const handleDelete = async (plan: SubscriptionPlan) => {
    if (!confirm(`플랜 "${plan.displayName}"을(를) 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/admin/subscription-plans/${plan.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || '삭제 실패');
        return;
      }
      fetchPlans();
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 실패');
    }
  };

  const initializeDefaultPlans = async () => {
    const defaultPlans = [
      {
        name: 'basic',
        displayName: 'Basic',
        description: '개인 사업자를 위한 기본 플랜',
        price: 99000,
        features: ['기본 리소스 접근', '월 10개 다운로드', '이메일 지원', '기본 분석'],
        maxResources: 10,
      },
      {
        name: 'premium',
        displayName: 'Premium',
        description: '성장하는 비즈니스를 위한 플랜',
        price: 299000,
        features: ['모든 리소스 접근', '무제한 다운로드', '우선 이메일 지원', '고급 분석', 'SNS 자동 게시'],
      },
      {
        name: 'enterprise',
        displayName: 'Enterprise',
        description: '대규모 조직을 위한 맞춤형 플랜',
        price: 990000,
        features: ['전체 기능 무제한', '전담 계정 매니저', '24/7 전화 지원', 'API 접근권한'],
      },
    ];
    for (const plan of defaultPlans) {
      await fetch('/api/admin/subscription-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });
    }
    fetchPlans();
  };

  return (
    <div className="min-h-screen bg-[#F3F2F2]">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">구독 플랜 관리</h1>
              <p className="text-sm text-gray-600">분양 플랜 및 가격 정책</p>
            </div>
          </div>
          <div className="flex gap-2">
            {plans.length === 0 && !isLoading && (
              <Button variant="outline" onClick={initializeDefaultPlans}>
                기본 플랜 초기화
              </Button>
            )}
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-1" />
              신규 플랜
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">플랜 로딩 중...</p>
          </div>
        ) : plans.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>플랜이 없습니다</CardTitle>
              <CardDescription>기본 구독 플랜을 생성하거나 새 플랜을 추가하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={initializeDefaultPlans} className="w-full">
                기본 플랜 초기화
              </Button>
              <Button variant="outline" onClick={openCreateDialog} className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                신규 플랜 생성
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const Icon = planIcons[plan.name] || Zap;
              const colorClass = planColors[plan.name] || planColors.basic;
              const features = parseFeatures(plan.features);
              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden border-gray-200 hover:shadow-2xl transition-shadow ${
                    !plan.isActive ? 'opacity-60' : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center mb-4`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {!plan.isActive && <Badge variant="outline">비활성</Badge>}
                    </div>
                    <CardTitle className="text-2xl">{plan.displayName}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatCurrency(plan.price)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">월 결제 (VAT 별도)</p>
                    </div>
                    <div className="space-y-2">
                      {features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    {plan.maxResources && (
                      <Badge variant="outline">리소스: 월 {plan.maxResources}개</Badge>
                    )}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(plan)}>
                        <Pencil className="h-3 w-3 mr-1" />
                        수정
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(plan)}
                        title={plan.isActive ? '비활성화' : '활성화'}
                      >
                        <Power className="h-3 w-3 mr-1" />
                        {plan.isActive ? '비활성화' : '활성화'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(plan)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* CRUD 모달 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPlan ? '플랜 수정' : '신규 플랜 생성'}</DialogTitle>
            <DialogDescription>
              플랜의 이름, 가격, 기능을 설정합니다. 기능은 줄바꿈으로 구분합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  내부 이름 (영문 소문자) *
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="basic / premium / enterprise"
                  disabled={!!editingPlan}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  표시 이름 *
                </Label>
                <Input
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  placeholder="Premium"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">설명</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  월 가격 (원) *
                </Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="99000"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  최대 수요자 수
                </Label>
                <Input
                  type="number"
                  value={form.maxDistributors}
                  onChange={(e) => setForm({ ...form, maxDistributors: e.target.value })}
                  placeholder="비워두면 무제한"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  월 리소스 한도
                </Label>
                <Input
                  type="number"
                  value={form.maxResources}
                  onChange={(e) => setForm({ ...form, maxResources: e.target.value })}
                  placeholder="비워두면 무제한"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                기능 목록 (한 줄에 하나)
              </Label>
              <Textarea
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                rows={4}
                placeholder={'기본 리소스 접근\n월 10개 다운로드\n이메일 지원'}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="plan-active"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <Label htmlFor="plan-active" className="text-sm text-gray-700">
                활성화 (고객에게 노출)
              </Label>
            </div>
            {formError && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200">
                {formError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? '저장 중...' : editingPlan ? '수정 저장' : '플랜 생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
