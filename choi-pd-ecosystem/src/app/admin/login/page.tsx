'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignIn } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

const IS_DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

// 개발 모드 로그인 컴포넌트
function DevModeLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 간단한 바이패스: admin/admin으로 로그인
    if (email === 'admin' && password === 'admin') {
      // 간단한 세션 쿠키 설정
      document.cookie = 'dev-auth=true; path=/; max-age=86400'; // 24시간
      router.push('/admin/dashboard');
      router.refresh();
    } else {
      setError('개발 모드: admin / admin 을 사용하세요');
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-200 via-purple-100 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-purple-600 p-3">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">개발 모드 로그인</CardTitle>
          <CardDescription className="text-center">
            빠른 개발을 위한 간편 로그인
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일 / 사용자명</Label>
              <Input
                id="email"
                type="text"
                placeholder="admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-purple-50 p-4 text-xs text-purple-900">
            <p className="font-semibold mb-2">🔧 개발 모드 활성화됨</p>
            <ul className="space-y-1">
              <li>• 사용자명: <code className="bg-purple-200 px-1 rounded">admin</code></li>
              <li>• 비밀번호: <code className="bg-purple-200 px-1 rounded">admin</code></li>
            </ul>
            <p className="mt-3 text-purple-600">
              프로덕션에서는 Clerk 인증을 사용합니다
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 프로덕션 Clerk 로그인 컴포넌트
function ProductionLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-200 via-purple-100 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-purple-900">최PD 관리자</h1>
          <p className="mt-2 text-purple-700">대시보드 접속을 위해 로그인하세요</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-2xl",
            },
          }}
          forceRedirectUrl="/admin/dashboard"
        />
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return IS_DEV_MODE ? <DevModeLogin /> : <ProductionLogin />;
}
