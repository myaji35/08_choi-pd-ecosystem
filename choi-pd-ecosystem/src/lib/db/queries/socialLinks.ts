import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';
import type { SocialLinks } from '@/lib/seo';

const SOCIAL_KEYS: string[] = [
  'social_facebook',
  'social_instagram',
  'social_youtube',
  'social_linkedin',
  'social_twitter',
  'social_blog',
  'social_naver_blog',
];

/**
 * DB settings에서 소셜 링크 URL을 가져온다.
 * SSR/SSG에서 사용하며, 결과는 ISR revalidate에 의해 캐싱된다.
 */
export async function getSocialLinks(): Promise<SocialLinks> {
  const rows = await db.query.settings.findMany({
    where: inArray(settings.key, SOCIAL_KEYS),
  });

  const getValue = (key: string): string | undefined =>
    rows.find((r: { key: string; value: string }) => r.key === key)?.value || undefined;

  return {
    facebook: getValue('social_facebook'),
    instagram: getValue('social_instagram'),
    youtube: getValue('social_youtube'),
    linkedin: getValue('social_linkedin'),
    twitter: getValue('social_twitter'),
    blog: getValue('social_blog'),
    naverBlog: getValue('social_naver_blog'),
  };
}
