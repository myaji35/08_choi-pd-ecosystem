'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DistributorIdentityUploader } from '@/components/admin/DistributorIdentityUploader';
import { IdentityPreviewCard } from '@/components/admin/IdentityPreviewCard';
import { memberDisplayUrl, memberHref, memberAbsoluteUrl } from '@/lib/public-url';
import {
  ArrowLeft,
  Save,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Copy,
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
  subscriptionStartDate: Date | null;
  subscriptionEndDate: Date | null;
  contractDocument: string | null;
  notes: string | null;
  totalRevenue: number;
  lastActivityAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function DistributorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [distributor, setDistributor] = useState<Distributor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [identityRefreshKey, setIdentityRefreshKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessType: 'individual' as 'individual' | 'company' | 'organization',
    region: '',
    status: 'pending' as 'pending' | 'approved' | 'active' | 'suspended' | 'rejected',
    subscriptionPlan: '' as '' | 'basic' | 'premium' | 'enterprise',
    notes: '',
  });

  useEffect(() => {
    fetchDistributor();
  }, [id]);

  const fetchDistributor = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/distributors/${id}`);
      const data = await response.json();

      if (data.success) {
        setDistributor(data.distributor);
        setFormData({
          name: data.distributor.name,
          email: data.distributor.email,
          phone: data.distributor.phone || '',
          businessType: data.distributor.businessType,
          region: data.distributor.region || '',
          status: data.distributor.status,
          subscriptionPlan: data.distributor.subscriptionPlan || '',
          notes: data.distributor.notes || '',
        });
      } else {
        setError(data.error || '수요자 정보를 불러올 수 없습니다');
      }
    } catch (err) {
      setError('수요자 정보를 불러오는 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccessMessage('');

      const response = await fetch(`/api/admin/distributors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('수요자 정보가 업데이트되었습니다');
        setDistributor(data.distributor);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || '업데이트에 실패했습니다');
      }
    } catch (err) {
      setError('업데이트 중 오류가 발생했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 수요자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/distributors/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/distributors');
      } else {
        setError(data.error || '삭제에 실패했습니다');
      }
    } catch (err) {
      setError('삭제 중 오류가 발생했습니다');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-orange-500 text-white', icon: Clock },
      approved: { color: 'bg-[#00A1E0] text-white', icon: CheckCircle },
      active: { color: 'bg-green-600 text-white', icon: CheckCircle },
      suspended: { color: 'bg-red-600 text-white', icon: AlertCircle },
      rejected: { color: 'bg-gray-500 text-white', icon: XCircle },
    };

    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;

    return (
      <Badge className={variant.color}>
        <Icon className="mr-1 h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error && !distributor) {
    const notFound = /not found|찾을 수 없/i.test(error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">
              {notFound ? '아직 등록되지 않은 ID' : '오류'}
            </CardTitle>
            <CardDescription>
              {notFound ? (
                <>
                  <span className="font-mono text-gray-700">impd.me/{id}</span> 이(가) 아직 등록되지 않았습니다.
                </>
              ) : (
                error
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {notFound && (
              <Button
                onClick={() => router.push(`/admin/distributors/new?slug=${id}`)}
                className="w-full bg-[#00A1E0] hover:bg-[#0082B3]"
              >
                이 ID로 신규 등록하기
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/admin/distributors')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메인 콘텐츠 */}
      <main className="container py-8">
        {/* Page header — notion-header(h-12, z-50) 아래 정상 flow로 배치 */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/distributors')}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              뒤로가기
            </Button>
            <div>
              <h1 className="text-2xl font-black" style={{ color: '#16325C' }}>
                수요자 상세 정보
              </h1>
              <p className="text-sm text-gray-600">
                {distributor?.name}
                {distributor?.email ? <> · <span className="font-mono">{distributor.email}</span></> : null}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {distributor?.slug && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-[#00A1E0] text-[#00A1E0] hover:bg-[#E6F6FD]"
              >
                <a
                  href={`/member/${distributor.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="홍보페이지 새 탭에서 열기"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  홍보페이지 바로가기
                </a>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-[#00A1E0] hover:bg-[#0082B3] text-white">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>

        {/* 알림 메시지 */}
        {successMessage && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* 메인 정보 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>수요자의 기본 정보를 관리합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="block text-xs font-semibold text-gray-600 mb-1.5">이름/기업명 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="홍길동 / (주)imPD"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1.5">이메일 *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="block text-xs font-semibold text-gray-600 mb-1.5">전화번호</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="010-1234-5678"
                  />
                </div>

                <div>
                  <Label htmlFor="region" className="block text-xs font-semibold text-gray-600 mb-1.5">지역</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="서울특별시"
                  />
                </div>

                <div>
                  <Label htmlFor="businessType" className="block text-xs font-semibold text-gray-600 mb-1.5">사업 유형 *</Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, businessType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="사업 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">개인</SelectItem>
                      <SelectItem value="company">법인</SelectItem>
                      <SelectItem value="organization">기관/단체</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status" className="block text-xs font-semibold text-gray-600 mb-1.5">상태 *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">대기 중</SelectItem>
                      <SelectItem value="approved">승인됨</SelectItem>
                      <SelectItem value="active">활성</SelectItem>
                      <SelectItem value="suspended">정지</SelectItem>
                      <SelectItem value="rejected">거부</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subscriptionPlan" className="block text-xs font-semibold text-gray-600 mb-1.5">구독 플랜</Label>
                  <Select
                    value={formData.subscriptionPlan || 'none'}
                    onValueChange={(value: any) =>
                      setFormData({
                        ...formData,
                        subscriptionPlan: value === 'none' ? '' : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="플랜 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">없음</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="block text-xs font-semibold text-gray-600 mb-1.5">관리자 메모</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="내부 메모사항을 입력하세요"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* 아이덴티티 분석(Preview) + 업로더 — 기본 정보와 동일한 좌측 2열 영역에 이어 배치 */}
          <div className="md:col-span-2 space-y-6">
            <IdentityPreviewCard
              distributorId={id}
              refreshKey={identityRefreshKey}
            />
            <DistributorIdentityUploader
              distributorId={id}
              onSaved={() => setIdentityRefreshKey((k) => k + 1)}
            />
          </div>

          {/* 사이드 정보 */}
          <div className="space-y-6">
            {/* 홍보페이지 카드 (slug 있을 때만) */}
            {distributor?.slug ? (
              <Card className="border-[#00A1E0]/40 bg-gradient-to-br from-[#F3FBFE] to-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#16325C' }}>
                    <ExternalLink className="h-4 w-4 text-[#00A1E0]" />
                    홍보페이지
                  </CardTitle>
                  <CardDescription>회원의 공개 페이지로 바로 이동합니다</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-xs text-gray-700 break-all"
                    suppressHydrationWarning
                  >
                    {mounted ? (
                      memberDisplayUrl(distributor.slug)
                    ) : (
                      <>
                        impd.me/<span className="font-bold text-[#16325C]">{distributor.slug}</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      asChild
                      className="flex-1 bg-[#00A1E0] text-white hover:bg-[#0082B3]"
                    >
                      <a
                        href={memberHref(distributor.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-1.5 h-4 w-4" />
                        바로가기
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = memberAbsoluteUrl(distributor.slug!);
                        navigator.clipboard?.writeText(url);
                        setSuccessMessage(`URL이 복사되었습니다: ${url}`);
                        setTimeout(() => setSuccessMessage(''), 2000);
                      }}
                      aria-label="URL 복사"
                      title="현재 접속 중인 도메인 기준으로 복사됩니다"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    현재 접속 중인 도메인으로 자동 생성됩니다. 프로덕션(impd.me)에서는 서브디렉토리로, 그 외엔 <span className="font-mono">/member/&lt;slug&gt;</span>로 이동합니다.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-gray-300 bg-gray-50">
                <CardContent className="py-5 text-center">
                  <p className="text-sm font-semibold text-gray-700">
                    홍보페이지 URL 미설정
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    이 회원은 slug(공개 주소 식별자)가 없어 공개 페이지에 접근할 수 없습니다.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 상태 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>현재 상태</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">상태</p>
                  {distributor && getStatusBadge(distributor.status)}
                </div>

                {distributor?.subscriptionPlan && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">구독 플랜</p>
                    <Badge className="bg-[#7C3AED] text-white">
                      {distributor.subscriptionPlan.toUpperCase()}
                    </Badge>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-1">총 매출</p>
                  <p className="text-lg font-bold text-blue-600">
                    {distributor?.totalRevenue.toLocaleString()}원
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 활동 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>활동 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">등록일</p>
                  <p className="font-medium">
                    {distributor?.createdAt
                      ? new Date(distributor.createdAt).toLocaleDateString('ko-KR')
                      : '-'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600">최종 수정</p>
                  <p className="font-medium">
                    {distributor?.updatedAt
                      ? new Date(distributor.updatedAt).toLocaleDateString('ko-KR')
                      : '-'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600">최근 활동</p>
                  <p className="font-medium">
                    {distributor?.lastActivityAt
                      ? new Date(distributor.lastActivityAt).toLocaleDateString('ko-KR')
                      : '활동 없음'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
