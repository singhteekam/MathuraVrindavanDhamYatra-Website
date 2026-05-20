'use client'

import { useState } from 'react'
import { motion }   from 'framer-motion'
import { useTranslations } from 'next-intl'
import { MapPin, Star, Clock, IndianRupee } from 'lucide-react'
import { siteConfig } from '@/config/site'

const RESTAURANTS = [
  {
    name:        'Brijwasi Mithai Wala',
    city:        'Mathura',
    address:     'Holi Gate, Mathura',
    type:        'Sweet Shop & Snacks',
    specialty:   'Peda, Mathura Peda, Kachori',
    rating:      4.8,
    priceRange:  '₹50–200',
    timings:     '7 AM – 10 PM',
    isPopular:   true,
    emoji:       '🍬',
    description: 'The most famous sweet shop in Mathura — their Mathura Peda is legendary and a must-try for every visitor.',
    tags:        ['Sweets', 'Snacks', 'Takeaway'],
  },
  {
    name:        'Govinda Restaurant (ISKCON)',
    city:        'Vrindavan',
    address:     'ISKCON Temple Campus, Vrindavan',
    type:        'Temple Restaurant',
    specialty:   'Prasadam Thali, Sattvic food',
    rating:      4.7,
    priceRange:  '₹150–350',
    timings:     '11 AM – 3 PM, 6 PM – 9 PM',
    isPopular:   true,
    emoji:       '🍱',
    description: 'Pure sattvic food served inside the ISKCON campus. The prasadam thali is spiritually nourishing and delicious.',
    tags:        ['Thali', 'Prasadam', 'Sattvic'],
  },
  {
    name:        'Radha Vallabh Dhaba',
    city:        'Vrindavan',
    address:     'Banke Bihari Temple Road, Vrindavan',
    type:        'Traditional Dhaba',
    specialty:   'Dal Baati, Churma, Kadhi Chawal',
    rating:      4.5,
    priceRange:  '₹80–200',
    timings:     '8 AM – 10 PM',
    isPopular:   false,
    emoji:       '🍲',
    description: 'Authentic Braj-style dhaba serving hot and hearty meals perfect for pilgrims after morning darshan.',
    tags:        ['Dhaba', 'Thali', 'Braj Cuisine'],
  },
  {
    name:        'Madhuvan Restaurant',
    city:        'Mathura',
    address:     'Near Vishram Ghat, Mathura',
    type:        'Restaurant',
    specialty:   'North Indian Thali, Paneer dishes',
    rating:      4.3,
    priceRange:  '₹120–300',
    timings:     '7 AM – 11 PM',
    isPopular:   false,
    emoji:       '🍛',
    description: 'Well-established restaurant near Vishram Ghat with spacious seating, fast service, and hearty north Indian meals.',
    tags:        ['Thali', 'North Indian', 'Family'],
  },
  {
    name:        'Nidhivan Prasad Bhandar',
    city:        'Vrindavan',
    address:     'Near Nidhivan, Vrindavan',
    type:        'Prasadam & Sweets',
    specialty:   'Panchamrit, Charnamrit, Ladoo',
    rating:      4.6,
    priceRange:  '₹30–150',
    timings:     '6 AM – 8 PM',
    isPopular:   true,
    emoji:       '🙏',
    description: 'The go-to place for temple prasadam and traditional Braj sweets. Their Charnamrit is divine.',
    tags:        ['Prasadam', 'Sweets', 'Budget'],
  },
  {
    name:        'Gokul Dhaba',
    city:        'Gokul',
    address:     'Near Gokul Chaurasi Khamba, Gokul',
    type:        'Village Dhaba',
    specialty:   'Makhan Mishri, Lassi, Chole Bhature',
    rating:      4.4,
    priceRange:  '₹50–180',
    timings:     '7 AM – 9 PM',
    isPopular:   false,
    emoji:       '🥛',
    description: 'Rustic village dhaba serving fresh makhan mishri — the very food Krishna loved. The fresh lassi is unmissable.',
    tags:        ['Village Food', 'Lassi', 'Budget'],
  },
  {
    name:        'Govardhan Parikrama Dhaba',
    city:        'Govardhan',
    address:     'Govardhan Parikrama Road, Govardhan',
    type:        'Pilgrim Dhaba',
    specialty:   'Poori Sabzi, Khichdi, Lassi',
    rating:      4.2,
    priceRange:  '₹60–150',
    timings:     '5 AM – 9 PM',
    isPopular:   false,
    emoji:       '⛰️',
    description: 'The perfect rest stop during Govardhan Parikrama. Simple, clean food that keeps you energized for the walk.',
    tags:        ['Pilgrim Food', 'Budget', 'Quick Meals'],
  },
  {
    name:        'Barsana Maa Radha Hotel',
    city:        'Barsana',
    address:     'Near Radha Rani Temple, Barsana',
    type:        'Restaurant',
    specialty:   'Thali, Kachori, Halwa',
    rating:      4.1,
    priceRange:  '₹80–200',
    timings:     '7 AM – 8 PM',
    isPopular:   false,
    emoji:       '🌸',
    description: 'The best dining option in Barsana, located near the Radha Rani Temple. Good thali and refreshing buttermilk.',
    tags:        ['Thali', 'Temple Town', 'Vegetarian'],
  },
]

