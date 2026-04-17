/**
 * kamal-proxy healthcheck 전용 엔드포인트.
 * kamal-proxy v0.9+ 는 target booting 시 기본으로 GET /up 을 호출한다.
 * Next.js standalone 기본엔 해당 라우트가 없어 404 → proxy timeout(30s) → 배포 롤백.
 * 이 파일이 200 OK 를 즉시 응답하여 배포 체인을 건강하게 유지한다.
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function GET() {
  return new Response('OK', {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export function HEAD() {
  return new Response(null, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}
