'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AlertCircle, Globe, Shield } from 'lucide-react';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const errorMessages: Record<string, string> = {
    not_admin: '관리자 권한이 없는 계정입니다.',
    oauth_failed: '로그인에 실패했습니다. 다시 시도해주세요.',
    no_code: '인증 코드가 없습니다.',
    unauthorized: '접근 권한이 없습니다. 관리자에게 문의하세요.',
    session_expired: '세션이 만료되었습니다. 다시 로그인해주세요.',
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
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#faf9f9]">
      {/* Background Gradient Blurs */}
      <div className="absolute top-0 left-0 w-full h-full z-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#00A1E0] blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#b0cafd] blur-[100px]" />
      </div>

      <div className="w-full max-w-md z-10">
        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm font-medium">
                {errorMessages[error] || errorMessages.unknown}
              </span>
            </div>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white shadow-[0_10px_30px_-5px_rgba(22,50,92,0.04)] rounded-xl p-8 md:p-12">
          {/* Brand Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6 p-1">
              <div className="w-full h-full bg-gradient-to-br from-[#00658e] to-[#00A1E0] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl tracking-tighter">imPD</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#16325C] mb-2">로그인</h1>
            <p className="text-gray-500 text-sm">디지털 큐레이터의 시작, imPD와 함께하세요.</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* TowninGraph Login (Primary) */}
            <button
              onClick={handleTowninGraphLogin}
              className="w-full bg-gradient-to-r from-[#00658e] to-[#00A1E0] text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center gap-3 transition-transform duration-200 active:scale-95 shadow-md hover:shadow-lg"
            >
              <Globe className="w-5 h-5" />
              <span>TowninGraph로 로그인</span>
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400">또는</span>
              </div>
            </div>

            {/* Google Login (Admin) */}
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-gray-100 hover:bg-gray-200 text-[#16325C] py-4 px-6 rounded-lg font-medium flex items-center justify-center gap-3 transition-colors duration-200 border border-gray-200/50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google로 로그인 (관리자)</span>
            </button>
          </div>

          {/* Signup Link */}
          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm mb-2">계정이 없으신가요?</p>
            <a
              href="https://www.townin.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00658e] font-semibold hover:underline transition-all"
            >
              TowninGraph에서 회원가입
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 flex justify-center gap-6 text-gray-400 text-xs">
          <a href="#" className="hover:text-[#00658e] transition-colors">이용약관</a>
          <a href="#" className="hover:text-[#00658e] transition-colors">개인정보처리방침</a>
          <a href="#" className="hover:text-[#00658e] transition-colors">고객지원</a>
        </footer>
      </div>

      {/* Desktop Right Side Image */}
      <div className="hidden lg:block fixed right-0 top-0 h-full w-[35%] overflow-hidden">
        <div className="h-full w-full relative bg-gradient-to-br from-[#00658e] to-[#00A1E0]">
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <p className="text-2xl font-bold leading-tight mb-4">
              "The Digital Curator<br />for Modern Entrepreneurs."
            </p>
            <div className="w-12 h-1 bg-white/50 rounded-full" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f9]">
        <div className="w-8 h-8 border-2 border-[#00A1E0] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
