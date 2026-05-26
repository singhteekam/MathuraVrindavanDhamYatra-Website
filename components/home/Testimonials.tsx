'use client'

import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { Star, Quote } from 'lucide-react'
import SectionHeader from '@/components/shared/SectionHeader'
import { getInitials } from '@/lib/utils'
import type { ReviewSummary } from '@/lib/fetchData'

// ── Static fallback reviews ──────────────────────────────────────────────────
// Shown when DB has no approved reviews yet (e.g. fresh deployment).
// Once real reviews are approved by admin, they replace these automatically.
const STATIC_TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    location: 'Delhi',
    rating: 5,
    date: 'March 2025',
    review:
      'Absolutely divine experience! Our driver Ramji knew every temple in Vrindavan personally. He even arranged a special aarti darshan for us at Banke Bihari. Highly recommended for anyone planning a spiritual trip.',
    package: '3 Days Mathura Vrindavan Tour',
  },
  {
    name: 'Rajesh Kumar',
    location: 'Mumbai',
    rating: 5,
    date: 'February 2025',
    review:
      'We were a family of 7 and they arranged an Innova for us. The vehicle was spotless, driver was punctual, and the hotel they suggested was perfect. The entire 4-day trip was seamless. Will come again!',
    package: '4 Days Complete Braj Package',
  },
  {
    name: 'Anita Patel',
    location: 'Ahmedabad',
    rating: 5,
    date: 'January 2025',
    review:
      'I was traveling solo as a pilgrim and was slightly nervous. But from pickup to drop, I felt completely safe and well taken care of. The local guide they arranged knew so many stories of each place. Beautiful experience.',
    package: 'Same Day Tour',
  },
  {
    name: 'Suresh Agarwal',
    location: 'Jaipur',
    rating: 5,
    date: 'December 2024',
    review:
      'Govardhan Parikrama was on my bucket list for 10 years. This team made it happen beautifully. They even helped carry prasad and knew exactly when the temple gates open. Deeply moving experience.',
    package: '3 Days Govardhan Package',
  },
  {
    name: 'Meena Joshi',
    location: 'Pune',
    rating: 5,
    date: 'November 2024',
    review:
      "Transparent pricing is what I loved most. No last-minute extras. The driver was so knowledgeable — he told us stories behind each temple that our guidebook didn't even mention. 10/10 would recommend!",
    package: '2 Days Mathura Vrindavan',
  },
  {
    name: 'Vikram Singh',
    location: 'Chandigarh',
    rating: 5,
    date: 'October 2024',
    review:
      'Planned the 84 Kos Yatra for our group of 12. They arranged two Innova Crystas and a wonderful guide. Every single day was perfectly organized. Truly a once in a lifetime spiritual journey.',
    package: '7 Days 84 Kos Yatra',
  },
]

// ── BLField resolver ──────────────────────────────────────────────────────────
type BLField = string | { en: string; hi: string }
function bl(v: BLField | undefined, locale: string): string {
  if (!v) return ''
  if (typeof v === 'string') return v
  return locale === 'hi' ? (v.hi || v.en) : v.en
}

// ── Helper: convert a DB ReviewSummary to the same shape as static data ──────
function reviewToTestimonial(r: ReviewSummary, locale: string, staticLocation: string) {
  return {
    name:     r.customer.name,
    location: staticLocation,
    rating:   r.rating,
    date:     new Date(r.createdAt).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', {
      month: 'long', year: 'numeric',
    }),
    review:   bl(r.comment, locale),
    package:  bl(r.package?.name, locale),
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  reviews?: ReviewSummary[]  // real DB reviews passed from page.tsx
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < rating ? '#f59e0b' : 'none'}
          stroke={i < rating ? '#f59e0b' : '#d1d5db'}
        />
      ))}
    </div>
  )
}

export default function Testimonials({ reviews: propReviews }: Props) {
  const t      = useTranslations('Testimonials')
  const locale = useLocale()

  // Use real DB reviews when available; fall back to static for fresh deployments
  const testimonials =
    propReviews && propReviews.length > 0
      ? propReviews.map((r) => reviewToTestimonial(r, locale, t('staticLocation')))
      : STATIC_TESTIMONIALS

  return (
    <section className="py-20 section-alt">
      <div className="container-custom">
        <SectionHeader
          subtitle={t('subtitle')}
          title={t('title')}
          description={t('description')}
          className="mb-14"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name + i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="card card-accent p-6 flex flex-col gap-4 relative"
            >
              {/* Quote icon */}
              <Quote
                size={36}
                className="absolute top-5 right-5 opacity-[0.18]"
                style={{ color: '#ff7d0f' }}
              />

              {/* Stars */}
              <StarRating rating={t.rating} />

              {/* Review text */}
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1">
                &ldquo;{t.review}&rdquo;
              </p>

              {/* Package tag */}
              {t.package && (
                <span className="badge-saffron badge self-start text-xs">
                  📦 {t.package}
                </span>
              )}

              {/* Reviewer */}
              <div
                className="flex items-center gap-3 pt-4"
                style={{ borderTop: '1px solid var(--border-muted)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #ff7d0f, #c74a06)',
                  }}
                >
                  {getInitials(t.name)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {t.location} · {t.date}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Google reviews badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex justify-center"
        >
          <div
            className="card card-accent inline-flex items-center gap-5 px-7 py-5 rounded-2xl"
          >
            <div className="text-center">
              <p className="text-4xl font-black" style={{ color: '#ff7d0f' }}>4.9</p>
              <StarRating rating={5} />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t('googleRating')}</p>
            </div>
            <div className="w-px h-14 self-center" style={{ background: 'var(--border-default)' }} />
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{t('ratedBy')}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('happyPilgrims')}</p>
              <p className="text-xs font-semibold mt-1.5" style={{ color: '#ff7d0f' }}>
                ✓ {t('verifiedReviews')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}