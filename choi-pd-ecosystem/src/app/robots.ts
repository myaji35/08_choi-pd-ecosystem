import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://impd.com'; // 프로덕션 URL로 변경 필요

  const publicDisallow = ['/admin/*', '/pd/*', '/api/*'];
  const fullDisallow = ['/admin/*', '/pd/*', '/api/*', '/_next/*', '/uploads/resources/*'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: fullDisallow,
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/p/*', '/api/public/*'],
        disallow: publicDisallow,
      },
      {
        userAgent: 'Yeti', // 네이버 검색봇
        allow: ['/', '/p/*', '/api/public/*'],
        disallow: publicDisallow,
      },
      // GEO: AI 검색 크롤러 허용
      {
        userAgent: 'OAI-SearchBot', // ChatGPT Search
        allow: ['/', '/p/*', '/api/public/*'],
        disallow: publicDisallow,
      },
      {
        userAgent: 'ChatGPT-User', // ChatGPT browsing
        allow: ['/', '/p/*', '/api/public/*'],
        disallow: publicDisallow,
      },
      {
        userAgent: 'PerplexityBot', // Perplexity AI
        allow: ['/', '/p/*', '/api/public/*'],
        disallow: publicDisallow,
      },
      {
        userAgent: 'Google-Extended', // Gemini AI
        allow: ['/', '/p/*', '/api/public/*'],
        disallow: publicDisallow,
      },
      {
        userAgent: 'cohere-ai', // Cohere
        allow: ['/', '/p/*', '/api/public/*'],
        disallow: publicDisallow,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
