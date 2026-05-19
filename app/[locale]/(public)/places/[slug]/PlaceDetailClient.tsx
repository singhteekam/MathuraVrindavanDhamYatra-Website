'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  MapPin, Clock, Ticket, ChevronRight,
  Phone, Calendar, ArrowLeft, Share2,
} from 'lucide-react'
import type { PlaceDetail, PlaceSummary, PlaceSection } from '@/lib/fetchData'
import PlaceCard from '@/components/shared/PlaceCard'
import { siteConfig }   from '@/config/site'
import ImageGallery    from '@/components/shared/ImageGallery'
import { getPlaceImageSrc } from '@/lib/imageUtils'

// ── Type emojis ──────────────────────────────────────────
const TYPE_EMOJI: Record<string, string> = {
  temple:       '🛕',
  ghat:         '🌊',
  garden:       '🌺',
  museum:       '🏛️',
  'sacred-site':'🙏',
  hill:         '⛰️',
  market:       '🛒',
}

// ── Section Renderer — the core of the flexible content system ──
function SectionRenderer({ section }: { section: PlaceSection }) {
  switch (section.type) {

    case 'rich_text':
      return (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
            {section.title}
          </h2>
          <p className="text-gray-600 leading-relaxed text-base">{section.content}</p>
        </div>
      )

    case 'highlights':
      return (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            {section.title}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {(section.items as string[]).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
              >
                <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-gray-700">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )

    case 'travel_tips':
      return (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            {section.title}
          </h2>
          <div className="space-y-3">
            {(section.items as string[]).map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: '#fffbeb', border: '1px solid #fef3c7' }}>
                <span className="text-amber-500 flex-shrink-0 font-bold">{i + 1}.</span>
                <span className="text-sm text-gray-700">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )

    case 'distances': {
      type DistanceItem = { from: string; distance: string; time: string }
      return (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            {section.title}
          </h2>
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            {(section.items as DistanceItem[]).map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 gap-4"
                style={{
                  borderBottom: i < (section.items?.length ?? 0) - 1 ? '1px solid #f3f4f6' : 'none',
                  background: i % 2 === 0 ? '#fff' : '#f9fafb',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: '#fff8ed' }}>
                    <MapPin size={14} style={{ color: '#ff7d0f' }} />
                  </div>
                  <span className="text-sm font-medium text-gray-800">{item.from}</span>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 text-right">
                  <span className="text-sm font-bold" style={{ color: '#ff7d0f' }}>{item.distance}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={11} />{item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'faq': {
      type FaqItem = { question: string; answer: string }
      return (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            {section.title}
          </h2>
          <div className="space-y-3">
            {(section.items as FaqItem[]).map((item, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-gray-200">
                <div className="p-4 bg-gray-50">
                  <p className="font-semibold text-gray-900 text-sm flex items-start gap-2">
                    <span className="text-saffron-500 flex-shrink-0 font-bold">Q.</span>
                    {item.question}
                  </p>
                </div>
                <div className="p-4 bg-white">
                  <p className="text-gray-600 text-sm leading-relaxed flex items-start gap-2">
                    <span className="font-bold flex-shrink-0" style={{ color: '#16a34a' }}>A.</span>
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    default:
      return null
  }
}

// ── Main component ────────────────────────────────────────
interface Props {
  place:   PlaceDetail
  related: PlaceSummary[]
}

export default function PlaceDetailClient({ place, related }: Props) {
  const whatsappMsg = `Namaste! I want to visit ${place.name} in ${place.city}. Please help me plan a tour. 🙏`

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: place.name,
        text: place.shortDescription,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied!')
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <div
        className="py-14 md:py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #2d1500 60%, #1a0a00 100%)' }}
      >
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #ff7d0f 0%, transparent 50%), radial-gradient(circle at 80% 50%, #4338ca 0%, transparent 50%)',
          }}
        />

        <div className="container-custom relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 flex-wrap">
            <Link href="/"       className="hover:text-saffron-400 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/places" className="hover:text-saffron-400 transition-colors">Places</Link>
            <ChevronRight size={12} />
            <Link href={`/places?city=${place.city.toLowerCase()}`}
              className="hover:text-saffron-400 transition-colors">{place.city}</Link>
            <ChevronRight size={12} />
            <span className="text-gray-300 truncate max-w-xs">{place.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge-saffron badge">
                  {TYPE_EMOJI[place.type]} {place.type.replace('-', ' ')}
                </span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#d1d5db' }}>
                  <MapPin size={10} /> {place.city}
                </span>
                {place.isFeatured && (
                  <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>
                    ⭐ Must Visit
                  </span>
                )}
              </div>

              <h1
                className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {place.name}
              </h1>

              <p className="text-gray-300 leading-relaxed mb-6 text-base">
                {place.shortDescription}
              </p>

              {/* Quick facts */}
              <div className="flex flex-wrap gap-4">
                {place.timings && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Clock size={14} className="text-saffron-400 flex-shrink-0" />
                    <span>
                      {place.timings.morning}
                      {place.timings.evening && ` | ${place.timings.evening}`}
                    </span>
                  </div>
                )}
                {place.entryFee && (
                  <div className="flex items-center gap-2 text-sm">
                    <Ticket size={14} className="text-green-400 flex-shrink-0" />
                    <span className={place.entryFee === 'Free' ? 'text-green-400 font-semibold' : 'text-gray-300'}>
                      Entry: {place.entryFee}
                    </span>
                  </div>
                )}
                {place.timeRequired && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-blue-400">⏱</span>
                    Time needed: {place.timeRequired}
                  </div>
                )}
              </div>
            </div>

            {/* Right: action card */}
            <div
              className="rounded-3xl p-6"
              style={{
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <p className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                Visit {place.name}
              </p>
              <p className="text-gray-400 text-sm mb-5">Plan your trip with us</p>

              {/* Address */}
              <div className="flex items-start gap-3 mb-5 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <MapPin size={16} className="text-saffron-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm">{place.location.address}</p>
              </div>

              {/* Timing note */}
              {place.timings?.note && (
                <div className="flex items-start gap-3 mb-5 p-3 rounded-xl"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <span className="text-amber-400 flex-shrink-0">ℹ️</span>
                  <p className="text-amber-200 text-xs">{place.timings.note}</p>
                </div>
              )}

              <Link href={`/booking?place=${place.slug}`} className="btn-primary w-full mb-3 justify-center">
                <Calendar size={16} />
                Book a Tour to Visit
              </Link>

              <a
                href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(whatsappMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-semibold text-sm mb-3 transition-colors"
                style={{ background: '#dcfce7', color: '#16a34a' }}
              >
                WhatsApp for Tour Help
              </a>

              <a href={`tel:${siteConfig.phone}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-sm font-medium transition-colors"
                style={{ background: 'rgba(255,255,255,0.07)', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Phone size={14} /> {siteConfig.phone}
              </a>

              <button
                onClick={handleShare}
                className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-sm font-medium transition-colors text-gray-400 hover:text-gray-200"
              >
                <Share2 size={14} /> Share this place
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tags ── */}
      <div className="border-b border-gray-100 py-4 bg-white">
        <div className="container-custom flex flex-wrap gap-2">
          {place.tags.map((tag) => (
            <Link
              key={tag}
              href={`/places?search=${tag}`}
              className="text-xs px-3 py-1.5 rounded-full transition-colors"
              style={{ background: '#f3f4f6', color: '#6b7280' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fff8ed'
                e.currentTarget.style.color = '#c74a06'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f3f4f6'
                e.currentTarget.style.color = '#6b7280'
              }}
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="container-custom py-10">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Content area — flexible sections */}
          <div className="lg:col-span-2">

            {/* Image Gallery — shown when place has photos */}
            {(place.images?.filter(Boolean).length > 0 || place.thumbnail) && (
              <div className="mb-8">
                <ImageGallery
                  images={
                    place.images?.filter(Boolean).length > 0
                      ? place.images
                      : place.thumbnail ? [place.thumbnail] : []
                  }
                  name={place.name}
                  type={place.type}
                />
              </div>
            )}

            {place.sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <SectionRenderer section={section} />
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">

            {/* Quick info card */}
            <div className="card p-5 rounded-2xl">
              <h3 className="font-bold text-gray-900 mb-4 text-base">Quick Information</h3>
              <div className="space-y-3">
                {[
                  { icon: '📍', label: 'City',       value: place.city },
                  { icon: '🛕', label: 'Type',       value: place.type.replace('-', ' ') },
                  { icon: '🎟️', label: 'Entry Fee',  value: place.entryFee ?? 'Not specified' },
                  { icon: '⏱️', label: 'Time Needed',value: place.timeRequired ?? 'Not specified' },
                ].map((item) => (
                  <div key={item.label}
                    className="flex items-center justify-between text-sm py-2"
                    style={{ borderBottom: '1px solid #f3f4f6' }}
                  >
                    <span className="text-gray-500 flex items-center gap-2">
                      <span>{item.icon}</span>{item.label}
                    </span>
                    <span className="font-semibold text-gray-800 capitalize">{item.value}</span>
                  </div>
                ))}
                {place.timings?.morning && (
                  <div className="text-sm py-2" style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <p className="text-gray-500 mb-1 flex items-center gap-2">
                      <span>🕐</span>Timings
                    </p>
                    <p className="font-semibold text-gray-800">{place.timings.morning}</p>
                    {place.timings.evening && (
                      <p className="font-semibold text-gray-800">{place.timings.evening}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Book a tour CTA */}
            <div
              className="rounded-2xl p-5 text-center"
              style={{
                background: 'linear-gradient(135deg, #fff8ed, #ffefd4)',
                border: '1px solid #ffdba8',
              }}
            >
              <p className="text-3xl mb-3">🙏</p>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">
                Want to Visit {place.city}?
              </h3>
              <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                Book a guided tour with our expert drivers who know every temple in Braj.
              </p>
              <Link href={`/packages?city=${place.city.toLowerCase()}`}
                className="btn-primary w-full justify-center text-sm py-3">
                View {place.city} Packages
              </Link>
            </div>

            {/* Map placeholder */}
            <div className="card rounded-2xl overflow-hidden">
              <div
                className="h-48 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #e0e7ff, #ede9fe)' }}
              >
                <div className="text-center">
                  <MapPin size={32} className="text-krishna-600 mx-auto mb-2" />
                  <p className="text-krishna-700 font-semibold text-sm">{place.name}</p>
                  <p className="text-krishna-500 text-xs">{place.city}, UP</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-500 leading-relaxed">{place.location.address}</p>
                <a
                  href={`https://maps.google.com/?q=${place.location.lat},${place.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold transition-colors"
                  style={{ color: '#4338ca' }}
                >
                  <MapPin size={12} /> Open in Google Maps
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Related Places ── */}
        {related.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
                More Places in {place.city}
              </h2>
              <Link href={`/places?city=${place.city.toLowerCase()}`}
                className="text-sm font-semibold flex items-center gap-1"
                style={{ color: '#ff7d0f' }}>
                View all <ChevronRight size={15} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((p) => (
                <PlaceCard
                  key={p.slug}
                  slug={p.slug}
                  name={p.name}
                  city={p.city}
                  type={p.type}
                  shortDescription={p.shortDescription}
                  thumbnail={p.thumbnail}
                  timeRequired={p.timeRequired}
                  entryFee={p.entryFee}
                  isFeatured={p.isFeatured}
                />
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-12">
          <Link href="/places"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-saffron-600 transition-colors font-medium">
            <ArrowLeft size={15} /> Back to all places
          </Link>
        </div>
      </div>
    </div>
  )
}