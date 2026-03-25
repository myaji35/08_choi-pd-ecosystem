'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PDLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // 통합 로그인 페이지로 리다이렉트
    router.replace('/login?callbackUrl=/pd/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="text-center">
        <p className="text-gray-600 mb-4">통합 로그인 페이지로 이동 중...</p>
        <a
          href="/login?callbackUrl=/pd/dashboard"
          className="text-[#00A1E0] hover:underline font-semibold text-sm"
        >
          자동 이동되지 않으면 여기를 클릭하세요
        </a>
      </div>
    </div>
  );
}
