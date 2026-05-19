import type { Metadata }   from 'next'
import { notFound }        from 'next/navigation'
import PlaceDetailClient   from './PlaceDetailClient'
import { getPlaceBySlug, getAllPlaces, getAllPlaceSlugs } from '@/lib/fetchData'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllPlaceSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const place    = await getPlaceBySlug(slug)
  if (!place) return { title: 'Place Not Found' }
  return {
    title:       `${place.name} \u2014 Mathura Vrindavan Dham Yatra`,
    description: place.shortDescription,
    openGraph:   { title: place.name, description: place.shortDescription },
  }
}

export const revalidate = 3600

export default async function PlaceDetailPage({ params }: Props) {
  const { slug } = await params

  // Fetch full place detail + all places (for related section) in parallel
  const [place, allPlaces] = await Promise.all([
    getPlaceBySlug(slug),
    getAllPlaces(),
  ])

  if (!place) notFound()

  // Related: same city, different slug, max 3
  const related = allPlaces
    .filter((p) => p.city === place.city && p.slug !== place.slug)
    .slice(0, 3)

  return <PlaceDetailClient place={place} related={related} />
}