'use client';

import { useState } from 'react';
import { z } from 'zod';

const contactFormSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').min(2, '이름은 2자 이상 입력해주세요'),
  email: z.string().min(1, '이메일을 입력해주세요').email('올바른 이메일 형식을 입력해주세요'),
  message: z.string().min(1, '문의 내용을 입력해주세요').min(5, '문의 내용은 5자 이상 입력해주세요'),
});

type FieldErrors = Partial<Record<'name' | 'email' | 'message', string>>;

interface BrandPageContactFormProps {
  tenantId: number;
  primaryColor: string;
}

export function BrandPageContactForm({ tenantId, primaryColor }: BrandPageContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const validateField = (field: 'name' | 'email' | 'message', value: string) => {
    const result = contactFormSchema.shape[field].safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0]?.message,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = contactFormSchema.safeParse({ name, email, message });
    if (!validation.success) {
      const fieldErrors: FieldErrors = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FieldErrors;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/p/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          type: 'contact',
        }),
      });

      if (res.ok) {
        setResult('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setResult('error');
      }
    } catch {
      setResult('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: primaryColor }}>
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="font-semibold text-[#16325C] mb-1">문의가 접수되었습니다</p>
        <p className="text-sm text-gray-500">빠른 시일 내에 답변 드리겠습니다.</p>
        <button
          onClick={() => setResult(null)}
          className="mt-4 text-sm font-medium hover:underline"
          style={{ color: primaryColor }}
        >
          추가 문의하기
        </button>
      </div>
    );
  }

  const inputBaseClass = "w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1";

  const getInputClass = (field: keyof FieldErrors) =>
    `${inputBaseClass} ${
      errors[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) validateField('name', e.target.value);
            }}
            onFocus={(e) => {
              if (!errors.name) {
                e.currentTarget.style.borderColor = primaryColor;
                e.currentTarget.style.boxShadow = `0 0 0 1px ${primaryColor}`;
              }
            }}
            onBlur={(e) => {
              validateField('name', e.target.value);
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = 'none';
            }}
            placeholder="홍길동"
            className={getInputClass('name')}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            이메일 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) validateField('email', e.target.value);
            }}
            onFocus={(e) => {
              if (!errors.email) {
                e.currentTarget.style.borderColor = primaryColor;
                e.currentTarget.style.boxShadow = `0 0 0 1px ${primaryColor}`;
              }
            }}
            onBlur={(e) => {
              validateField('email', e.target.value);
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = 'none';
            }}
            placeholder="example@email.com"
            className={getInputClass('email')}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          문의 내용 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (errors.message) validateField('message', e.target.value);
          }}
          onFocus={(e) => {
            if (!errors.message) {
              e.currentTarget.style.borderColor = primaryColor;
              e.currentTarget.style.boxShadow = `0 0 0 1px ${primaryColor}`;
            }
          }}
          onBlur={(e) => {
            validateField('message', e.target.value);
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.boxShadow = 'none';
          }}
          placeholder="문의 내용을 입력해주세요."
          rows={4}
          className={`${getInputClass('message')} resize-none`}
        />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
      </div>

      {result === 'error' && (
        <p className="text-sm text-red-600">
          문의 접수에 실패했습니다. 다시 시도해주세요.
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50"
        style={{ background: primaryColor }}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            전송 중...
          </span>
        ) : (
          '문의하기'
        )}
      </button>
    </form>
  );
}
