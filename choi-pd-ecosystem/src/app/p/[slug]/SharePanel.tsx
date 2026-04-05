'use client';

import { useState } from 'react';

interface SharePanelProps {
  slug: string;
  brandName: string;
  primaryColor: string;
}

export function SharePanel({ slug, brandName, primaryColor }: SharePanelProps) {
  const [isPublished, setIsPublished] = useState(false);
  const [copied, setCopied] = useState(false);

  const pageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${slug}`
    : `https://impd.io/${slug}`;

  const handlePublish = () => {
    setIsPublished(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = pageUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: brandName,
          text: `${brandName} 브랜드 페이지를 확인해 보세요!`,
          url: pageUrl,
        });
      } catch { /* cancelled */ }
    } else {
      handleCopy();
    }
  };

  const handleKakao = () => {
    const kakaoUrl = `https://sharer.kakao.com/talk/friends/picker/shorturl?app_key=javascript_key&request_url=${encodeURIComponent(pageUrl)}`;
    window.open(`https://story.kakao.com/share?url=${encodeURIComponent(pageUrl)}`, '_blank', 'width=600,height=400');
  };

  if (!isPublished) {
    return (
      <button
        onClick={handlePublish}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
        style={{ background: primaryColor }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        이대로 공개하기
      </button>
    );
  }

  return (
    <div className="w-full mt-4 p-5 rounded-lg border-2 border-green-200 bg-green-50/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-[#16325C]">페이지가 공개되었습니다!</p>
          <p className="text-xs text-gray-500">이제 링크를 공유하여 방문자를 모아보세요.</p>
        </div>
      </div>

      {/* URL 복사 */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-white rounded-lg border border-gray-200">
        <span className="flex-1 text-sm font-mono text-[#16325C] truncate">{pageUrl}</span>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
          style={{
            background: copied ? '#059669' : primaryColor,
            color: 'white',
          }}
        >
          {copied ? '복사됨!' : '복사'}
        </button>
      </div>

      {/* 공유 버튼들 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ background: primaryColor }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          공유하기
        </button>

        <button
          onClick={handleKakao}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#FEE500] text-[#3C1E1E] hover:bg-[#F5DC00] transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.48 3 2 6.58 2 10.89c0 2.78 1.82 5.22 4.57 6.59-.14.52-.91 3.37-.94 3.58 0 0-.02.15.08.21.1.06.22.03.22.03.29-.04 3.37-2.2 3.9-2.57.69.1 1.41.15 2.17.15 5.52 0 10-3.58 10-7.99C22 6.58 17.52 3 12 3z"/>
          </svg>
          카카오톡
        </button>

        <a
          href={`sms:?body=${encodeURIComponent(`${brandName} 브랜드 페이지: ${pageUrl}`)}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-[#16325C] hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          문자로 보내기
        </a>
      </div>
    </div>
  );
}
