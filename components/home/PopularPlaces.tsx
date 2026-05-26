'use client'

import { useState }  from 'react'
import { motion }    from 'framer-motion'
import { Link }      from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import Image         from 'next/image'
import { ArrowRight, MapPin, Clock, Ticket } from 'lucide-react'
import SectionHeader from '@/components/shared/SectionHeader'
import { getPlaceImageSrc, getPlaceGradient, getTypeEmoji } from '@/lib/imageUtils'
import type { PlaceSummary } from '@/lib/fetchData'

interface Props {
  places: PlaceSummary[]
}

function PlaceTile({ place, index }: { place: PlaceSummary; index: number }) {
  const t                         = useTranslations('PopularPlaces')
  const resolvedSrc               = getPlaceImageSrc(place.slug, place.thumbnail)
  const [imgSrc, setImgSrc]       = useState<string | null>(resolvedSrc)
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}>
      <Link href={`/places/${place.slug}`}
        className="block card card-hover card-accent rounded-2xl overflow-hidden group h-full">

        {/* Image / fallback */}
        <div className="relative h-36 overflow-hidden"
          style={{ background: getPlaceGradient(place.type) }}>

          {/* Emoji fallback */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${imgSrc && imgLoaded ? 'opacity-0' : 'opacity-100'}`}>
            <span className="text-5xl drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
              {getTypeEmoji(place.type)}
            </span>
          </div>

          {/* Real image */}
          {imgSrc && (
            <Image
              src={imgSrc}
              alt={place.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              className={`object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgSrc(null)}
            />
          )}

          {/* Overlay */}
          {imgSrc && imgLoaded && (
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4) 100%)' }} />
          )}

          {/* City badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(255,255,255,0.9)', color: '#c74a06' }}>
              <MapPin size={9} />{place.city}
            </span>
          </div>

          {place.isFeatured && (
            <div className="absolute top-3 right-3 z-10">
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(254,243,199,0.95)', color: '#92400e' }}>⭐</span>
            </div>
          )}
        </div>

        {/* Text */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1 group-hover:text-saffron-600 dark:group-hover:text-saffron-400 transition-colors leading-tight">
            {place.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3 line-clamp-2">
            {place.shortDescription}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-300">
            {place.timeRequired && (
              <span className="flex items-center gap-1">
                <Clock size={10} />{place.timeRequired}
              </span>
            )}
            {place.entryFee && (
              <span className="flex items-center gap-1"
                style={{ color: place.entryFee === 'Free' ? '#16a34a' : 'var(--text-muted)' }}>
                <Ticket size={10} />
                {place.entryFee === 'Free' ? `✓ ${t('free')}` : place.entryFee}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function PopularPlaces({ places }: Props) {
  const t = useTranslations('PopularPlaces')
  if (places.length === 0) return null

  // Keep slug keys (English) for DB matching; render translated label
  const CITIES = [
    { slug: 'Mathura',   label: t('cityMathura') },
    { slug: 'Vrindavan', label: t('cityVrindavan') },
    { slug: 'Govardhan', label: t('cityGovardhan') },
    { slug: 'Barsana',   label: t('cityBarsana') },
    { slug: 'Gokul',     label: t('cityGokul') },
  ]

  return (
    <section className="py-20 section-alt">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <SectionHeader
            subtitle={t('subtitle')}
            title={t('title')}
            description={t('description')}
            centered={false} />
          <Link href="/places"
            className="inline-flex items-center gap-2 font-semibold text-sm flex-shrink-0"
            style={{ color: '#ff7d0f' }}>
            {t('exploreAllPlaces')} <ArrowRight size={16} />
          </Link>
        </div>

        {/* Places grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {places.map((place, i) => (
            <PlaceTile key={place.slug} place={place} index={i} />
          ))}
        </div>

        {/* City filter links with live counts */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-wrap gap-3 justify-center">
          {CITIES.map((city) => {
            const count = places.filter((p) => p.city === city.slug).length
            if (count === 0) return null
            return (
              <Link key={city.slug} href={`/places?city=${city.slug}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 bg-saffron-50 text-saffron-700 border border-saffron-200 dark:bg-saffron-900/30 dark:text-saffron-300 dark:border-saffron-800/50">
                <MapPin size={12} />{city.label}
                <span className="text-xs opacity-70">({count})</span>
              </Link>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}