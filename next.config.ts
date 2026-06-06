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
  allowedDevOrigins: ['192.168.1.38', '192.168.1.55'],
  serverExternalPackages: ['mongoose'],

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent clickjacking — no embedding in iframes on other origins
          { key: 'X-Frame-Options',        value: 'DENY' },
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Enable browser XSS filter (legacy browsers)
          { key: 'X-XSS-Protection',       value: '1; mode=block' },
          // Only send origin in referrer header for cross-origin requests
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
          // Restrict browser feature access
          { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=(self), payment=(self)' },
          // Force HTTPS for 2 years (only active in production — no effect on HTTP)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
