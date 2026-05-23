import type { Metadata }  from 'next'
import RestaurantsClient  from './RestaurantsClient'
import { connectDB }        from '@/lib/db'
import Restaurant           from '@/models/Restaurant'

export const revalidate = 300

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title:       locale === 'hi'
      ? 'मथुरा वृन्दावन में रेस्तराँ — शुद्ध वेज डाइनिंग गाइड'
      : 'Restaurants in Mathura Vrindavan — Pure Veg Dining Guide',
    description: locale === 'hi'
      ? 'मथुरा, वृन्दावन, गोवर्धन में सर्वश्रेष्ठ शुद्ध शाकाहारी रेस्तराँ और ढाबे।'
      : 'Best pure vegetarian restaurants and dhabas in Mathura, Vrindavan, Govardhan.',
  }
}

export default async function RestaurantsPage({ params }: Props) {
  const { locale } = await params

  await connectDB()
  const raw = await Restaurant.find({ isActive: true })
    .sort({ isPopular: -1, rating: -1 })
    .lean()

  return <RestaurantsClient restaurants={JSON.parse(JSON.stringify(raw))} locale={locale} />
}
