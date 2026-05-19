import type { Metadata } from 'next'
import PackagesClient   from './PackagesClient'
import { getAllPackages } from '@/lib/fetchData'

export const metadata: Metadata = {
  title:       'Tour Packages \u2014 Mathura Vrindavan Dham Yatra',
  description: 'Browse Mathura Vrindavan tour packages \u2014 1 day to 8 days. AC cars, expert drivers, hotel help. Starting from \u20b92,000.',
  openGraph: {
    title:       'Mathura Vrindavan Tour Packages',
    description: 'Handcrafted spiritual tour packages starting from \u20b92,000.',
  },
}

// Cached 5 min; busted instantly when admin adds/edits a package
export const revalidate = 300

export default async function PackagesPage() {
  // Fetches from MongoDB — cached via unstable_cache with tag 'packages'
  const packages = await getAllPackages()
  return <PackagesClient packages={packages} />
}