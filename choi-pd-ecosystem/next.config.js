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
}

module.exports = withPWA(nextConfig)
