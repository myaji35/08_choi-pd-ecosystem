import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import Link from 'next/link';
import { getTemplate, resolveHeroText } from '@/lib/member-templates';

// SNS 아이콘 매핑 (Feather-style SVG)
const SNS_ICONS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  instagram: {
    label: 'Instagram',
    color: '#E4405F',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  youtube: {
    label: 'YouTube',
    color: '#FF0000',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
  },
  facebook: {
    label: 'Facebook',
    color: '#1877F2',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  twitter: {
    label: 'X (Twitter)',
    color: '#000000',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
      </svg>
    ),
  },
  linkedin: {
    label: 'LinkedIn',
    color: '#0A66C2',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  blog: {
    label: 'Blog',
    color: '#03C75A',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  website: {
    label: 'Website',
    color: '#00A1E0',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
};

// 모듈 한글 라벨 매핑
const MODULE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  portfolio: {
    label: '포트폴리오',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  services: {
    label: '서비스',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  blog: {
    label: '블로그',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  contact: {
    label: '문의하기',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  reviews: {
    label: '후기',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  booking: {
    label: '예약',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
};

interface MemberPageProps {
  params: Promise<{ slug: string }>;
}

export default async function MemberPage({ params }: MemberPageProps) {
  const { slug } = await params;

  const result = await db
    .select()
    .from(members)
    .where(and(eq(members.slug, slug), eq(members.status, 'approved')))
    .limit(1);

  if (result.length === 0) {
    notFound();
  }

  const member = result[0];
  const socialLinks: Record<string, string> = member.socialLinks
    ? JSON.parse(member.socialLinks)
    : {};
  const enabledModules: string[] = member.enabledModules
    ? JSON.parse(member.enabledModules)
    : [];
  const themeConfig = member.themeConfig
    ? JSON.parse(member.themeConfig)
    : {};

  // 직업별 템플릿 적용 (JSON 파일 기반)
  const template = getTemplate((member as any).profession);
  const accentColor = themeConfig.primaryColor || template.theme.accentColor;
  const heroTitle = resolveHeroText(themeConfig.heroTitle || template.hero.title, member.name);
  const heroSubtitle = resolveHeroText(themeConfig.heroSubtitle || template.hero.subtitle, member.name);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover + Hero */}
      <div className={`relative w-full min-h-[280px] bg-gradient-to-r ${template.theme.coverGradient} flex items-end`}>
        {member.coverImage && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={member.coverImage}
              alt={`${member.name} 커버 이미지`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        )}
        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 pb-20 pt-12">
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            {heroTitle}
          </h2>
          <p className="mt-2 text-base sm:text-lg" style={{ color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            {heroSubtitle}
          </p>
        </div>
      </div>

      {/* Profile Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="relative -mt-16 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
            {/* Profile Photo */}
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex-shrink-0">
              {member.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.profileImage}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
            </div>

            {/* Name, Badge & Bio */}
            <div className="text-center sm:text-left pb-2">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: accentColor, color: 'white' }}
                >
                  {template.label}
                </span>
              </div>
              {member.bio && (
                <p className="mt-1 text-gray-600 text-sm leading-relaxed max-w-lg">
                  {member.bio}
                </p>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 mt-4 justify-center sm:justify-start">
            <button
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
              style={{ background: accentColor }}
            >
              {template.cta.primary}
            </button>
            <button
              className="px-5 py-2.5 rounded-lg text-sm font-semibold border-2 hover:bg-gray-50 transition-colors"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              {template.cta.secondary}
            </button>
          </div>
        </div>

        {/* SNS Links */}
        {Object.keys(socialLinks).length > 0 && (
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-6">
            {Object.entries(socialLinks).map(([platform, url]) => {
              if (!url) return null;
              const snsInfo = SNS_ICONS[platform];
              if (!snsInfo) return null;

              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all text-sm"
                  title={snsInfo.label}
                >
                  <span style={{ color: snsInfo.color }}>{snsInfo.icon}</span>
                  <span className="hidden sm:inline">{snsInfo.label}</span>
                </a>
              );
            })}
          </div>
        )}

        {/* Module Tabs */}
        {enabledModules.length > 0 && (
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-1 overflow-x-auto pb-px" aria-label="모듈 탭">
              {enabledModules.map((mod: string, index: number) => {
                const moduleInfo = MODULE_LABELS[mod];
                if (!moduleInfo) return null;

                // 템플릿에서 커스텀 라벨 사용
                const customLabel = template.modules.labels[mod] || moduleInfo.label;

                return (
                  <button
                    key={mod}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      index === 0
                        ? 'border-[#00A1E0] text-[#00A1E0]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    style={index === 0 ? { borderColor: accentColor, color: accentColor } : undefined}
                  >
                    {moduleInfo.icon}
                    {customLabel}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Module Content (placeholder) */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          {enabledModules.length > 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-medium">
                콘텐츠를 준비 중입니다
              </p>
              <p className="text-gray-400 text-xs mt-1">
                곧 새로운 콘텐츠가 업데이트될 예정입니다.
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">
                아직 활성화된 모듈이 없습니다.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Powered by{' '}
            <Link
              href="https://impd.townin.net"
              className="text-[#00A1E0] hover:underline"
            >
              imPD
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
