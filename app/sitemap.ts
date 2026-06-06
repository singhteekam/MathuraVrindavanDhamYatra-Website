import type { MetadataRoute } from 'next'
import { connectDB }          from '@/lib/db'
import Package                from '@/models/Package'
import Place                  from '@/models/Place'

const BASE    = 'https://mathuravrindavandhamyatra.com'
const NOW     = new Date()
const LOCALES = ['en', 'hi'] as const

const STATIC_PAGES = [
  { path: '',               priority: 1.0,  changeFreq: 'daily'   },
  { path: '/packages',      priority: 0.95, changeFreq: 'daily'   },
  { path: '/places',        priority: 0.9,  changeFreq: 'weekly'  },
  { path: '/hotels',        priority: 0.85, changeFreq: 'weekly'  },
  { path: '/restaurants',   priority: 0.85, changeFreq: 'weekly'  },
  { path: '/blog',          priority: 0.8,  changeFreq: 'weekly'  },
  { path: '/booking',       priority: 0.9,  changeFreq: 'monthly' },
  { path: '/about',         priority: 0.7,  changeFreq: 'monthly' },
  { path: '/contact',       priority: 0.75, changeFreq: 'monthly' },
  { path: '/faq',           priority: 0.7,  changeFreq: 'monthly' },
  { path: '/review',        priority: 0.6,  changeFreq: 'monthly' },
  { path: '/radhe-krishna', priority: 0.65, changeFreq: 'monthly' },
  { path: '/privacy',       priority: 0.4,  changeFreq: 'yearly'  },
  { path: '/terms',         priority: 0.4,  changeFreq: 'yearly'  },
  { path: '/login',         priority: 0.3,  changeFreq: 'yearly'  },
  { path: '/register',      priority: 0.3,  changeFreq: 'yearly'  },
]

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

type ChangeFrequency =
  | 'always' | 'hourly' | 'daily' | 'weekly'
  | 'monthly' | 'yearly' | 'never'

function hreflang(path: string) {
  return {
    'en-IN': `${BASE}/en${path}`,
    'hi-IN': `${BASE}/hi${path}`,
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // 1. Root redirect
  entries.push({ url: BASE, lastModified: NOW, changeFrequency: 'daily', priority: 1.0 })

  // 2. Static pages — both locales
  for (const locale of LOCALES) {
    for (const page of STATIC_PAGES) {
      entries.push({
        url:             `${BASE}/${locale}${page.path}`,
        lastModified:    NOW,
        changeFrequency: page.changeFreq as ChangeFrequency,
        priority:        page.priority,
        alternates: { languages: hreflang(page.path) },
      })
    }
  }

  // 3. Blog posts — both locales
  for (const slug of BLOG_SLUGS) {
    for (const locale of LOCALES) {
      entries.push({
        url:             `${BASE}/${locale}/blog/${slug}`,
        lastModified:    NOW,
        changeFrequency: 'monthly',
        priority:        0.65,
        alternates: { languages: hreflang(`/blog/${slug}`) },
      })
    }
  }

  // 4. All packages from DB — both locales
  try {
    await connectDB()
    const packages = await Package.find({}).select('slug updatedAt').lean()
    for (const pkg of packages) {
      const modified = (pkg.updatedAt as Date | undefined) ?? NOW
      for (const locale of LOCALES) {
        entries.push({
          url:             `${BASE}/${locale}/packages/${pkg.slug}`,
          lastModified:    modified,
          changeFrequency: 'weekly',
          priority:        0.85,
          alternates: { languages: hreflang(`/packages/${pkg.slug}`) },
        })
      }
    }
  } catch {}

  // 5. All places from DB — both locales
  try {
    const places = await Place.find({}).select('slug updatedAt').lean()
    for (const place of places) {
      const modified = (place.updatedAt as Date | undefined) ?? NOW
      for (const locale of LOCALES) {
        entries.push({
          url:             `${BASE}/${locale}/places/${place.slug}`,
          lastModified:    modified,
          changeFrequency: 'monthly',
          priority:        0.75,
          alternates: { languages: hreflang(`/places/${place.slug}`) },
        })
      }
    }
  } catch {}

  return entries
}
