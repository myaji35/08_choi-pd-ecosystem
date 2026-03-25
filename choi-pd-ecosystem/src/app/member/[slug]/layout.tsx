import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface MemberLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const member = await db
    .select({
      name: members.name,
      bio: members.bio,
      profileImage: members.profileImage,
    })
    .from(members)
    .where(and(eq(members.slug, slug), eq(members.status, 'approved')))
    .limit(1);

  if (member.length === 0) {
    return {
      title: '회원을 찾을 수 없습니다',
    };
  }

  const m = member[0];
  const description = m.bio || `${m.name}님의 개인 비즈니스 페이지`;

  return {
    title: `${m.name} | imPD`,
    description,
    openGraph: {
      title: `${m.name} | imPD`,
      description,
      type: 'profile',
      images: m.profileImage ? [{ url: m.profileImage }] : [],
    },
  };
}

export default function MemberLayout({ children }: MemberLayoutProps) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
