/**
 * In-memory Rate Limiter (Redis 없이 Map 기반)
 * 서버리스/Edge 환경보다 Node.js 단일 인스턴스에 적합
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// 1분마다 만료된 엔트리 cleanup
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
  }, 60_000);
}

/**
 * Rate limit 체크
 * @param key     식별 키 (IP, userId 등)
 * @param limit   window 내 최대 허용 횟수
 * @param windowMs window 크기 (밀리초)
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    // 신규 또는 만료된 window → 초기화
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}
