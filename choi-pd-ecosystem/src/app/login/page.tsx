'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, Globe, Shield } from 'lucide-react';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const errorMessages: Record<string, string> = {
    unauthorized: '접근 권한이 없습니다. 관리자에게 문의하세요.',
    session_expired: '세션이 만료되었습니다. 다시 로그인해주세요.',
    invalid_callback: '인증 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
    unknown: '알 수 없는 오류가 발생했습니다.',
  };

  const handleTowninGraphLogin = () => {
    const params = new URLSearchParams({ callbackUrl });
    window.location.href = `/api/auth/towningraph?${params.toString()}`;
  };

  const handleGoogleLogin = () => {
    const params = new URLSearchParams({ callbackUrl });
    window.location.href = `/api/auth/google?${params.toString()}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md border-gray-200">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-[#16325C] p-3">
              <LogIn className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#16325C]">imPD 로그인</CardTitle>
          <CardDescription className="text-sm text-gray-600">
            계정 유형에 맞는 로그인 방식을 선택하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {errorMessages[error] || errorMessages.unknown}
            </div>
          )}

          {/* TowninGraph Login */}
          <Button
            onClick={handleTowninGraphLogin}
            className="w-full py-2.5 text-sm font-semibold"
            size="lg"
            style={{ background: '#00A1E0', color: 'white' }}
          >
            <Globe className="mr-2 h-5 w-5" />
            TowninGraph로 로그인
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">또는</span>
            </div>
          </div>

          {/* Google Login (Admin) */}
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full py-2.5 text-sm font-semibold border-gray-300"
            size="lg"
          >
            <Shield className="mr-2 h-5 w-5 text-gray-600" />
            Google로 로그인 (관리자)
          </Button>

          {/* TowninGraph signup link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>아직 계정이 없으신가요?</p>
            <a
              href={process.env.NEXT_PUBLIC_TOWNINGRAPH_SIGNUP_URL || 'https://towningraph.com/signup'}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block font-semibold text-[#00A1E0] hover:underline"
            >
              TowninGraph에서 회원가입
            </a>
          </div>

          {/* Info box */}
          <div className="mt-4 rounded-lg bg-slate-50 border border-gray-200 p-4 text-xs text-gray-700">
            <p className="font-semibold mb-2">로그인 안내</p>
            <ul className="space-y-1">
              <li className="flex items-start gap-1.5">
                <Globe className="h-3.5 w-3.5 mt-0.5 text-[#00A1E0] flex-shrink-0" />
                <span><strong>TowninGraph</strong> — 회원/일반 사용자 로그인</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Shield className="h-3.5 w-3.5 mt-0.5 text-gray-500 flex-shrink-0" />
                <span><strong>Google</strong> — 관리자 전용 (허가된 이메일만)</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
