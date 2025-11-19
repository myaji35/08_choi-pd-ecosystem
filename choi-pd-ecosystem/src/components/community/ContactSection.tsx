'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl">이메일로 문의하기</CardTitle>
            <CardDescription className="text-base">
              궁금하신 사항이 있으시면 언제든지 문의해 주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  placeholder="홍길동"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일 *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  placeholder="example@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">연락처</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="010-1234-5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">문의 내용 *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  placeholder="문의하실 내용을 입력해주세요"
                  rows={6}
                  className="resize-none"
                />
              </div>

              {isSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-800 border border-green-200">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-sm font-medium">
                    문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.
                  </p>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? '전송 중...' : '문의하기'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                입력하신 개인정보는 문의 응답 목적으로만 사용됩니다.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
