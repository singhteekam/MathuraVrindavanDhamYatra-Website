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
  discountPercent?: number
  discountEndsAt?:  string | null
  discountLabel?:   string
}

function endsInText(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now()
  if (diff <= 0) return ''
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours}h left`
  return `${Math.floor(hours / 24)}d left`
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
  discountPercent,
  discountEndsAt,
  discountLabel,
}: PackageCardProps) {
  const hasDiscount = (discountPercent ?? 0) > 0 &&
    (!discountEndsAt || new Date(discountEndsAt) > new Date())
  const discountedPrice = hasDiscount
    ? Math.round(basePrice * (1 - (discountPercent ?? 0) / 100))
    : null
  const t                        = useTranslations('PackageCard')
  const resolvedSrc              = getPackageImageSrc(slug, thumbnail)
  const [imgSrc, setImgSrc]      = useState<string | null>(resolvedSrc)
  const [imgLoaded, setImgLoaded]= useState(false)

  const gradient = getPackageGradient()

  return (
    <div className="card card-hover card-accent group overflow-hidden flex flex-col h-full rounded-2xl">

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

        {/* Duration + discount badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
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
          {hasDiscount && (
            <span className="text-xs px-2.5 py-1 rounded-full font-bold backdrop-blur-sm"
              style={{ background: 'rgba(239,68,68,0.92)', color: '#fff' }}>
              🔥 {discountPercent}% OFF
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

        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-snug mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {name}
        </h3>

        {/* Highlights */}
        <ul className="space-y-1 mb-4 flex-1">
          {highlights.slice(0, 3).map((h) => (
            <li key={h} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="text-green-500 mt-0.5 shrink-0">✓</span>
              {h}
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            {hasDiscount ? (
              <>
                {discountLabel && (
                  <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: '#ef4444' }}>
                    {discountLabel}
                  </p>
                )}
                <p className="text-xs text-gray-400 line-through">{formatCurrency(basePrice)}</p>
                <p className="text-xl font-bold" style={{ color: '#16a34a' }}>{formatCurrency(discountedPrice!)}</p>
                {discountEndsAt && endsInText(discountEndsAt) && (
                  <p className="text-xs font-semibold mt-0.5" style={{ color: '#ef4444' }}>
                    ⏰ {endsInText(discountEndsAt)}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-xs text-gray-400 dark:text-gray-500">{t('startingFrom')}</p>
                <p className="text-xl font-bold" style={{ color: '#ff7d0f' }}>{formatCurrency(basePrice)}</p>
              </>
            )}
          </div>
          <Link href={`/packages/${slug}`}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200"
            style={{ background: 'var(--surface-saffron)', color: 'var(--text-on-saffron)', border: '1px solid var(--surface-saffron-border)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#ff7d0f'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.border = '1px solid #ff7d0f' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-saffron)'; e.currentTarget.style.color = 'var(--text-on-saffron)'; e.currentTarget.style.border = '1px solid var(--surface-saffron-border)' }}>
            {t('viewDetails')} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}