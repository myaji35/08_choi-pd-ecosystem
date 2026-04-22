/**
 * ISS-067: ReviewsSection
 * /p/[slug] 공개 페이지의 리뷰 섹션.
 *  - 승인된 리뷰(status in ('triaged','responded') 또는 isApproved=1) 목록
 *  - 하단에 ReviewSubmitForm 장착
 */

import { Star } from 'lucide-react';
import { ReviewSubmitForm } from '@/components/member/ReviewSubmitForm';

export interface PublicReviewItem {
  id: number;
  reviewerName: string;
  rating: number;
  content: string | null;
  createdAt: string | null;
}

interface Props {
  memberSlug: string;
  memberId: number;
  reviews: PublicReviewItem[];
  primaryColor?: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function ReviewsSection({ memberSlug, memberId, reviews, primaryColor = '#00A1E0' }: Props) {
  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : null;

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">고객 리뷰</h2>
          <p className="mt-1 text-xs text-gray-500">
            실제 고객이 남긴 후기입니다. 누구나 자유롭게 작성할 수 있습니다.
          </p>
        </div>
        {avgRating !== null && (
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-amber-400" strokeWidth={2} fill="currentColor" />
              <span className="text-lg font-bold text-gray-900">{avgRating}</span>
            </div>
            <p className="text-xs text-gray-500">{reviews.length}개 리뷰</p>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="py-8 text-center">
          <Star className="w-8 h-8 mx-auto text-gray-300" strokeWidth={2} fill="none" />
          <p className="mt-2 text-sm text-gray-500">아직 리뷰가 없습니다. 첫 리뷰를 남겨주세요.</p>
        </div>
      ) : (
        <ul className="space-y-4 mb-6">
          {reviews.map((r) => (
            <li key={r.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{r.reviewerName}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`w-3.5 h-3.5 ${n <= r.rating ? 'text-amber-400' : 'text-gray-300'}`}
                        strokeWidth={2}
                        fill={n <= r.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
              </div>
              {r.content && (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {r.content}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-gray-200 pt-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3">리뷰 남기기</h3>
        <ReviewSubmitForm memberSlug={memberSlug} memberId={memberId} primaryColor={primaryColor} />
      </div>
    </section>
  );
}

export default ReviewsSection;
