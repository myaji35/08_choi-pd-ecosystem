'use client';

import { useSession } from '@/hooks/use-session';
import { Clock, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PendingClient() {
  const { user, loading } = useSession();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A1E0]" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-6">
          <Clock className="w-8 h-8 text-orange-500" strokeWidth={2} />
        </div>

        <h1 className="text-xl font-bold text-[#16325C] mb-2">
          승인 대기 중입니다
        </h1>

        <p className="text-sm text-gray-600 mb-6">
          회원 신청이 접수되었습니다. 관리자 승인 후 서비스를 이용하실 수 있습니다.
        </p>

        {user?.slug && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs font-semibold text-gray-600 mb-1">신청한 주소</p>
            <p className="text-sm font-mono text-[#16325C]">
              {user.slug}.chopd.com
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00A1E0] text-white text-sm font-medium rounded-lg hover:bg-[#0090C7] transition-colors"
          >
            <Home className="w-4 h-4" strokeWidth={2} />
            홈으로
          </Link>

          <Link
            href="/dashboard/apply"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            신청서 다시 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
