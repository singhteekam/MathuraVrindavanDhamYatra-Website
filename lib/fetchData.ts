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
 */

import { unstable_cache } from 'next/cache'
import { connectDB }      from '@/lib/db'

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

// ─── Package queries ──────────────────────────────────────────────────────────

/** Featured packages for homepage — max 8, cached 5 min */
export const getFeaturedPackages = unstable_cache(
  async (): Promise<PackageSummary[]> => {
    await connectDB()
    const PackageModel = (await import('@/models/Package')).default

    // First try packages explicitly marked as featured
    let docs = await PackageModel
      .find({ isActive: true, isFeatured: true })
      .sort({ totalBookings: -1, duration: 1 })
      .limit(8)
      .select('-itinerary -inclusions -exclusions')
      .lean()

    // Fallback: if no featured packages exist yet (e.g. fresh seed without isFeatured set),
    // return all active packages sorted by popularity so the homepage is never empty
    if (docs.length === 0) {
      docs = await PackageModel
        .find({ isActive: true })
        .sort({ isPopular: -1, totalBookings: -1, duration: 1 })
        .limit(8)
        .select('-itinerary -inclusions -exclusions')
        .lean()
    }

    return docs.map((d) => ser<PackageSummary>(d as Record<string, unknown>))
  },
  ['featured-packages'],
  { revalidate: 300, tags: ['packages'] },
)

/** All active packages for /packages listing — cached 5 min */
export const getAllPackages = unstable_cache(
  async (): Promise<PackageSummary[]> => {
    await connectDB()
    const PackageModel = (await import('@/models/Package')).default
    const docs = await PackageModel
      .find({ isActive: true })
      .sort({ isFeatured: -1, totalBookings: -1, duration: 1 })
      .select('-itinerary -inclusions -exclusions')
      .lean()
    return docs.map((d) => ser<PackageSummary>(d as Record<string, unknown>))
  },
  ['all-packages'],
  { revalidate: 300, tags: ['packages'] },
)

/** Single package full detail for /packages/[slug] — cached 5 min */
export const getPackageBySlug = unstable_cache(
  async (slug: string): Promise<PackageDetail | null> => {
    await connectDB()
    const PackageModel = (await import('@/models/Package')).default
    const doc = await PackageModel.findOne({ slug, isActive: true }).lean()
    if (!doc) return null
    return ser<PackageDetail>(doc as Record<string, unknown>)
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
  async (): Promise<PlaceSummary[]> => {
    await connectDB()
    const PlaceModel = (await import('@/models/Place')).default
    const docs = await PlaceModel
      .find({ isFeatured: true })
      .sort({ name: 1 })
      .limit(8)
      .select('-sections')
      .lean()
    return docs.map((d) => ser<PlaceSummary>(d as Record<string, unknown>))
  },
  ['featured-places'],
  { revalidate: 3600, tags: ['places'] },
)

/** All places for /places listing — cached 1 hour */
export const getAllPlaces = unstable_cache(
  async (): Promise<PlaceSummary[]> => {
    await connectDB()
    const PlaceModel = (await import('@/models/Place')).default
    const docs = await PlaceModel
      .find({})
      .sort({ isFeatured: -1, name: 1 })
      .select('-sections')
      .lean()
    return docs.map((d) => ser<PlaceSummary>(d as Record<string, unknown>))
  },
  ['all-places'],
  { revalidate: 3600, tags: ['places'] },
)

/** Single place full detail for /places/[slug] — cached 1 hour */
export const getPlaceBySlug = unstable_cache(
  async (slug: string): Promise<PlaceDetail | null> => {
    await connectDB()
    const PlaceModel = (await import('@/models/Place')).default
    const doc = await PlaceModel.findOne({ slug }).lean()
    if (!doc) return null
    return ser<PlaceDetail>(doc as Record<string, unknown>)
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
            name: (r.package as { name?: string })?.name ?? '',
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