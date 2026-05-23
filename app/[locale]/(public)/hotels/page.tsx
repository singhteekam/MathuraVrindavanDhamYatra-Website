import type { Metadata } from 'next'
import HotelsClient      from './HotelsClient'
import { connectDB }     from '@/lib/db'
import Hotel             from '@/models/Hotel'

export const revalidate = 300

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title:       locale === 'hi'
      ? 'मथुरा वृन्दावन में होटल — Mathura Vrindavan Dham Yatra'
      : 'Hotels in Mathura Vrindavan — Mathura Vrindavan Dham Yatra',
    description: locale === 'hi'
      ? 'मथुरा और वृन्दावन में सर्वश्रेष्ठ होटल खोजें। कीमतें तुलना करें और हमारे साथ बुक करें।'
      : 'Find the best hotels in Mathura and Vrindavan. Compare prices and book your stay with us.',
  }
}

export default async function HotelsPage({ params }: Props) {
  const { locale } = await params

  await connectDB()
  const raw = await Hotel.find({ isActive: true })
    .sort({ isFeatured: -1, rating: -1 })
    .lean()

  return <HotelsClient hotels={JSON.parse(JSON.stringify(raw))} locale={locale} />
}
