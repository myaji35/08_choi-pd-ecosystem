'use client';

import { useEffect } from 'react';

export default function CommunityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Community page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: 'rgba(239,68,68,0.1)' }}>
          <svg className="h-10 w-10 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: '#16325C' }}>
          커뮤니티 페이지를 불러올 수 없습니다
        </h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:shadow-md"
          style={{ background: '#00A1E0' }}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          다시 시도
        </button>
      </div>
    </div>
  );
}
