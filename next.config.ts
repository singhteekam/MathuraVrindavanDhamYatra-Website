import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary — admin-uploaded images
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Unsplash — free stock photos (no copyright for commercial use)
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Wikimedia Commons — public domain / CC licensed temple photos
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      // Google user content (profile avatars from Google OAuth)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  allowedDevOrigins: ['192.168.1.38'],
  serverExternalPackages: ['mongoose'],
}

export default withNextIntl(nextConfig)
