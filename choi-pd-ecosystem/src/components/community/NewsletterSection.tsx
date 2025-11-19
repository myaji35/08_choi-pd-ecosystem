'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: '오류',
        description: '이메일을 입력해주세요',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: '구독 완료!',
        description: '뉴스레터 구독이 완료되었습니다',
      });

      setEmail('');
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '구독에 실패했습니다',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-muted/40 py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>

          <h2 className="mb-4 text-3xl font-bold">뉴스레터 구독</h2>
          <p className="mb-8 text-muted-foreground">
            유용한 정보와 최신 소식을 이메일로 받아보세요
          </p>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="이메일 주소를 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '처리 중...' : '구독하기'}
            </Button>
          </form>

          <p className="mt-4 text-sm text-muted-foreground">
            언제든지 구독을 취소할 수 있습니다
          </p>
        </div>
      </div>
    </section>
  );
}
