import { MetadataRoute } from 'next'
import { connectDB }     from '@/lib/db'
import Package           from '@/models/Package'
import Place             from '@/models/Place'

const BASE  = 'https://mathuravrindavandhamyatra.com'
const NOW   = new Date()
const LOCALES = ['en', 'hi'] as const

// ── Static public pages ───────────────────────────────────────────────────────
const STATIC_PAGES = [
  { path: '',             priority: 1.0,  changeFreq: 'daily'   },
  { path: '/packages',    priority: 0.95, changeFreq: 'daily'   },
  { path: '/places',      priority: 0.9,  changeFreq: 'weekly'  },
  { path: '/hotels',      priority: 0.85, changeFreq: 'weekly'  },
  { path: '/restaurants', priority: 0.85, changeFreq: 'weekly'  },
  { path: '/blog',        priority: 0.8,  changeFreq: 'weekly'  },
  { path: '/booking',     priority: 0.9,  changeFreq: 'monthly' },
  { path: '/about',       priority: 0.7,  changeFreq: 'monthly' },
  { path: '/contact',     priority: 0.75, changeFreq: 'monthly' },
  { path: '/faq',         priority: 0.7,  changeFreq: 'monthly' },
  { path: '/privacy',     priority: 0.4,  changeFreq: 'yearly'  },
  { path: '/terms',       priority: 0.4,  changeFreq: 'yearly'  },
  { path: '/login',       priority: 0.3,  changeFreq: 'yearly'  },
  { path: '/register',    priority: 0.3,  changeFreq: 'yearly'  },
]

// ── Blog slugs (static — from blogContent lib) ───────────────────────────────
const BLOG_SLUGS = [
  'best-temples-mathura-vrindavan',
  'mathura-vrindavan-travel-guide',
  'govardhan-parikrama-guide',
  'janmashtami-mathura-guide',
  'holi-festival-barsana-guide',
  'vrindavan-restaurants-pure-veg',
  'best-time-visit-mathura-vrindavan',
  'mathura-vrindavan-budget-trip',
]

type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // 1. Root redirect (/)
  entries.push({ url: BASE, lastModified: NOW, changeFrequency: 'daily', priority: 1.0 })

  // 2. Static pages — both locales
  for (const locale of LOCALES) {
    for (const page of STATIC_PAGES) {
      entries.push({
        url:             `${BASE}/${locale}${page.path}`,
        lastModified:    NOW,
        changeFrequency: page.changeFreq as ChangeFrequency,
        priority:        page.priority,
        // hreflang alternates
        alternates: {
          languages: {
            'en-IN': `${BASE}/en${page.path}`,
            'hi-IN': `${BASE}/hi${page.path}`,
          },
        },
      })
    }
  }

  // 3. Blog posts
  for (const slug of BLOG_SLUGS) {
    entries.push({
      url:             `${BASE}/en/blog/${slug}`,
      lastModified:    NOW,
      changeFrequency: 'monthly',
      priority:        0.65,
      alternates: {
        languages: {
          'en-IN': `${BASE}/en/blog/${slug}`,
          'hi-IN': `${BASE}/hi/blog/${slug}`,
        },
      },
    })
  }

  // 4. Dynamic packages (fetch from DB)
  try {
    await connectDB()
    const packages = await Package.find({ isActive: true })
      .select('slug updatedAt')
      .lean()
    for (const pkg of packages) {
      const slug = pkg.slug
      entries.push({
        url:             `${BASE}/en/packages/${slug}`,
        lastModified:    pkg.updatedAt as Date | undefined ?? NOW,
        changeFrequency: 'weekly',
        priority:        0.85,
        alternates: {
          languages: {
            'en-IN': `${BASE}/en/packages/${slug}`,
            'hi-IN': `${BASE}/hi/packages/${slug}`,
          },
        },
      })
    }
  } catch {}

  // 5. Dynamic places (fetch from DB)
  try {
    const places = await Place.find({ isActive: true })
      .select('slug updatedAt')
      .lean()
    for (const place of places) {
      const slug = place.slug
      entries.push({
        url:             `${BASE}/en/places/${slug}`,
        lastModified:    place.updatedAt as Date | undefined ?? NOW,
        changeFrequency: 'monthly',
        priority:        0.75,
        alternates: {
          languages: {
            'en-IN': `${BASE}/en/places/${slug}`,
            'hi-IN': `${BASE}/hi/places/${slug}`,
          },
        },
      })
    }
  } catch {}

  return entries
}
