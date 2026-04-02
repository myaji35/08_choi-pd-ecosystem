'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Briefcase, FileText, Loader2 } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').min(2, '이름은 2자 이상 입력해주세요'),
  title: z.string().min(1, '직함을 입력해주세요'),
  email: z.string().min(1, '이메일을 입력해주세요').email('올바른 이메일 형식을 입력해주세요'),
  phone: z.string().min(1, '전화번호를 입력해주세요').regex(/^[\d\-+() ]+$/, '올바른 전화번호 형식을 입력해주세요'),
  bio: z.string().optional(),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof profileSchema>, string>>;

interface ProfileFormProps {
  initialData: {
    name: string;
    title: string;
    email: string;
    phone: string;
    bio: string;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const { toast } = useToast();

  const validateField = (field: keyof typeof formData, value: string) => {
    const result = profileSchema.shape[field].safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0]?.message,
    }));
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      validateField(field, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof typeof formData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const res = await response.json();

      if (!res.success) {
        throw new Error(res.error);
      }

      toast({
        title: '저장 완료',
        description: '프로필이 성공적으로 업데이트되었습니다',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '프로필 업데이트에 실패했습니다',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field: keyof typeof formData) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 ${
      errors[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-[#00A1E0] focus:ring-[#00A1E0]'
    }`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>개인 정보</CardTitle>
        <CardDescription>
          웹사이트에 표시될 개인 프로필 정보를 입력하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-2">
              <User className="h-4 w-4" />
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={(e) => validateField('name', e.target.value)}
              placeholder="최범희"
              className={inputClass('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              직함/소개 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              onBlur={(e) => validateField('title', e.target.value)}
              placeholder="스마트폰 창업 전략가"
              className={inputClass('title')}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={(e) => validateField('email', e.target.value)}
              placeholder="contact@choipd.com"
              className={inputClass('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              전화번호 <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={(e) => validateField('phone', e.target.value)}
              placeholder="010-XXXX-XXXX"
              className={inputClass('phone')}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="bio" className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              소개글
            </label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="자기소개 및 경력을 입력하세요"
              rows={5}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              '저장하기'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
