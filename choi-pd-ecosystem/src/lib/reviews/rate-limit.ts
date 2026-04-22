/**
 * ISS-067: 리뷰 제출 rate limit (메모리 기반)
 *
 * IP당 1시간 내 최대 3회 제출 허용.
 * 프로덕션 다중 인스턴스 환경에서는 Redis 기반으로 교체 필요.
 */

const WINDOW_MS = 60 * 60 * 1000; // 1h
const MAX_PER_WINDOW = 3;

type Bucket = { hits: number[]; };
const buckets = new Map<string, Bucket>();

/**
 * @returns true = 허용, false = rate limit 초과
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip) ?? { hits: [] };
  // 만료된 타임스탬프 제거
  bucket.hits = bucket.hits.filter((t) => now - t < WINDOW_MS);
  if (bucket.hits.length >= MAX_PER_WINDOW) {
    buckets.set(ip, bucket);
    return false;
  }
  bucket.hits.push(now);
  buckets.set(ip, bucket);
  return true;
}

export function extractIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}
