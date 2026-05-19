'use client'

import { useState }  from 'react'
import { Link }       from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import Image          from 'next/image'
import { Clock, Star, ArrowRight } from 'lucide-react'
import { formatCurrency }          from '@/lib/utils'
import { getPackageImageSrc, getPackageGradient } from '@/lib/imageUtils'

interface PackageCardProps {
  slug:             string
  name:             string
  duration:         number
  nights:           number
  cities:           string[]
  thumbnail?:       string
  basePrice:        number
  rating:           number
  totalReviews:     number
  highlights:       string[]
  isPopular?:       boolean
}

export default function PackageCard({
  slug,
  name,
  duration,
  nights,
  cities,
  thumbnail,
  basePrice,
  rating,
  totalReviews,
  highlights,
  isPopular,
}: PackageCardProps) {
  const t                        = useTranslations('PackageCard')
  const resolvedSrc              = getPackageImageSrc(slug, thumbnail)
  const [imgSrc, setImgSrc]      = useState<string | null>(resolvedSrc)
  const [imgLoaded, setImgLoaded]= useState(false)

  const gradient = getPackageGradient()

  return (
    <div className="card card-hover group overflow-hidden flex flex-col h-full rounded-2xl">

      {/* ── Image / Fallback ── */}
      <div className="relative overflow-hidden h-52" style={{ background: gradient }}>

        {/* Fallback — temple icon with gradient, always visible until image loads */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 transition-opacity duration-300 ${imgSrc && imgLoaded ? 'opacity-0' : 'opacity-100'}`}>
          <span className="text-5xl drop-shadow-sm">🛕</span>
          <div className="flex gap-1">
            {cities.slice(0, 3).map((c) => (
              <span key={c} className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(255,125,15,0.15)', color: '#c74a06' }}>
                {c}
              </span>
            ))}
          </div>
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
            onError={() => setImgSrc(null)}
          />
        )}

        {/* Overlay for text readability */}
        {imgSrc && imgLoaded && (
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 100%)' }} />
        )}

        {/* Duration badge */}
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold backdrop-blur-sm"
            style={{ background: 'rgba(255,255,255,0.92)', color: '#c74a06' }}>
            <Clock size={10} />
            {duration} {duration === 1 ? t('day') : t('days')}
            {nights > 0 && ` / ${nights}N`}
          </span>
          {isPopular && (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold backdrop-blur-sm"
              style={{ background: 'rgba(254,243,199,0.95)', color: '#92400e' }}>
              {t('popular')}
            </span>
          )}
        </div>

        {/* Rating badge */}
        {rating > 0 && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(0,0,0,0.55)', color: '#fbbf24' }}>
            <Star size={10} fill="currentColor" />
            {rating.toFixed(1)}
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>({totalReviews})</span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-5 flex flex-col flex-1">
        {/* Cities */}
        <p className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: '#ff7d0f' }}>
          {cities.join(' · ')}
        </p>

        <h3 className="font-bold text-gray-900 text-base leading-snug mb-3 group-hover:text-orange-600 transition-colors">
          {name}
        </h3>

        {/* Highlights */}
        <ul className="space-y-1 mb-4 flex-1">
          {highlights.slice(0, 3).map((h) => (
            <li key={h} className="flex items-start gap-2 text-xs text-gray-500">
              <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
              {h}
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4"
          style={{ borderTop: '1px solid #f3f4f6' }}>
          <div>
            <p className="text-xs text-gray-400">{t('startingFrom')}</p>
            <p className="text-xl font-bold" style={{ color: '#ff7d0f' }}>
              {formatCurrency(basePrice)}
            </p>
          </div>
          <Link href={`/packages/${slug}`}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200"
            style={{ background: '#fff8ed', color: '#f06205', border: '1px solid #ffdba8' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#ff7d0f'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff8ed'; e.currentTarget.style.color = '#f06205' }}>
            {t('viewDetails')} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}