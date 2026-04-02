'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
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
import { ArrowLeft, UserPlus, Loader2, XCircle } from 'lucide-react';

const distributorSchema = z.object({
  name: z.string().min(1, '이름 또는 기업명을 입력해주세요'),
  email: z.string().min(1, '이메일을 입력해주세요').email('올바른 이메일 형식을 입력해주세요'),
  phone: z.string().optional(),
  businessType: z.enum(['individual', 'company', 'organization']),
  region: z.string().optional(),
  subscriptionPlan: z.string().optional(),
  notes: z.string().optional(),
});

type FieldErrors = Partial<Record<string, string>>;

export default function NewDistributorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessType: 'individual' as 'individual' | 'company' | 'organization',
    region: '',
    subscriptionPlan: '' as '' | 'basic' | 'premium' | 'enterprise',
    notes: '',
  });

  const validateField = (field: string, value: string) => {
    if (field in distributorSchema.shape) {
      const shape = (distributorSchema.shape as Record<string, z.ZodTypeAny>)[field];
      const result = shape.safeParse(value);
      setErrors((prev) => ({
        ...prev,
        [field]: result.success ? undefined : result.error.issues[0]?.message,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const result = distributorSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/distributors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subscriptionPlan: formData.subscriptionPlan || null,
        }),
      });

      if (response.ok) {
        router.push('/admin/distributors');
      } else {
        const error = await response.json();
        setSubmitError(error.error || '등록에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to create distributor:', error);
      setSubmitError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      validateField(field, value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/distributors')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              신규 수요자 등록
            </h1>
            <p className="text-sm text-gray-600">새로운 분양 수요자를 등록합니다</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>수요자 정보</CardTitle>
                <CardDescription>
                  기본 정보를 입력해주세요. 모든 필드는 나중에 수정할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Submit Error */}
                {submitError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                )}

                {/* 이름 */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    이름 / 기업명 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={(e) => validateField('name', e.target.value)}
                    placeholder="홍길동 / (주)최PD컴퍼니"
                    className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                  {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                </div>

                {/* 이메일 */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    이메일 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={(e) => validateField('email', e.target.value)}
                    placeholder="example@email.com"
                    className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                  {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                </div>

                {/* 연락처 */}
                <div className="space-y-2">
                  <Label htmlFor="phone">연락처</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="010-1234-5678"
                  />
                </div>

                {/* 사업 구분 */}
                <div className="space-y-2">
                  <Label htmlFor="businessType">
                    사업 구분 <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) => handleChange('businessType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">개인</SelectItem>
                      <SelectItem value="company">기업</SelectItem>
                      <SelectItem value="organization">기관</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 지역 */}
                <div className="space-y-2">
                  <Label htmlFor="region">지역</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => handleChange('region', e.target.value)}
                    placeholder="서울특별시 강남구"
                  />
                </div>

                {/* 구독 플랜 */}
                <div className="space-y-2">
                  <Label htmlFor="subscriptionPlan">구독 플랜</Label>
                  <Select
                    value={formData.subscriptionPlan}
                    onValueChange={(value) => handleChange('subscriptionPlan', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="플랜 선택 (선택사항)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    미선택 시 승인 후 플랜을 지정할 수 있습니다
                  </p>
                </div>

                {/* 메모 */}
                <div className="space-y-2">
                  <Label htmlFor="notes">메모</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="관리자 메모 (수요자에게 보이지 않음)"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/distributors')}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    등록 중...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    등록하기
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
