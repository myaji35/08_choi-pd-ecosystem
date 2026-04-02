'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useState } from 'react';

const inquirySchema = z.object({
  name: z.string().min(2, '이름을 입력해주세요'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  phone: z.string().optional(),
  message: z.string().min(10, '최소 10자 이상 입력해주세요'),
  type: z.enum(['b2b', 'contact']),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

interface InquiryFormProps {
  type?: 'b2b' | 'contact';
}

export function InquiryForm({ type = 'contact' }: InquiryFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      type,
    },
  });

  const onSubmit = async (data: InquiryFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '문의 접수에 실패했습니다');
      }

      toast.success('문의가 접수되었습니다', {
        description: '빠른 시일 내에 답변드리겠습니다.',
      });

      form.reset();
    } catch (error) {
      toast.error('접수에 실패했습니다', {
        description:
          error instanceof Error
            ? error.message
            : '문의 접수에 실패했습니다. 다시 시도해주세요.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" aria-label={type === 'b2b' ? 'B2B 문의 양식' : '문의 양식'}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름 *</FormLabel>
              <FormControl>
                <Input placeholder="홍길동" aria-required="true" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일 *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="example@email.com" aria-required="true" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>연락처 (선택)</FormLabel>
              <FormControl>
                <Input placeholder="010-1234-5678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>문의 내용 *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="문의하실 내용을 입력해주세요"
                  rows={5}
                  aria-required="true"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full focus-visible:ring-2 focus-visible:ring-[#00A1E0] focus-visible:ring-offset-2" disabled={isLoading} aria-busy={isLoading}>
          {isLoading ? '전송 중...' : '문의하기'}
        </Button>
      </form>
    </Form>
  );
}
