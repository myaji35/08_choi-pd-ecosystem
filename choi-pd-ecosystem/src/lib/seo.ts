import { Metadata } from 'next';

// 기본 SEO 설정
export const defaultSEO = {
  siteName: 'imPD - I\'m PD 최범희',
  siteUrl: 'https://impd.com', // 프로덕션 URL로 변경 필요
  description: '스마트폰 창업 교육 전문가 최범희 PD의 통합 브랜드 허브. 교육, 미디어, 작품 콘텐츠를 한곳에서.',
  keywords: ['스마트폰 창업', '디지털 마케팅 교육', '베이비부머 창업', '환경저널', '최범희', '최PD', '모바일 스케치'],
  ogImage: '/images/og-image.jpg',
  twitterHandle: '@impd_korea',
};

// 페이지별 메타데이터 생성 함수
interface PageMetadata {
  title: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

export function generateMetadata({
  title,
  description = defaultSEO.description,
  keywords = defaultSEO.keywords,
  ogImage = defaultSEO.ogImage,
  canonicalUrl,
  noindex = false,
}: PageMetadata): Metadata {
  const fullTitle = title === defaultSEO.siteName ? title : `${title} | ${defaultSEO.siteName}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: '최범희', url: defaultSEO.siteUrl }],
    creator: '최범희',
    publisher: defaultSEO.siteName,
    robots: noindex ? 'noindex,nofollow' : 'index,follow',
    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      url: canonicalUrl || defaultSEO.siteUrl,
      siteName: defaultSEO.siteName,
      title: fullTitle,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: defaultSEO.twitterHandle,
      creator: defaultSEO.twitterHandle,
      title: fullTitle,
      description,
      images: [ogImage],
    },
    ...(canonicalUrl && {
      alternates: {
        canonical: canonicalUrl,
      },
    }),
  };
}

// 구조화된 데이터 (JSON-LD) 생성
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: defaultSEO.siteName,
    url: defaultSEO.siteUrl,
    logo: `${defaultSEO.siteUrl}/images/logo.png`,
    description: defaultSEO.description,
    founder: {
      '@type': 'Person',
      name: '최범희',
      jobTitle: 'PD, 스마트폰 창업 교육 전문가',
    },
    sameAs: [
      'https://www.facebook.com/impd.korea',
      'https://www.instagram.com/impd.korea',
      'https://www.youtube.com/c/impd',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'contact@impd.com',
    },
  };
}

export function generatePersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: '최범희',
    alternateName: '최PD',
    description: '스마트폰 창업 교육 전문가, 한국환경저널 발행인, 모바일 스케치 작가',
    url: defaultSEO.siteUrl,
    image: `${defaultSEO.siteUrl}/images/profile.jpg`,
    jobTitle: 'PD, 교육 전문가, 발행인',
    worksFor: {
      '@type': 'Organization',
      name: defaultSEO.siteName,
    },
    sameAs: [
      'https://www.facebook.com/impd.korea',
      'https://www.instagram.com/impd.korea',
      'https://www.youtube.com/c/impd',
    ],
  };
}

export function generateCourseSchema(course: {
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: defaultSEO.siteName,
    },
    ...(course.price && {
      offers: {
        '@type': 'Offer',
        price: course.price,
        priceCurrency: 'KRW',
      },
    }),
    ...(course.thumbnailUrl && {
      image: course.thumbnailUrl,
    }),
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${defaultSEO.siteUrl}${item.url}`,
    })),
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  publishedDate: Date;
  modifiedDate?: Date;
  imageUrl?: string;
  authorName?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.imageUrl || defaultSEO.ogImage,
    datePublished: article.publishedDate.toISOString(),
    dateModified: (article.modifiedDate || article.publishedDate).toISOString(),
    author: {
      '@type': 'Person',
      name: article.authorName || '최범희',
    },
    publisher: {
      '@type': 'Organization',
      name: defaultSEO.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${defaultSEO.siteUrl}/images/logo.png`,
      },
    },
  };
}
