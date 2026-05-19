import type { Metadata } from 'next'
import HeroBanner       from '@/components/home/HeroBanner'
import StatsBar         from '@/components/home/StatsBar'
import FeaturedPackages from '@/components/home/FeaturedPackages'
import PopularPlaces    from '@/components/home/PopularPlaces'
import HowItWorks       from '@/components/home/HowItWorks'
import WhyChooseUs      from '@/components/home/WhyChooseUs'
import Testimonials     from '@/components/home/Testimonials'
import CTASection       from '@/components/home/CTASection'
import {
  getFeaturedPackages,
  getFeaturedPlaces,
  getApprovedReviews,
} from '@/lib/fetchData'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import { siteConfig } from '@/config/site'
import { AlertTriangle, MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mathura Vrindavan Dham Yatra | Best Tour Packages & Taxi Service',
  description:
    'Experience the divine land of Lord Krishna. Best Mathura Vrindavan tour packages starting \u20b92000. AC cars, expert drivers, hotel assistance. Book now!',
  keywords: ['Mathura Vrindavan tour packages', 'Vrindavan taxi', 'Mathura tour', 'Krishna temple tour'],
  openGraph: {
    title:       'Mathura Vrindavan Dham Yatra | Best Tour Packages',
    description: 'Tour packages starting \u20b92000. AC cars, expert drivers. Book now!',
    url:         'https://mathuravrindavandhamyatra.com',
    images:      [{ url: '/images/og-image.jpg', width: 1200, height: 630 }],
  },
}

// ISR: revalidate every 5 minutes
// Tags: 'packages' | 'places' | 'reviews' — busted by admin mutations
export const revalidate = 300

function BookingNotice() {
  const message = 'Namaste! App booking is currently unavailable. I want to book a Mathura Vrindavan tour through WhatsApp.'

  return (
    <section className="bg-amber-50 border-b border-amber-200">
      <div className="container-custom py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <AlertTriangle size={17} />
            </span>
            <div>
              <p className="text-sm font-bold text-amber-900">Important Notice</p>
              <p className="text-sm leading-relaxed text-amber-800">
                App booking features are currently unavailable. Online booking will be available from 18 May 2026.
                Until then, please book your tour through WhatsApp.
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
          >
            <MessageCircle size={16} />
            Book on WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}

export default async function HomePage() {
  // All three queries run in parallel, each independently cached
  const [featuredPackages, popularPlaces, reviews] = await Promise.all([
    getFeaturedPackages(),
    getFeaturedPlaces(),
    getApprovedReviews(6),
  ])

  return (
    <>
      <Navbar />
      <BookingNotice />
      <HeroBanner />
      <StatsBar />
      <FeaturedPackages packages={featuredPackages} />
      <HowItWorks />
      <PopularPlaces    places={popularPlaces} />
      <WhyChooseUs />
      <Testimonials />
      <CTASection />
      <Footer />
      <WhatsAppButton />
    </>
  )
}
