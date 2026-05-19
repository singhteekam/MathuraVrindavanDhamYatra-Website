import type { Metadata } from 'next'
import RestaurantsClient from './RestaurantsClient'

export const metadata: Metadata = {
  title: 'Restaurants in Mathura Vrindavan — Pure Veg Dining Guide',
  description:
    'Best pure vegetarian restaurants and dhabas in Mathura, Vrindavan, Govardhan. From local Braj cuisine to temple prasadam — complete dining guide.',
}

export default function RestaurantsPage() {
  return <RestaurantsClient />
}