const CITY_KEYS = [
  { slug: 'All',       key: 'cityAll' },
  { slug: 'Mathura',   key: 'cityMathura' },
  { slug: 'Vrindavan', key: 'cityVrindavan' },
  { slug: 'Govardhan', key: 'cityGovardhan' },
  { slug: 'Gokul',     key: 'cityGokul' },
  { slug: 'Barsana',   key: 'cityBarsana' },
]
const TYPE_KEYS = [
  { tag: 'All',      key: 'categoryAll' },
  { tag: 'Thali',    key: 'categoryThali' },
  { tag: 'Sweets',   key: 'categorySweets' },
  { tag: 'Prasadam', key: 'categoryPrasadam' },
  { tag: 'Dhaba',    key: 'categoryDhaba' },
  { tag: 'Budget',   key: 'categoryBudget' },
]
const BRAJ_FOOD_KEYS = [
  { emoji: '🍬', nameKey: 'mustTry.pedaName',       descKey: 'mustTry.pedaDesc' },
  { emoji: '🧈', nameKey: 'mustTry.makhanName',     descKey: 'mustTry.makhanDesc' },
  { emoji: '🥛', nameKey: 'mustTry.lassiName',      descKey: 'mustTry.lassiDesc' },
  { emoji: '🥙', nameKey: 'mustTry.kachoriName',    descKey: 'mustTry.kachoriDesc' },
  { emoji: '🙏', nameKey: 'mustTry.panchamritName', descKey: 'mustTry.panchamritDesc' },
  { emoji: '🍲', nameKey: 'mustTry.dalBaatiName',   descKey: 'mustTry.dalBaatiDesc' },
]

