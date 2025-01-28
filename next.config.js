/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        port: '',
        pathname: '/**',
      },
    ],
    domains: [
      'oaidalleapiprodscus.blob.core.windows.net'
    ],
  },
}

module.exports = nextConfig
