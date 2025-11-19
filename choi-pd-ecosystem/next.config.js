/** @type {import('next').NextConfig} */
const path = require('path');

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
  turbopack: {
    root: __dirname,
  },
}

module.exports = nextConfig
