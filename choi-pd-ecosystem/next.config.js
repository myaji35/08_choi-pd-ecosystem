/** @type {import('next').NextConfig} */
const path = require('path');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  sw: 'sw.js',
  cacheOnNavigation: true,
  cacheStartUrl: true,
  dynamicStartUrl: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    localPatterns: [
      {
        pathname: '/images/**',
      },
      {
        pathname: '/public/images/**',
      },
    ],
  },
  // Turbopack 일시적으로 비활성화 (빌드 에러 해결)
  // turbopack: {
  //   root: __dirname,
  // },
  // Docker/Coolify 배포를 위한 standalone 출력 설정
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  // 와일드카드 서브도메인 지원: *.impd.{IP}.nip.io
  // Next.js가 모든 호스트에서 요청을 받아들이도록 허용
  // 서브도메인 라우팅은 middleware.ts에서 처리
  allowedDevOrigins: ['*.impd.158.247.235.31.nip.io'],
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
  // 환경변수를 런타임에 사용 가능하게 (서버사이드)
  serverRuntimeConfig: {
    BASE_DOMAIN: process.env.BASE_DOMAIN || 'impd.158.247.235.31.nip.io',
  },
  // 클라이언트에도 BASE_DOMAIN 전달
  publicRuntimeConfig: {
    BASE_DOMAIN: process.env.BASE_DOMAIN || 'impd.158.247.235.31.nip.io',
  },
  // 404 에러 해결을 위한 리다이렉트 설정
  async redirects() {
    return [
      {
        source: '/education',
        destination: '/chopd/education',
        permanent: true,
      },
      {
        source: '/media',
        destination: '/chopd/media',
        permanent: true,
      },
      {
        source: '/works',
        destination: '/chopd/works',
        permanent: true,
      },
      {
        source: '/community',
        destination: '/chopd/community',
        permanent: true,
      },
      {
        source: '/works/book',
        destination: '/chopd/works',
        permanent: true,
      },
      {
        source: '/media/greeting',
        destination: '/chopd/media/greeting',
        permanent: true,
      },
    ];
  },
}

module.exports = withBundleAnalyzer(withPWA(nextConfig))
