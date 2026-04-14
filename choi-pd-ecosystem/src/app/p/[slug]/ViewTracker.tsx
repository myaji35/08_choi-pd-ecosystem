'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
  slug: string;
}

/**
 * 마운트 시 view 이벤트를 1회 기록한다.
 * sessionStorage로 중복 기록을 방지한다.
 * fire-and-forget (navigator.sendBeacon 우선, fallback: fetch).
 */
export function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    const storageKey = `pomelli:view:${slug}`;
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(storageKey)) {
      return;
    }

    const payload = JSON.stringify({ tenantSlug: slug, eventType: 'view' });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/track', blob);
    } else {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => { /* 무음 처리 */ });
    }

    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem(storageKey, '1');
      } catch {
        // sessionStorage 쓰기 실패 시 무시
      }
    }
  }, [slug]);

  return null;
}
