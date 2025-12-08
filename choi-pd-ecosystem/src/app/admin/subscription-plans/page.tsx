'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Zap, Crown, Building2 } from 'lucide-react';

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
  createdAt: Date;
  updatedAt: Date;
}

const planIcons = {
  basic: Zap,
  premium: Crown,
  enterprise: Building2,
};

const planColors = {
  basic: 'from-blue-500 to-cyan-500',
  premium: 'from-purple-500 to-pink-500',
  enterprise: 'from-orange-500 to-red-500',
};

export default function SubscriptionPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/subscription-plans');
      const data = await response.json();

      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setIsLoading(false);
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
        maxDistributors: null,
        maxResources: 10,
      },
      {
        name: 'premium',
        displayName: 'Premium',
        description: '성장하는 비즈니스를 위한 플랜',
        price: 299000,
        features: ['모든 리소스 접근', '무제한 다운로드', '우선 이메일 지원', '고급 분석', 'SNS 자동 게시'],
        maxDistributors: null,
        maxResources: null,
      },
      {
        name: 'enterprise',
        displayName: 'Enterprise',
        description: '대규모 조직을 위한 맞춤형 플랜',
        price: 990000,
        features: ['전체 기능 무제한', '전담 계정 매니저', '24/7 전화 지원', '커스텀 기능 개발', 'API 접근권한', '교육 세션'],
        maxDistributors: null,
        maxResources: null,
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const parseFeatures = (features: string | null): string[] => {
    if (!features) return [];
    try {
      return JSON.parse(features);
    } catch {
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
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
          {plans.length === 0 && !isLoading && (
            <Button onClick={initializeDefaultPlans}>기본 플랜 생성</Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">플랜 로딩 중...</p>
          </div>
        ) : plans.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>플랜이 없습니다</CardTitle>
              <CardDescription>
                기본 구독 플랜을 생성하여 시작하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={initializeDefaultPlans} className="w-full">
                기본 플랜 생성하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Plans Grid */}
            <div className="grid gap-8 md:grid-cols-3 mb-12">
              {plans.map((plan) => {
                const Icon = planIcons[plan.name as keyof typeof planIcons] || Zap;
                const colorClass = planColors[plan.name as keyof typeof planColors] || planColors.basic;
                const features = parseFeatures(plan.features);

                return (
                  <Card
                    key={plan.id}
                    className={`relative overflow-hidden hover:shadow-2xl transition-shadow ${
                      plan.name === 'premium' ? 'ring-2 ring-purple-500' : ''
                    }`}
                  >
                    {plan.name === 'premium' && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-pink-600 text-white text-xs px-3 py-1 rounded-bl-lg">
                        인기
                      </div>
                    )}

                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl">{plan.displayName}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div>
                        <div className="text-4xl font-bold text-gray-900">
                          {formatCurrency(plan.price)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">월 결제 (VAT 별도)</p>
                      </div>

                      <div className="space-y-3">
                        {features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {plan.maxResources && (
                        <div className="pt-4 border-t">
                          <Badge variant="outline">
                            리소스: 월 {plan.maxResources}개
                          </Badge>
                        </div>
                      )}

                      <Button
                        className={`w-full ${
                          plan.name === 'premium'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                            : ''
                        }`}
                        size="lg"
                      >
                        플랜 선택
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Feature Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>플랜 비교</CardTitle>
                <CardDescription>모든 플랜의 상세 기능 비교</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">기능</th>
                        {plans.map((plan) => (
                          <th key={plan.id} className="text-center py-3 px-4">
                            {plan.displayName}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">월 가격</td>
                        {plans.map((plan) => (
                          <td key={plan.id} className="text-center py-3 px-4 font-semibold">
                            {formatCurrency(plan.price)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">리소스 다운로드</td>
                        {plans.map((plan) => (
                          <td key={plan.id} className="text-center py-3 px-4">
                            {plan.maxResources ? `${plan.maxResources}개/월` : '무제한'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">고객 지원</td>
                        <td className="text-center py-3 px-4">이메일</td>
                        <td className="text-center py-3 px-4">우선 이메일</td>
                        <td className="text-center py-3 px-4">24/7 전화</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">분석 도구</td>
                        <td className="text-center py-3 px-4">기본</td>
                        <td className="text-center py-3 px-4">고급</td>
                        <td className="text-center py-3 px-4">고급 + API</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
