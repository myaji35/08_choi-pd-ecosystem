'use client';

import { useState } from 'react';
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
    <section className="py-20" style={{ background: '#F3F2F2' }}>
      <div className="container">
        <div className="mx-auto max-w-xl">
          <div className="rounded-xl border border-gray-200 bg-white p-8 md:p-10 shadow-sm">
            <div className="text-center">
              <div className="mx-auto mb-5 w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,161,224,0.1)' }}>
                <Mail className="h-7 w-7" style={{ color: '#00A1E0' }} />
              </div>

              <h2 className="mb-2 text-2xl font-bold" style={{ color: '#16325C' }}>뉴스레터 구독</h2>
              <p className="mb-8 text-sm text-gray-500">
                유용한 정보와 최신 소식을 이메일로 받아보세요
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="email"
                  placeholder="이메일 주소를 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0] transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:shadow-md disabled:opacity-50"
                style={{ background: '#00A1E0' }}
              >
                {isLoading ? '처리 중...' : '구독하기'}
              </button>
            </form>

            <p className="mt-4 text-xs text-gray-400 text-center">
              언제든지 구독을 취소할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
