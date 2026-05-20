'use client'

import { useState }    from 'react'
import { Link }         from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import Image            from 'next/image'
import { MapPin, Clock, ArrowRight } from 'lucide-react'
import { getPlaceImageSrc, getPlaceGradient, getTypeEmoji } from '@/lib/imageUtils'

interface PlaceCardProps {
  slug:             string
  name:             string
  city:             string
  type:             string
  shortDescription: string
  thumbnail?:       string   // DB url (Cloudinary)
  timeRequired?:    string
  entryFee?:        string
  isFeatured?:      boolean
}

export default function PlaceCard({
  slug,
  name,
  city,
  type,
  shortDescription,
  thumbnail,
  timeRequired,
  entryFee,
  isFeatured,
}: PlaceCardProps) {
  const t = useTranslations('PlaceCard')
  // Start with the resolved src; on error fall back to null (gradient shown)
  const resolvedSrc = getPlaceImageSrc(slug, thumbnail)
  const [imgSrc, setImgSrc]       = useState<string | null>(resolvedSrc)
  const [imgLoaded, setImgLoaded] = useState(false)

  const gradient = getPlaceGradient(type)
  const emoji    = getTypeEmoji(type)

  return (
    <Link href={`/places/${slug}`}
      className="group card card-hover overflow-hidden block h-full rounded-2xl">

      {/* ── Image / Fallback banner ── */}
      <div className="relative overflow-hidden h-48"
        style={{ background: gradient }}>

        {/* Gradient fallback emoji — always rendered, hidden when image loads */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${imgSrc && imgLoaded ? 'opacity-0' : 'opacity-100'}`}>
          <span className="text-6xl drop-shadow-sm">{emoji}</span>
        </div>

        {/* Actual image */}
        {imgSrc && (
          <Image
            src={imgSrc}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgSrc(null)}   // triggers gradient fallback
          />
        )}

        {/* Subtle gradient overlay for text readability */}
        {imgSrc && imgLoaded && (
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 100%)' }} />
        )}

        {/* City badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold backdrop-blur-sm"
            style={{ background: 'rgba(255,255,255,0.9)', color: '#c74a06' }}>
            <MapPin size={9} />{city}
          </span>
        </div>

        {/* Featured badge */}
        {isFeatured && (
          <div className="absolute top-3 right-3 z-10">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: '#312e81', color: '#c7d2fe' }}>
              {t('mustVisit')}
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider mb-1"
          style={{ color: '#ff7d0f' }}>
          {emoji} {type.replace('-', ' ')}
        </p>
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
          {name}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">
          {shortDescription}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            {timeRequired && (
              <span className="flex items-center gap-1">
                <Clock size={11} />{timeRequired}
              </span>
            )}
            {entryFee && (
              <span className="font-medium"
                style={{ color: entryFee === 'Free' ? '#16a34a' : '#6b7280' }}>
                {entryFee === 'Free' ? t('free') : entryFee}
              </span>
            )}
          </div>
          <ArrowRight size={16}
            className="transition-transform duration-200 group-hover:translate-x-1"
            style={{ color: '#ff7d0f' }} />
        </div>
      </div>
    </Link>
  )
}