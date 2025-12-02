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
import {
  ArrowLeft,
  Save,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
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
      pending: { color: 'bg-orange-100 text-orange-800', icon: Clock },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      suspended: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      rejected: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error && !distributor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">오류</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/admin/distributors')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* 헤더 */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/distributors')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              뒤로가기
            </Button>
            <h1 className="text-xl font-bold">수요자 상세 정보</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container py-8">
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
                  <Label htmlFor="name">이름/기업명 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="홍길동 / (주)imPD"
                  />
                </div>

                <div>
                  <Label htmlFor="email">이메일 *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">전화번호</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="010-1234-5678"
                  />
                </div>

                <div>
                  <Label htmlFor="region">지역</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="서울특별시"
                  />
                </div>

                <div>
                  <Label htmlFor="businessType">사업 유형 *</Label>
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
                  <Label htmlFor="status">상태 *</Label>
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
                  <Label htmlFor="subscriptionPlan">구독 플랜</Label>
                  <Select
                    value={formData.subscriptionPlan}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, subscriptionPlan: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="플랜 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">없음</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">관리자 메모</Label>
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

          {/* 사이드 정보 */}
          <div className="space-y-6">
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
                    <Badge className="bg-purple-100 text-purple-800">
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
