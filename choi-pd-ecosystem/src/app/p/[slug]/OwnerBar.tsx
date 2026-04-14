'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SharePanel } from './SharePanel';

interface OwnerBarProps {
  slug: string;
  brandName: string;
}

export function OwnerBar({ slug, brandName }: OwnerBarProps) {
  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`/api/pomelli/owner-check?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data: { isOwner: boolean }) => setIsOwner(data.isOwner))
      .catch(() => setIsOwner(false));
  }, [slug]);

  if (!isOwner) return null;

  return (
    <div className="bg-[#16325C] text-white px-4 py-2">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <span className="text-xs text-white/70">
          이 페이지는 방문자에게 이렇게 보입니다
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={`/${slug}/settings`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            편집
          </Link>
          <SharePanel slug={slug} brandName={brandName} primaryColor="#ffffff" compact />
        </div>
      </div>
    </div>
  );
}
