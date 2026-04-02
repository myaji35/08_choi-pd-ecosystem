'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').min(2, '이름은 2자 이상 입력해주세요'),
  email: z.string().min(1, '이메일을 입력해주세요').email('올바른 이메일 형식을 입력해주세요'),
  phone: z.string().optional(),
  message: z.string().min(1, '문의 내용을 입력해주세요').min(10, '문의 내용은 10자 이상 입력해주세요'),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof contactSchema>, string>>;

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const { toast } = useToast();

  const validateField = (field: keyof typeof formData, value: string) => {
    const shape = contactSchema.shape[field];
    const result = shape.safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0]?.message,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = contactSchema.safeParse(formData);
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
    setIsSuccess(false);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          type: 'contact',
        }),
      });

      const res = await response.json();

      if (!res.success) {
        throw new Error(res.error);
      }

      setIsSuccess(true);
      toast({
        title: '문의 접수 완료',
        description: '문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.',
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '문의 접수에 실패했습니다',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof FieldErrors]) {
      validateField(name as keyof typeof formData, value);
    }
  };

  const inputClass = (field: keyof typeof formData) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
      errors[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-[#00A1E0] focus:ring-[#00A1E0]'
    }`;

  return (
    <section className="py-16 bg-white">
      <div className="container">
        <div className="max-w-2xl mx-auto rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="text-center p-8 pb-0">
            <div className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,161,224,0.1)' }}>
              <Mail className="h-7 w-7" style={{ color: '#00A1E0' }} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#16325C' }}>이메일로 문의하기</h2>
            <p className="mt-2 text-sm text-gray-500">
              궁금하신 사항이 있으시면 언제든지 문의해 주세요
            </p>
          </div>
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-gray-600 mb-1.5">이름 <span className="text-red-500">*</span></label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={(e) => validateField('name', e.target.value)}
                  disabled={isLoading}
                  placeholder="홍길동"
                  className={inputClass('name')}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1.5">이메일 <span className="text-red-500">*</span></label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={(e) => validateField('email', e.target.value)}
                  disabled={isLoading}
                  placeholder="example@email.com"
                  className={inputClass('email')}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-gray-600 mb-1.5">연락처</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="010-1234-5678"
                  className={inputClass('phone')}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-semibold text-gray-600 mb-1.5">문의 내용 <span className="text-red-500">*</span></label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={(e) => validateField('message', e.target.value)}
                  disabled={isLoading}
                  placeholder="문의하실 내용을 입력해주세요"
                  rows={6}
                  className={`${inputClass('message')} resize-none`}
                />
                {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
              </div>

              {isSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-800 border border-green-200">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-sm font-medium">
                    문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:shadow-md disabled:opacity-50"
                style={{ background: '#00A1E0' }}
              >
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? '전송 중...' : '문의하기'}
              </button>

              <p className="text-xs text-gray-400 text-center">
                입력하신 개인정보는 문의 응답 목적으로만 사용됩니다.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
