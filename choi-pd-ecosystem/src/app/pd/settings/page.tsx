'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/lib/tenant/useTenant';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Palette,
  Globe,
  Type,
  Save,
  Loader2,
  ExternalLink,
  Crown,
  Lock,
  Check,
  Zap,
  Building2,
} from 'lucide-react';
import type { TenantBranding, PlanType } from '@/lib/tenant/types';

// ---- 프리셋 컬러 ----

const COLOR_PRESETS = [
  { name: 'Salesforce Blue', value: '#00A1E0' },
  { name: 'Deep Navy', value: '#16325C' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Slate', value: '#475569' },
  { name: 'Sky', value: '#0284c7' },
];

const FONT_OPTIONS = [
  'Inter',
  'Pretendard',
  'Noto Sans KR',
  'Spoqa Han Sans Neo',
  'IBM Plex Sans KR',
];

// ---- 플랜 정의 ----

interface PlanInfo {
  key: PlanType;
  name: string;
  price: string;
  priceNote: string;
  color: string;
  icon: typeof Crown;
  features: string[];
  cta: string;
}

const PLANS: PlanInfo[] = [
  {
    key: 'free',
    name: 'Free',
    price: '₩0',
    priceNote: '무료',
    color: '#6b7280',
    icon: Crown,
    features: [
      'SNS 계정 2개 연동',
      '스토리지 500MB',
      '팀원 1명',
      '강의 5개',
      '유통사 3개',
    ],
    cta: '현재 플랜',
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '₩29,000',
    priceNote: '/ 월',
    color: '#00A1E0',
    icon: Zap,
    features: [
      'SNS 계정 10개 연동',
      '스토리지 10GB',
      '팀원 5명',
      '강의 무제한',
      '유통사 50개',
      '커스텀 도메인',
    ],
    cta: '업그레이드',
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: '₩99,000',
    priceNote: '/ 월',
    color: '#7c3aed',
    icon: Building2,
    features: [
      'SNS 계정 무제한',
      '스토리지 100GB',
      '팀원 무제한',
      '강의 무제한',
      '유통사 무제한',
      '커스텀 도메인',
      '전담 지원',
    ],
    cta: '업그레이드',
  },
];

export default function TenantSettingsPage() {
  const { tenant, canUseFeature, refresh } = useTenant();
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // 브랜딩 폼 상태
  const [branding, setBranding] = useState<TenantBranding>({
    logoUrl: null,
    faviconUrl: null,
    primaryColor: '#00A1E0',
    secondaryColor: '#16325C',
    fontFamily: 'Inter',
    footerText: '',
  });

  // 도메인 설정
  const [customDomain, setCustomDomain] = useState('');

  // 테넌트 로드 시 폼 초기화
  useEffect(() => {
    if (tenant?.branding) {
      setBranding(tenant.branding);
    }
  }, [tenant]);

  const hasCustomDomain = canUseFeature('customDomain');

  const handleSave = async () => {
    if (!tenant) return;
    setIsSaving(true);
    setSaveMessage('');

    try {
      const res = await fetch(`/api/tenants/${tenant.id}/branding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      });

      if (res.ok) {
        setSaveMessage('브랜딩이 저장되었습니다.');
        await refresh();
      } else {
        const data = await res.json();
        setSaveMessage(data.error || '저장에 실패했습니다.');
      }
    } catch {
      setSaveMessage('네트워크 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-[#16325C]">{t('nav.settings')}</h1>
        <p className="text-sm text-gray-500 mt-1">
          브랜드 외관과 도메인을 설정합니다.
        </p>
      </div>

      {/* 현재 플랜 배지 */}
      {tenant && (
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ background: tenant.plan === 'enterprise' ? '#7c3aed' : tenant.plan === 'pro' ? '#00A1E0' : '#6b7280' }}
          >
            <Crown className="h-3 w-3" />
            {t(`plan.${tenant.plan}`)} 플랜
          </span>
          <span className="text-xs text-gray-400">
            {tenant.slug}.impd.io
          </span>
        </div>
      )}

      {/* 브랜드 컬러 */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#16325C]">
            <Palette className="h-5 w-5" />
            브랜드 컬러
          </CardTitle>
          <CardDescription>
            메인 컬러와 보조 컬러를 선택하세요. 사이트 전반에 적용됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 메인 컬러 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              메인 컬러
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setBranding((b) => ({ ...b, primaryColor: color.value }))}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    branding.primaryColor === color.value
                      ? 'border-[#16325C] scale-110 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ background: color.value }}
                  title={color.name}
                />
              ))}
              {/* 커스텀 컬러 입력 */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => setBranding((b) => ({ ...b, primaryColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.primaryColor}
                  onChange={(e) => setBranding((b) => ({ ...b, primaryColor: e.target.value }))}
                  className="w-24 px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
                />
              </div>
            </div>
          </div>

          {/* 보조 컬러 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              보조 컬러
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={branding.secondaryColor}
                onChange={(e) => setBranding((b) => ({ ...b, secondaryColor: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={branding.secondaryColor}
                onChange={(e) => setBranding((b) => ({ ...b, secondaryColor: e.target.value }))}
                className="w-24 px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
              />
            </div>
          </div>

          {/* 미리보기 */}
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">미리보기</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-24 rounded-lg flex items-center justify-center text-white text-sm font-semibold" style={{ background: branding.primaryColor }}>
                버튼
              </div>
              <div className="h-10 w-24 rounded-lg flex items-center justify-center text-white text-sm font-semibold" style={{ background: branding.secondaryColor }}>
                헤더
              </div>
              <div className="flex-1 h-10 rounded-lg border border-gray-200 flex items-center px-3" style={{ fontFamily: branding.fontFamily }}>
                <span className="text-sm" style={{ color: branding.secondaryColor }}>
                  {tenant?.name || '브랜드'} 미리보기
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 폰트 설정 */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#16325C]">
            <Type className="h-5 w-5" />
            폰트 설정
          </CardTitle>
          <CardDescription>
            사이트에 사용할 폰트를 선택하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            폰트 패밀리
          </label>
          <select
            value={branding.fontFamily}
            onChange={(e) => setBranding((b) => ({ ...b, fontFamily: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
          {/* 푸터 텍스트 */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              푸터 텍스트
            </label>
            <input
              type="text"
              value={branding.footerText}
              onChange={(e) => setBranding((b) => ({ ...b, footerText: e.target.value }))}
              placeholder="예: 2026 내 브랜드. All rights reserved."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
            />
          </div>
        </CardContent>
      </Card>

      {/* 커스텀 도메인 */}
      <Card className={`border-gray-200 ${!hasCustomDomain ? 'opacity-75' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#16325C]">
            <Globe className="h-5 w-5" />
            커스텀 도메인
            {!hasCustomDomain && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ background: '#00A1E0' }}>
                <Lock className="h-3 w-3" />
                Pro+
              </span>
            )}
          </CardTitle>
          <CardDescription>
            {hasCustomDomain
              ? '커스텀 도메인을 연결하세요. CNAME 레코드를 설정해야 합니다.'
              : 'Pro 이상 플랜에서 커스텀 도메인을 사용할 수 있습니다.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              도메인
            </label>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="www.my-brand.com"
              disabled={!hasCustomDomain}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0] disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
          {hasCustomDomain && customDomain && (
            <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 p-3">
              <p className="text-xs font-semibold text-[#16325C] mb-1">DNS 설정 안내:</p>
              <div className="text-xs text-gray-600 font-mono">
                <p>CNAME {customDomain} → {tenant?.slug}.impd.io</p>
              </div>
            </div>
          )}
          {!hasCustomDomain && (
            <Button
              variant="outline"
              className="mt-3 border-[#00A1E0] text-[#00A1E0] hover:bg-blue-50"
              onClick={() => setIsUpgradeModalOpen(true)}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              플랜 업그레이드
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 저장 버튼 + 메시지 */}
      <div className="flex items-center justify-between">
        <div>
          {saveMessage && (
            <span
              className={`text-sm ${
                saveMessage.includes('저장') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {saveMessage}
            </span>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#00A1E0] hover:bg-[#0090c8] text-white"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              변경사항 저장
            </>
          )}
        </Button>
      </div>

      {/* 플랜 업그레이드 모달 */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl font-bold text-[#16325C] flex items-center gap-2">
              <Crown className="h-5 w-5" />
              플랜 업그레이드
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              비즈니스에 맞는 플랜을 선택하세요. 언제든 변경할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6">
            {/* 현재 플랜 안내 */}
            {tenant && (
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                현재 플랜:
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                  style={{
                    background:
                      tenant.plan === 'enterprise'
                        ? '#7c3aed'
                        : tenant.plan === 'pro'
                          ? '#00A1E0'
                          : '#6b7280',
                  }}
                >
                  {t(`plan.${tenant.plan}`)}
                </span>
              </div>
            )}

            {/* 플랜 카드 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PLANS.map((plan) => {
                const isCurrent = tenant?.plan === plan.key;
                const isDowngrade =
                  (tenant?.plan === 'enterprise' && plan.key !== 'enterprise') ||
                  (tenant?.plan === 'pro' && plan.key === 'free');
                const PlanIcon = plan.icon;

                return (
                  <div
                    key={plan.key}
                    className={`relative rounded-lg border-2 p-5 transition-all ${
                      isCurrent
                        ? 'border-[#16325C] shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* 현재 플랜 라벨 */}
                    {isCurrent && (
                      <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold text-white"
                        style={{ background: plan.color }}
                      >
                        현재 플랜
                      </div>
                    )}

                    {/* 플랜 헤더 */}
                    <div className="text-center mb-4">
                      <div
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-2"
                        style={{ background: plan.color }}
                      >
                        <PlanIcon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-[#16325C]">
                        {plan.name}
                      </h3>
                      <div className="mt-1">
                        <span className="text-2xl font-bold text-[#16325C]">
                          {plan.price}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          {plan.priceNote}
                        </span>
                      </div>
                    </div>

                    {/* 기능 목록 */}
                    <ul className="space-y-2 mb-5">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <Check
                            className="h-4 w-4 mt-0.5 flex-shrink-0"
                            style={{ color: plan.color }}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA 버튼 */}
                    <Button
                      className="w-full text-white font-semibold"
                      style={{
                        background: isCurrent ? '#9ca3af' : plan.color,
                        cursor: isCurrent || isDowngrade ? 'default' : 'pointer',
                      }}
                      disabled={isCurrent || isDowngrade}
                      onClick={() => {
                        // Stripe Checkout 연동 (ISS-010 참조)
                        window.open(
                          `/api/stripe/checkout?plan=${plan.key}`,
                          '_blank'
                        );
                      }}
                    >
                      {isCurrent
                        ? '사용 중'
                        : isDowngrade
                          ? '다운그레이드 불가'
                          : plan.cta}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* 하단 안내 */}
            <p className="mt-4 text-center text-xs text-gray-400">
              결제는 Stripe를 통해 안전하게 처리됩니다. 연간 결제 시 20% 할인이 적용됩니다.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
