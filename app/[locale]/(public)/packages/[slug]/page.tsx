import type { Metadata }  from 'next'
import { notFound }       from 'next/navigation'
import PackageDetailClient, { type PackageData } from './PackageDetailClient'
import {
  getPackageBySlug,
  getAllPackageSlugs,
  getPackageReviews,
} from '@/lib/fetchData'

interface Props {
  params: Promise<{ slug: string }>
}

// Pre-render all active package pages at build time
export async function generateStaticParams() {
  const slugs = await getAllPackageSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)
  if (!pkg) return { title: 'Package Not Found' }
  return {
    title:       `${pkg.name} \u2014 Mathura Vrindavan Dham Yatra`,
    description: pkg.shortDescription,
    openGraph:   { title: pkg.name, description: pkg.shortDescription },
  }
}

export const revalidate = 300

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params

  // Fetch package detail and its real reviews in parallel
  const [base, dbReviews] = await Promise.all([
    getPackageBySlug(slug),
    // We need the _id to query reviews — do it after we have the base
    getPackageBySlug(slug).then((p) =>
      p ? getPackageReviews(p._id) : Promise.resolve([]),
    ),
  ])

  if (!base) notFound()

  // Build the PackageData object that PackageDetailClient expects.
  // Use DB data where available, fall back gracefully if fields are empty.
  const fullPackage: PackageData = {
    slug:             base.slug,
    name:             base.name,
    duration:         base.duration,
    nights:           base.nights,
    cities:           base.cities,
    basePrice:        base.basePrice,
    rating:           base.rating,
    totalReviews:     base.totalReviews,
    isPopular:        base.isPopular,
    highlights:       base.highlights,
    shortDescription: base.shortDescription,

    // Detail fields — use DB data if present, otherwise sensible defaults
    inclusions: base.inclusions?.length
      ? base.inclusions
      : [
          'AC vehicle throughout the tour',
          'Experienced local driver',
          'All inter-city transfers',
          'Hotel assistance',
          'Fuel charges included',
        ],
    exclusions: base.exclusions?.length
      ? base.exclusions
      : ['Meals', 'Hotel accommodation cost', 'Entry fees', 'Personal expenses'],
    itinerary: base.itinerary?.length
      ? base.itinerary
      : base.highlights.map((h, i) => ({
          day:         i + 1,
          title:       `Day ${i + 1}`,
          description: h,
          places:      [],
        })),
    // base.images is string[] in PackageDetail — but older DB docs may be missing it
    // Array.isArray guard ensures safety even if a legacy doc has no images field
    images:    Array.isArray(base.images) ? base.images.filter(Boolean) : [],
    thumbnail: base.thumbnail ?? '',
    pricing:   base.pricing?.filter((p) => p.price > 0).length
      ? base.pricing.filter((p) => p.price > 0)
      : [
          { carType: 'swift',  carName: 'Swift Dzire (4 pax)',    price: base.basePrice },
          { carType: 'ertiga', carName: 'Maruti Ertiga (7 pax)',  price: Math.round(base.basePrice * 1.5) },
          { carType: 'innova', carName: 'Toyota Innova (8 pax)',  price: Math.round(base.basePrice * 2.2) },
        ],
  }

  return <PackageDetailClient pkg={fullPackage} reviews={dbReviews} />
}