import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { StructuredData } from '@/components/seo/StructuredData';
import { TenantProvider } from '@/lib/tenant/TenantProvider';
import { TranslationProvider } from '@/lib/i18n';
import { Toaster } from 'sonner';
import { getSocialLinks } from '@/lib/db/queries/socialLinks';
import { generatePersonSchema, generateWebSiteSchema } from '@/lib/seo';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'imPD - 최범희 PD | 스마트폰 창업 전문가',
    template: '%s | imPD',
  },
  description: '스마트폰 창업 교육 전문가 최범희 PD의 통합 브랜드 허브. 교육, 미디어, 작품 콘텐츠를 한곳에서. 베이비부머 창업 교육, 한국환경저널 발행, 모바일 스케치 작가.',
  keywords: ['스마트폰 창업', '디지털 마케팅 교육', '베이비부머 창업', '5060 창업', '한국환경저널', '최범희', '최PD', 'imPD', '모바일 스케치'],
  authors: [{ name: '최범희', url: 'https://impd.com' }],
  creator: '최범희',
  publisher: 'imPD',
  robots: 'index,follow',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'imPD',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://impd.com',
    siteName: 'imPD - I\'m PD 최범희',
    title: 'imPD - 최범희 PD | 스마트폰 창업 전문가',
    description: '스마트폰 창업 교육 전문가 최범희 PD의 통합 브랜드 허브. 교육, 미디어, 작품 콘텐츠를 한곳에서.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'imPD - 최범희 PD',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@impd_korea',
    creator: '@impd_korea',
    title: 'imPD - 최범희 PD | 스마트폰 창업 전문가',
    description: '스마트폰 창업 교육 전문가 최범희 PD의 통합 브랜드 허브',
    images: ['/images/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://impd.com',
  },
  verification: {
    google: 'google-site-verification-code', // Google Search Console에서 발급받은 코드로 교체
    other: {
      'naver-site-verification': process.env.NAVER_SITE_VERIFICATION || '',
    },
  },
};

export const revalidate = 3600; // 1시간마다 소셜 링크 갱신

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 백그라운드: DB에서 소셜 링크를 가져와 SEO 구조화 데이터에 자동 반영
  const socialLinks = await getSocialLinks();
  const personSchema = generatePersonSchema(socialLinks);
  const webSiteSchema = generateWebSiteSchema();

  return (
      <html lang="ko" suppressHydrationWarning>
        <head>
          {/* 네이버 인물정보 + Google Knowledge Panel용 구조화 데이터 */}
          <StructuredData data={personSchema} />
          <StructuredData data={webSiteSchema} />
        </head>
        <body className={inter.className}>
          <TenantProvider>
            <TranslationProvider>
              <LayoutShell>
                {children}
              </LayoutShell>
            </TranslationProvider>
          </TenantProvider>
          <Toaster />
        </body>
      </html>
  );
}
