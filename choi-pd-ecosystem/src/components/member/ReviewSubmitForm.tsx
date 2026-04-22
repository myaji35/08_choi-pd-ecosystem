'use client';

/**
 * ISS-067: ReviewSubmitForm
 * 공개 페이지 /p/[slug] 에서 고객이 리뷰를 남기는 폼.
 *
 * UI 규칙 (CLAUDE.md 가독성 절대 규칙):
 *   input/textarea: border-gray-300, text-sm, py-2.5
 *   label: text-xs font-semibold text-gray-600 mb-1.5
 *   success 배지: solid 배경(#00A1E0) + white
 *   별점 아이콘: stroke-width=2, 선택 시 fill=currentColor
 */

import { useState } from 'react';
import { Star } from 'lucide-react';

interface Props {
  memberSlug: string;
  memberId: number;
  primaryColor?: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export function ReviewSubmitForm({ memberSlug, primaryColor = '#00A1E0' }: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [hashEmail, setHashEmail] = useState(true);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSubmit =
    rating >= 1 &&
    rating <= 5 &&
    reviewerName.trim().length >= 1 &&
    content.trim().length >= 10 &&
    status !== 'submitting';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus('submitting');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/member/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberSlug,
          rating,
          content: content.trim(),
          reviewerName: reviewerName.trim(),
          email: email.trim() || undefined,
          hashEmail,
        }),
      });

      const data = await res.json().catch(() => ({} as { error?: string }));
      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data?.error || '제출에 실패했습니다');
        return;
      }

      setStatus('success');
      setRating(0);
      setReviewerName('');
      setContent('');
      setEmail('');
    } catch {
      setStatus('error');
      setErrorMsg('네트워크 오류가 발생했습니다');
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <div
          className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ background: primaryColor }}
        >
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="font-semibold text-[#16325C] mb-1">리뷰가 접수되었습니다</p>
        <p className="text-sm text-gray-500">검토 후 공개될 예정입니다.</p>
        <div className="mt-4 inline-flex">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ background: primaryColor }}
          >
            감사합니다
          </span>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="text-sm font-medium hover:underline"
            style={{ color: primaryColor }}
          >
            새 리뷰 작성
          </button>
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* 별점 */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          별점 <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="별점 선택">
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = (hoverRating || rating) >= n;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n}점`}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none focus:ring-2 focus:ring-[#00A1E0] rounded"
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    filled ? 'text-amber-400' : 'text-gray-300'
                  }`}
                  strokeWidth={2}
                  fill={filled ? 'currentColor' : 'none'}
                />
              </button>
            );
          })}
          <span className="ml-2 text-sm text-gray-600">
            {rating > 0 ? `${rating}점` : '선택해주세요'}
          </span>
        </div>
      </div>

      {/* 이름 */}
      <div>
        <label htmlFor="review-name" className="block text-xs font-semibold text-gray-600 mb-1.5">
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          id="review-name"
          type="text"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          placeholder="홍길동"
          maxLength={60}
          className={inputClass}
          required
        />
      </div>

      {/* 내용 */}
      <div>
        <label htmlFor="review-content" className="block text-xs font-semibold text-gray-600 mb-1.5">
          리뷰 내용 <span className="text-red-500">*</span>
          <span className="ml-2 font-normal text-gray-400">(10자 이상)</span>
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="솔직한 후기를 남겨주세요."
          rows={4}
          maxLength={2000}
          className={`${inputClass} resize-none`}
          required
        />
        <div className="mt-1 text-xs text-gray-400 text-right">
          {content.trim().length} / 2000
        </div>
      </div>

      {/* 이메일 (선택) */}
      <div>
        <label htmlFor="review-email" className="block text-xs font-semibold text-gray-600 mb-1.5">
          이메일 <span className="font-normal text-gray-400">(선택)</span>
        </label>
        <input
          id="review-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          className={inputClass}
        />
        <label className="mt-2 inline-flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={hashEmail}
            onChange={(e) => setHashEmail(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#00A1E0] focus:ring-[#00A1E0]"
          />
          이메일을 해시로 저장 (권장)
        </label>
      </div>

      {/* 에러 */}
      {status === 'error' && errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* 제출 */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50"
        style={{ background: primaryColor }}
      >
        {status === 'submitting' ? '전송 중...' : '리뷰 남기기'}
      </button>
    </form>
  );
}

export default ReviewSubmitForm;
