import type { Metadata } from 'next'
import PlacesClient       from './PlacesClient'
import { getAllPlaces }    from '@/lib/fetchData'

export const metadata: Metadata = {
  title:       'Sacred Places \u2014 Mathura Vrindavan Dham Yatra',
  description: 'Explore 50+ sacred temples, ghats, and spiritual sites in Mathura, Vrindavan, Govardhan and Barsana.',
  openGraph: {
    title:       'Sacred Places of Braj \u2014 Mathura Vrindavan Dham Yatra',
    description: 'Complete guide to temples, ghats & sacred sites of the holy land.',
  },
}

// Places data rarely changes — cache 1 hour
export const revalidate = 3600

export default async function PlacesPage() {
  const places = await getAllPlaces()
  return <PlacesClient places={places} />
}