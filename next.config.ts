import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
  async redirects() {
    return [
      // Add any old WordPress URL redirects here
      // Example:
      // { source: '/old-wp-path', destination: '/new-path', permanent: true },
    ]
  },
}

export default nextConfig
