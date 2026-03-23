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

// 소셜 URL 목록에서 유효한 것만 필터
export function filterValidUrls(urls: (string | undefined | null)[]): string[] {
  return urls.filter((url): url is string => !!url && url.startsWith('http'));
}

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
// 소셜 링크 인터페이스 (DB settings에서 로드)
export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  twitter?: string;
  blog?: string;
  naverBlog?: string;
}

export function generateOrganizationSchema(socialLinks?: SocialLinks) {
  const sameAs = filterValidUrls([
    socialLinks?.facebook,
    socialLinks?.instagram,
    socialLinks?.youtube,
    socialLinks?.linkedin,
    socialLinks?.twitter,
    socialLinks?.blog,
    socialLinks?.naverBlog,
  ]);

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
    sameAs,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'contact@impd.com',
    },
  };
}

/**
 * 네이버 인물정보 + Google Knowledge Panel 최적화 Person Schema
 * - 네이버 검색에서 인물정보 카드에 표시되려면 schema.org/Person 규격이 필수
 * - sameAs에 공식 SNS URL을 넣으면 네이버/구글이 동일인물 인식
 */
export function generatePersonSchema(socialLinks?: SocialLinks) {
  const sameAs = filterValidUrls([
    socialLinks?.facebook,
    socialLinks?.instagram,
    socialLinks?.youtube,
    socialLinks?.linkedin,
    socialLinks?.twitter,
    socialLinks?.blog,
    socialLinks?.naverBlog,
  ]);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${defaultSEO.siteUrl}/#person`,
    name: '최범희',
    alternateName: ['최PD', 'Choi Beom-hee', 'Beomhee Choi'],
    description: '스마트폰 창업 교육 전문가, 한국환경저널 발행인, 모바일 스케치 작가. 5060 베이비부머 세대를 위한 디지털 마케팅·스마트폰 활용 창업 교육을 전문으로 합니다.',
    url: defaultSEO.siteUrl,
    image: {
      '@type': 'ImageObject',
      url: `${defaultSEO.siteUrl}/images/profile.jpg`,
      width: 400,
      height: 400,
    },
    jobTitle: ['스마트폰 창업 전략가', '한국환경저널 발행인', '모바일 스케치 작가'],
    nationality: {
      '@type': 'Country',
      name: '대한민국',
    },
    knowsAbout: [
      '스마트폰 창업',
      '디지털 마케팅',
      '베이비부머 창업 교육',
      '환경 저널리즘',
      '모바일 스케치',
      'SNS 마케팅',
      '1인 창업',
      '시니어 교육',
    ],
    knowsLanguage: ['ko', 'en'],
    worksFor: {
      '@type': 'Organization',
      name: defaultSEO.siteName,
      url: defaultSEO.siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': defaultSEO.siteUrl,
    },
    sameAs,
  };
}

/**
 * 네이버 인물정보용 WebSite schema (사이트 검색 지원)
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${defaultSEO.siteUrl}/#website`,
    name: defaultSEO.siteName,
    url: defaultSEO.siteUrl,
    description: defaultSEO.description,
    publisher: {
      '@id': `${defaultSEO.siteUrl}/#person`,
    },
    inLanguage: 'ko-KR',
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
