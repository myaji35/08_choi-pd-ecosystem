'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { Send, CheckCircle, XCircle, Loader2, Globe } from 'lucide-react';

export default function ApplyPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  const [slug, setSlug] = useState('');
  const [businessType, setBusinessType] = useState('individual');
  const [region, setRegion] = useState('');
  const [bio, setBio] = useState('');

  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [slugMessage, setSlugMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 실시간 slug 체크 (debounce)
  const checkSlug = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setSlugStatus('idle');
      setSlugMessage('');
      return;
    }

    setSlugStatus('checking');
    try {
      const res = await fetch(`/api/dashboard/apply/check-slug?slug=${encodeURIComponent(value)}`);
      const data = await res.json();

      if (data.available) {
        setSlugStatus('available');
        setSlugMessage('사용 가능한 주소입니다.');
      } else {
        setSlugStatus('unavailable');
        setSlugMessage(data.reason || '사용할 수 없는 주소입니다.');
      }
    } catch {
      setSlugStatus('idle');
      setSlugMessage('확인 중 오류가 발생했습니다.');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (slug) checkSlug(slug);
    }, 500);
    return () => clearTimeout(timer);
  }, [slug, checkSlug]);

  // 세션 없으면 로그인으로
  useEffect(() => {
    if (!sessionLoading && !user) {
      router.push('/login');
    }
  }, [sessionLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (slugStatus !== 'available') {
      setError('사용 가능한 slug를 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/dashboard/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, businessType, region, bio }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/dashboard/pending');
      } else {
        setError(data.error || '신청 처리에 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A1E0]" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#16325C] px-6 py-5">
          <h1 className="text-lg font-bold text-white">회원 가입 신청</h1>
          <p className="text-sm text-white/70 mt-1">
            나만의 브랜드 페이지를 만들어 보세요
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              페이지 주소 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 py-2.5 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-500">
                  <Globe className="w-4 h-4 mr-1.5" strokeWidth={2} />
                  chopd.com/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="my-brand"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-r-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
                  maxLength={30}
                />
              </div>
              {/* Slug status indicator */}
              {slugStatus !== 'idle' && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  {slugStatus === 'checking' && (
                    <>
                      <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" strokeWidth={2} />
                      <span className="text-xs text-gray-400">확인 중...</span>
                    </>
                  )}
                  {slugStatus === 'available' && (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" strokeWidth={2} />
                      <span className="text-xs text-green-600">{slugMessage}</span>
                    </>
                  )}
                  {slugStatus === 'unavailable' && (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-red-500" strokeWidth={2} />
                      <span className="text-xs text-red-600">{slugMessage}</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              영문 소문자, 숫자, 하이픈(-) 사용 가능 (3~30자)
            </p>
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              사업 유형
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
            >
              <option value="individual">개인</option>
              <option value="company">기업</option>
              <option value="organization">기관/단체</option>
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              활동 지역
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="예: 서울, 경기"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              자기소개
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="간단한 자기소개를 작성해 주세요"
              rows={4}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0] resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" strokeWidth={2} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || slugStatus !== 'available'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00A1E0] text-white text-sm font-medium rounded-lg hover:bg-[#0090C7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                신청 중...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" strokeWidth={2} />
                가입 신청
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
