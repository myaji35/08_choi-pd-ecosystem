/** @type {import('next').NextConfig} */
const path = require('path');
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
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
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

module.exports = withPWA(nextConfig)
