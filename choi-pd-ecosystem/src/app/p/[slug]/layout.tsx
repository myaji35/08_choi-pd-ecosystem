import type { Metadata, Viewport } from 'next';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface BrandPageLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateViewport({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Viewport> {
  const { slug } = await params;

  const result = await db
    .select({ primaryColor: tenants.primaryColor })
    .from(tenants)
    .where(and(eq(tenants.slug, slug), eq(tenants.status, 'active')))
    .limit(1);

  const themeColor =
    result.length > 0 && result[0].primaryColor
      ? result[0].primaryColor
      : '#00A1E0';

  return {
    width: 'device-width',
    initialScale: 1,
    themeColor,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const result = await db
    .select({
      name: tenants.name,
      profession: tenants.profession,
      logoUrl: tenants.logoUrl,
      settings: tenants.settings,
      metadata: tenants.metadata,
    })
    .from(tenants)
    .where(and(eq(tenants.slug, slug), eq(tenants.status, 'active')))
    .limit(1);

  if (result.length === 0) {
    return {
      title: '페이지를 찾을 수 없습니다',
    };
  }

  const t = result[0];
  const settings = t.settings ? JSON.parse(t.settings) : {};
  const meta = t.metadata ? JSON.parse(t.metadata) : {};
  const bio = settings.bio || meta.bio || `${t.name}의 브랜드 페이지`;

  return {
    title: `${t.name} | imPD`,
    description: bio,
    openGraph: {
      title: `${t.name} | imPD`,
      description: bio,
      type: 'profile',
      images: t.logoUrl ? [{ url: t.logoUrl }] : [],
    },
  };
}

export default function BrandPageLayout({ children }: BrandPageLayoutProps) {
  return <>{children}</>;
}
