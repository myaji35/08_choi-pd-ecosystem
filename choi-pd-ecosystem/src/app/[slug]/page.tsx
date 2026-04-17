/**
 * 루트 슬러그 숏컷 (impd.me/<slug>)
 * ----------------------------------
 * /byjreporter 같은 최상위 경로로 접근해도 /member/<slug> 와 동일 페이지를 렌더.
 * 파일 시스템 라우팅에서 정적 세그먼트(admin/api/choi/…)가 우선이라
 * 기존 라우트와 충돌하지 않는다.
 *
 * 알려진 예약어는 notFound() 로 분리해 자원 낭비를 막는다.
 */

import { notFound } from 'next/navigation';
import MemberPage from '@/app/member/[slug]/page';

export const dynamic = 'force-dynamic';

// Next.js 정적 세그먼트로 이미 존재하는 최상위 라우트 이름들 + 명백한 비-슬러그.
// 브라우저가 잘못 달라붙는 파일(favicon.ico 등) 방어.
const RESERVED = new Set([
  'admin',
  'api',
  'choi',
  'chopd',
  'dashboard',
  'impd',
  'legal',
  'login',
  'member',
  'notion-demo',
  'onboarding',
  'p',
  'pd',
  'robots.txt',
  'sitemap.xml',
  'favicon.ico',
  'ai.txt',
  'llms.txt',
  'manifest.json',
  'sw.js',
]);

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function RootSlugPage({ params }: Props) {
  const { slug } = await params;
  if (!slug || RESERVED.has(slug) || slug.startsWith('_') || slug.includes('.')) {
    notFound();
  }
  // /member/[slug]/page.tsx 의 기존 로직(members → distributors fallback)을 그대로 재사용
  return <MemberPage params={params} />;
}