export default function RestaurantsClient() {
  const t                     = useTranslations('RestaurantsPage')
  const [city,    setCity]    = useState('All')
  const [typeTag, setTypeTag] = useState('All')

  const CITIES     = CITY_KEYS.map((c) => ({ ...c, label: t(c.key) }))
  const TYPES      = TYPE_KEYS.map((tp) => ({ ...tp, label: t(tp.key) }))
  const BRAJ_FOODS = BRAJ_FOOD_KEYS.map((f) => ({ ...f, name: t(f.nameKey), desc: t(f.descKey) }))

  const filtered = RESTAURANTS
    .filter((r) => {
      if (city    !== 'All' && r.city !== city)                                  return false
      if (typeTag !== 'All' && !r.tags.some((tag) => tag.includes(typeTag)))    return false
      return true
    })
    .sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Hero */}
      <div
        className="py-16 md:py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 40%, #1e1b4b 100%)' }}
      >
        <div className="container-custom relative z-10 text-center">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-saffron-400 font-semibold text-sm uppercase tracking-widest mb-3">
            ✦ {t('heroSubtitle')} ✦
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}>
            {t('heroTitle')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-gray-300 max-w-xl mx-auto text-base mb-6">
            {t('heroDescription')}
          </motion.p>
          <motion.a
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(t('whatsAppGreeting'))}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm"
            style={{ background: '#22c55e', color: '#fff' }}>
            {t('recommendCTA')}
          </motion.a>
        </div>
      </div>

      <div className="container-custom py-8">

        {/* Must-try Braj foods */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-5"
            style={{ fontFamily: 'var(--font-serif)' }}>
            {t('mustTryTitle')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {BRAJ_FOODS.map((food) => (
              <div key={food.nameKey} className="card rounded-2xl p-4 text-center card-hover">
                <p className="text-3xl mb-2">{food.emoji}</p>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-xs mb-1">{food.name}</p>
                <p className="text-gray-400 dark:text-gray-500 leading-tight" style={{ fontSize: '10px' }}>{food.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {CITIES.map((c) => (
              <button key={c.slug} onClick={() => setCity(c.slug)}
                className="flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-semibold transition-all"
                style={city === c.slug
                  ? { background: '#ff7d0f', color: '#fff' }
                  : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }
                }>
                <MapPin size={10} />{c.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {TYPES.map((tp) => (
              <button key={tp.tag} onClick={() => setTypeTag(tp.tag)}
                className="px-3.5 py-2 rounded-full text-xs font-semibold transition-all"
                style={typeTag === tp.tag
                  ? { background: '#4338ca', color: '#fff' }
                  : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }
                }>
                {tp.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('showing')} <strong className="text-gray-800 dark:text-gray-200">{filtered.length}</strong> {t('restaurants')}
          {city !== 'All' && <> {t('inCity')} <strong className="text-saffron-600 dark:text-saffron-400">{CITIES.find((c) => c.slug === city)?.label ?? city}</strong></>}
        </p>

        {/* Restaurant grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filtered.map((r, i) => (
            <motion.div key={r.name}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="card card-hover rounded-2xl overflow-hidden flex flex-col">
              {/* Colour banner */}
              <div className="h-32 flex items-center justify-center relative"
                style={{ background: 'linear-gradient(135deg, #fff8ed, #ffefd4)' }}>
                <span className="text-5xl">{r.emoji}</span>
                {r.isPopular && (
                  <span className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: '#fef3c7', color: '#92400e' }}>
                    {t('popular')}
                  </span>
                )}
                <span className="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  {t('pureVeg')}
                </span>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{r.name}</h3>
                  <span className="flex items-center gap-1 text-xs font-bold flex-shrink-0"
                    style={{ color: '#f59e0b' }}>
                    <Star size={11} fill="currentColor" />{r.rating}
                  </span>
                </div>

                <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                  <MapPin size={10} />{r.address}
                </p>
                <p className="text-xs font-semibold mb-3" style={{ color: '#ff7d0f' }}>
                  {r.type} · {r.specialty}
                </p>

                <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">{r.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {r.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: '#f3f4f6', color: '#6b7280' }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4"
                  style={{ borderTop: '1px solid #f3f4f6' }}>
                  <div className="space-y-0.5">
                    <p className="text-xs flex items-center gap-1 text-gray-500">
                      <IndianRupee size={10} />{r.priceRange} {t('perPerson')}
                    </p>
                    <p className="text-xs flex items-center gap-1 text-gray-500">
                      <Clock size={10} />{r.timings}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(t('directionsGreeting', { name: r.name, city: r.city }))}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold px-3 py-2 rounded-full transition-colors"
                    style={{ background: '#dcfce7', color: '#16a34a' }}>
                    {t('directions')}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dining tips */}
        <div className="rounded-3xl p-8 md:p-10"
          style={{ background: 'linear-gradient(135deg, #fff8ed, #ffefd4)', border: '1px solid #ffdba8' }}>
          <h3 className="text-2xl font-bold text-gray-900 mb-5" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('tipsTitle')}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { tip: t('tip1') },
              { tip: t('tip2') },
              { tip: t('tip3') },
              { tip: t('tip4') },
              { tip: t('tip5') },
              { tip: t('tip6') },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                  style={{ background: '#ff7d0f' }}>
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}