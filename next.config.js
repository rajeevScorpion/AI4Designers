/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['drizzle-orm'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig