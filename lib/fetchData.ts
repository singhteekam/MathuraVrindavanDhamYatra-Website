/**
 * lib/fetchData.ts
 *
 * Single source of truth for all server-side MongoDB data fetching.
 * Uses Next.js unstable_cache so each query is:
 *   - Cached in memory — only one MongoDB round-trip per cache window
 *   - Tagged — admin mutations call revalidateTag() to bust instantly
 *   - Typed  — TypeScript interfaces shared between server pages & client components
 *
 * Cache tags:
 *   'packages' — bust when package created / updated / deleted
 *   'places'   — bust when place   created / updated / deleted
 *   'reviews'  — bust when review  approved / unpublished / deleted
 *
 * Locale:
 *   All package/place functions accept a locale string ('en' | 'hi', default 'en').
 *   unstable_cache includes function arguments in the cache key, so ('en') and ('hi')
 *   are stored as separate cache entries automatically.
 *   Consumer-facing interfaces keep string types — localization is applied internally.
 */

import { unstable_cache } from 'next/cache'
import { connectDB }      from '@/lib/db'
import type { LocalizedString } from '@/lib/i18nHelpers'
import { getLocalized }   from '@/lib/i18nHelpers'

// ─── Shared Types ─────────────────────────────────────────────────────────────
// These are exported and used by BOTH server pages (page.tsx) and
// client components (XxxClient.tsx). Keep them here as the single source.

export interface PackagePricing {
  carType: string
  carName: string
  price:   number
}

export interface PackageItineraryDay {
  day:         number
  title:       string
  description: string
  places:      string[]
}

/** Lightweight shape — used for listing cards and homepage */
export interface PackageSummary {
  _id:              string
  slug:             string
  name:             string
  duration:         number
  nights:           number
  cities:           string[]
  thumbnail:        string
  images:           string[]
  basePrice:        number
  rating:           number
  totalReviews:     number
  totalBookings:    number
  isPopular:        boolean
  isFeatured:       boolean
  highlights:       string[]
  shortDescription: string
  pricing:          PackagePricing[]
}

/** Full shape — used for /packages/[slug] detail page */
export interface PackageDetail extends PackageSummary {
  inclusions: string[]
  exclusions: string[]
  itinerary:  PackageItineraryDay[]
}

export interface PlaceTimings {
  morning?: string
  evening?: string
  note?:    string
}

export interface PlaceLocation {
  address:             string
  lat:                 number
  lng:                 number
  distanceFromMathura?: string
}

export interface PlaceSection {
  type:     'rich_text' | 'highlights' | 'travel_tips' | 'distances' | 'faq'
  title:    string
  content?: string
  items?:   unknown[]
}

/** Lightweight shape — used for place cards and homepage */
export interface PlaceSummary {
  _id:              string
  slug:             string
  name:             string
  city:             string
  type:             string
  shortDescription: string
  thumbnail:        string
  images:           string[]
  entryFee?:        string
  timeRequired?:    string
  isFeatured:       boolean
  tags:             string[]
  location:         PlaceLocation
  timings?:         PlaceTimings
}

/** Full shape — used for /places/[slug] detail page */
export interface PlaceDetail extends PlaceSummary {
  sections: PlaceSection[]
}

export interface ReviewSummary {
  _id:       string
  rating:    number
  title:     string
  comment:   string
  createdAt: string
  customer:  { name: string }
  package?:  { name: string; slug: string }
}

// ─── Internal serializer ──────────────────────────────────────────────────────
// Converts Mongoose lean() documents (with ObjectId / Date objects) into
// plain JSON-safe objects safe to pass as React props.

function ser<T>(doc: Record<string, unknown>): T {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(doc)) {
    if (v === null || v === undefined) {
      out[k] = v
    } else if (v instanceof Date) {
      out[k] = v.toISOString()
    } else if (Array.isArray(v)) {
      out[k] = v.map((item) =>
        item && typeof item === 'object' && !Array.isArray(item) && !(item instanceof Date)
          ? ser(item as Record<string, unknown>)
          : item instanceof Date
          ? item.toISOString()
          : item,
      )
    } else if (
      typeof v === 'object' &&
      'toString' in v &&
      typeof (v as { toHexString?: unknown }).toHexString === 'function'
    ) {
      // ObjectId
      out[k] = (v as { toString(): string }).toString()
    } else if (typeof v === 'object' && !(v instanceof Date)) {
      out[k] = ser(v as Record<string, unknown>)
    } else {
      out[k] = v
    }
  }
  return out as T
}

// ─── Internal localization helpers ───────────────────────────────────────────
// After ser(), translatable fields are LocalizedString ({en,hi} | string).
// These helpers resolve them to the correct locale string, producing the
// consumer-facing interfaces (which have plain string fields).

function L(field: unknown, locale: string): string {
  return getLocalized(field as LocalizedString, locale)
}

function localizePackageSummary(raw: Record<string, unknown>, locale: string): PackageSummary {
  const p = raw as unknown as PackageSummary
  return {
    ...p,
    name:             L(p.name, locale),
    shortDescription: L(p.shortDescription, locale),
    cities:           ((p.cities as unknown[]) || []).map(c => L(c as LocalizedString, locale)),
    highlights:       (p.highlights as unknown[]).map(h => L(h, locale)),
  }
}

function localizePackageDetail(raw: Record<string, unknown>, locale: string): PackageDetail {
  const p = raw as unknown as PackageDetail
  return {
    ...localizePackageSummary(raw, locale),
    inclusions: p.inclusions.map(x => L(x, locale)),
    exclusions: p.exclusions.map(x => L(x, locale)),
    itinerary:  p.itinerary.map(day => ({
      ...day,
      title:       L(day.title, locale),
      description: L(day.description, locale),
      places:      ((day.places as unknown[]) || []).map(pl => L(pl as LocalizedString, locale)),
    })),
  }
}

function localizePlaceSummary(raw: Record<string, unknown>, locale: string): PlaceSummary {
  const p = raw as unknown as PlaceSummary
  return {
    ...p,
    name:             L(p.name, locale),
    shortDescription: L(p.shortDescription, locale),
    city:             L(p.city, locale),
    type:             L(p.type, locale),
    tags:             ((p.tags as unknown[]) || []).map(t => L(t as LocalizedString, locale)),
    location: p.location
      ? { ...p.location, address: L(p.location.address, locale) }
      : p.location,
    entryFee:         p.entryFee     ? L(p.entryFee, locale)     : undefined,
    timeRequired:     p.timeRequired ? L(p.timeRequired, locale) : undefined,
    timings: p.timings
      ? {
          morning: p.timings.morning ? L(p.timings.morning, locale) : undefined,
          evening: p.timings.evening ? L(p.timings.evening, locale) : undefined,
          note:    p.timings.note    ? L(p.timings.note, locale)    : undefined,
        }
      : undefined,
  }
}

function localizeFullPlace(raw: Record<string, unknown>, locale: string): PlaceDetail {
  const p = raw as unknown as PlaceDetail
  return {
    ...localizePlaceSummary(raw, locale),
    sections: p.sections.map(sec => ({
      ...sec,
      title:   L(sec.title, locale),
      content: sec.content ? L(sec.content, locale) : undefined,
      items:   (sec.items || []).map((item: unknown) => {
        if (typeof item === 'object' && item !== null) {
          const i = item as Record<string, unknown>
          if ('from' in i) return {
            ...i,
            from:     L(i.from     as LocalizedString, locale),
            distance: L(i.distance as LocalizedString, locale),
            time:     L(i.time     as LocalizedString, locale),
          }
          return L(item as LocalizedString, locale)
        }
        return item
      }),
    })),
  }
}

// ─── Package queries ──────────────────────────────────────────────────────────

/** Featured packages for homepage — max 8, cached 5 min */
export const getFeaturedPackages = unstable_cache(
  async (locale: string = 'en'): Promise<PackageSummary[]> => {
    await connectDB()
    const PackageModel = (await import('@/models/Package')).default

    let docs = await PackageModel
      .find({ isActive: true, isFeatured: true })
      .sort({ totalBookings: -1, duration: 1 })
      .limit(8)
      .select('-itinerary -inclusions -exclusions')
      .lean()

    if (docs.length === 0) {
      docs = await PackageModel
        .find({ isActive: true })
        .sort({ isPopular: -1, totalBookings: -1, duration: 1 })
        .limit(8)
        .select('-itinerary -inclusions -exclusions')
        .lean()
    }

    return docs
      .map(d => ser<Record<string, unknown>>(d as Record<string, unknown>))
      .map(d => localizePackageSummary(d, locale))
  },
  ['featured-packages'],
  { revalidate: 300, tags: ['packages'] },
)

/** All active packages for /packages listing — cached 5 min */
export const getAllPackages = unstable_cache(
  async (locale: string = 'en'): Promise<PackageSummary[]> => {
    await connectDB()
    const PackageModel = (await import('@/models/Package')).default
    const docs = await PackageModel
      .find({ isActive: true })
      .sort({ isFeatured: -1, totalBookings: -1, duration: 1 })
      .select('-itinerary -inclusions -exclusions')
      .lean()
    return docs
      .map(d => ser<Record<string, unknown>>(d as Record<string, unknown>))
      .map(d => localizePackageSummary(d, locale))
  },
  ['all-packages'],
  { revalidate: 300, tags: ['packages'] },
)

/** Single package full detail for /packages/[slug] — cached 5 min */
export const getPackageBySlug = unstable_cache(
  async (slug: string, locale: string = 'en'): Promise<PackageDetail | null> => {
    await connectDB()
    const PackageModel = (await import('@/models/Package')).default
    const doc = await PackageModel.findOne({ slug, isActive: true }).lean()
    if (!doc) return null
    const raw = ser<Record<string, unknown>>(doc as Record<string, unknown>)
    return localizePackageDetail(raw, locale)
  },
  ['package-by-slug'],
  { revalidate: 300, tags: ['packages'] },
)

/** Slugs of all active packages — used for generateStaticParams */
export const getAllPackageSlugs = unstable_cache(
  async (): Promise<string[]> => {
    await connectDB()
    const PackageModel = (await import('@/models/Package')).default
    const docs = await PackageModel.find({ isActive: true }).select('slug').lean()
    return docs.map((d) => (d as { slug: string }).slug)
  },
  ['package-slugs'],
  { revalidate: 3600, tags: ['packages'] },
)

// ─── Place queries ────────────────────────────────────────────────────────────

/** Featured places for homepage — max 8, cached 1 hour */
export const getFeaturedPlaces = unstable_cache(
  async (locale: string = 'en'): Promise<PlaceSummary[]> => {
    await connectDB()
    const PlaceModel = (await import('@/models/Place')).default
    const docs = await PlaceModel
      .find({ isFeatured: true })
      .sort({ _id: 1 })
      .limit(8)
      .select('-sections')
      .lean()
    return docs
      .map(d => ser<Record<string, unknown>>(d as Record<string, unknown>))
      .map(d => localizePlaceSummary(d, locale))
  },
  ['featured-places'],
  { revalidate: 3600, tags: ['places'] },
)

/** All places for /places listing — cached 1 hour */
export const getAllPlaces = unstable_cache(
  async (locale: string = 'en'): Promise<PlaceSummary[]> => {
    await connectDB()
    const PlaceModel = (await import('@/models/Place')).default
    const docs = await PlaceModel
      .find({})
      .sort({ isFeatured: -1, _id: 1 })
      .select('-sections')
      .lean()
    return docs
      .map(d => ser<Record<string, unknown>>(d as Record<string, unknown>))
      .map(d => localizePlaceSummary(d, locale))
  },
  ['all-places'],
  { revalidate: 3600, tags: ['places'] },
)

/** Single place full detail for /places/[slug] — cached 1 hour */
export const getPlaceBySlug = unstable_cache(
  async (slug: string, locale: string = 'en'): Promise<PlaceDetail | null> => {
    await connectDB()
    const PlaceModel = (await import('@/models/Place')).default
    const doc = await PlaceModel.findOne({ slug }).lean()
    if (!doc) return null
    const raw = ser<Record<string, unknown>>(doc as Record<string, unknown>)
    return localizeFullPlace(raw, locale)
  },
  ['place-by-slug'],
  { revalidate: 3600, tags: ['places'] },
)

/** Slugs of all places — used for generateStaticParams */
export const getAllPlaceSlugs = unstable_cache(
  async (): Promise<string[]> => {
    await connectDB()
    const PlaceModel = (await import('@/models/Place')).default
    const docs = await PlaceModel.find({}).select('slug').lean()
    return docs.map((d) => (d as { slug: string }).slug)
  },
  ['place-slugs'],
  { revalidate: 3600, tags: ['places'] },
)

// ─── Review queries ───────────────────────────────────────────────────────────

/** Latest approved reviews for homepage testimonials — cached 10 min */
export const getApprovedReviews = unstable_cache(
  async (limit = 6): Promise<ReviewSummary[]> => {
    await connectDB()
    await import('@/models/User')
    const Review = (await import('@/models/Review')).default
    const docs = await Review
      .find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('customer', 'name')
      .populate('package',  'name slug')
      .lean()
    return docs.map((r) => ({
      _id:      (r._id as { toString(): string }).toString(),
      rating:   r.rating,
      title:    r.title,
      comment:  r.comment,
      createdAt:(r.createdAt as Date).toISOString(),
      customer: { name: (r.customer as { name?: string } | null)?.name ?? 'Devotee' },
      package:  r.package
        ? {
            name: L((r.package as { name?: unknown })?.name, 'en'),
            slug: (r.package as { slug?: string })?.slug ?? '',
          }
        : undefined,
    }))
  },
  ['approved-reviews'],
  { revalidate: 600, tags: ['reviews'] },
)

/** Approved reviews for a specific package — cached 10 min */
export const getPackageReviews = unstable_cache(
  async (packageId: string): Promise<ReviewSummary[]> => {
    await connectDB()
    const Review = (await import('@/models/Review')).default
    const { Types } = await import('mongoose')
    const docs = await Review
      .find({ package: new Types.ObjectId(packageId), isApproved: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('customer', 'name')
      .lean()
    return docs.map((r) => ({
      _id:      (r._id as { toString(): string }).toString(),
      rating:   r.rating,
      title:    r.title,
      comment:  r.comment,
      createdAt:(r.createdAt as Date).toISOString(),
      customer: { name: (r.customer as { name?: string } | null)?.name ?? 'Devotee' },
    }))
  },
  ['package-reviews'],
  { revalidate: 600, tags: ['reviews'] },
)
