import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Main rule — allow all public content
        userAgent: '*',
        allow: [
          '/',
          '/en/',
          '/hi/',
          '/en/packages/',
          '/en/places/',
          '/en/hotels/',
          '/en/restaurants/',
          '/en/blog/',
          '/en/about',
          '/en/contact',
          '/en/faq',
          '/en/privacy',
          '/en/terms',
          '/images/',
          '/logo/',
        ],
        disallow: [
          '/admin/',
          '/superadmin/',
          '/driver/',
          '/api/',
          '/_next/',
          '/maintenance',
          '/en/booking/',          // booking flow — not useful for indexing
          '/en/customer/',         // private customer portal
          '/hi/booking/',
          '/hi/customer/',
          '/en/verify-email',
          '/hi/verify-email',
        ],
      },
      {
        // Block AI training crawlers
        userAgent: ['GPTBot', 'ChatGPT-User', 'Google-Extended', 'CCBot', 'anthropic-ai', 'Claude-Web'],
        disallow: ['/'],
      },
    ],
    sitemap: 'https://mathuravrindavandhamyatra.com/sitemap.xml',
    host:    'https://mathuravrindavandhamyatra.com',
  }
}
