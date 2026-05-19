'use client'

import { useState } from 'react'
import { motion }   from 'framer-motion'
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

const CITIES   = ['All', 'Mathura', 'Vrindavan', 'Govardhan', 'Gokul', 'Barsana']
const TYPES    = ['All', 'Thali', 'Sweets', 'Prasadam', 'Dhaba', 'Budget']
const BRAJ_FOODS = [
  { name: 'Mathura Peda',     desc: 'Famous milk-based sweet — the most iconic souvenir',   emoji: '🍬' },
  { name: 'Makhan Mishri',    desc: 'Fresh butter with sugar crystals — Krishna\'s favourite', emoji: '🧈' },
  { name: 'Lassi',            desc: 'Thick, creamy yogurt drink — best in the Braj region',  emoji: '🥛' },
  { name: 'Kachori Sabzi',    desc: 'Crispy kachori with spiced potato curry for breakfast',  emoji: '🥙' },
  { name: 'Panchamrit',       desc: 'Sacred mixture of milk, curd, honey, ghee and sugar',   emoji: '🙏' },
  { name: 'Dal Baati Churma', desc: 'Rajasthani classic widely available in Braj dhabas',    emoji: '🍲' },
]

export default function RestaurantsClient() {
  const [city,    setCity]    = useState('All')
  const [typeTag, setTypeTag] = useState('All')

  const filtered = RESTAURANTS
    .filter((r) => {
      if (city    !== 'All' && r.city !== city)                           return false
      if (typeTag !== 'All' && !r.tags.some((t) => t.includes(typeTag))) return false
      return true
    })
    .sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0))

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div
        className="py-16 md:py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 40%, #1e1b4b 100%)' }}
      >
        <div className="container-custom relative z-10 text-center">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-saffron-400 font-semibold text-sm uppercase tracking-widest mb-3">
            ✦ Pure Vegetarian Only ✦
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}>
            Dining in Braj Bhoomi
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-gray-300 max-w-xl mx-auto text-base mb-6">
            Every restaurant in Mathura and Vrindavan is 100% vegetarian. From prasadam
            to Peda — discover the sacred flavours of Lord Krishna&apos;s land.
          </motion.p>
          <motion.a
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            href={`https://wa.me/${siteConfig.whatsapp}?text=Namaste! Please recommend restaurants near the temples I am visiting. 🙏`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm"
            style={{ background: '#22c55e', color: '#fff' }}>
            Get Restaurant Recommendations
          </motion.a>
        </div>
      </div>

      <div className="container-custom py-8">

        {/* Must-try Braj foods */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-5"
            style={{ fontFamily: 'var(--font-serif)' }}>
            Must-Try Foods of Braj
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {BRAJ_FOODS.map((food) => (
              <div key={food.name} className="card rounded-2xl p-4 text-center card-hover">
                <p className="text-3xl mb-2">{food.emoji}</p>
                <p className="font-bold text-gray-900 text-xs mb-1">{food.name}</p>
                <p className="text-gray-400 leading-tight" style={{ fontSize: '10px' }}>{food.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {CITIES.map((c) => (
              <button key={c} onClick={() => setCity(c)}
                className="flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-semibold transition-all"
                style={city === c
                  ? { background: '#ff7d0f', color: '#fff' }
                  : { background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb' }
                }>
                <MapPin size={10} />{c}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {TYPES.map((t) => (
              <button key={t} onClick={() => setTypeTag(t)}
                className="px-3.5 py-2 rounded-full text-xs font-semibold transition-all"
                style={typeTag === t
                  ? { background: '#4338ca', color: '#fff' }
                  : { background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb' }
                }>
                {t}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Showing <strong>{filtered.length}</strong> restaurants
          {city !== 'All' && <> in <strong className="text-saffron-600">{city}</strong></>}
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
                    ⭐ Popular
                  </span>
                )}
                <span className="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  🟢 Pure Veg
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
                      <IndianRupee size={10} />{r.priceRange} per person
                    </p>
                    <p className="text-xs flex items-center gap-1 text-gray-500">
                      <Clock size={10} />{r.timings}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${siteConfig.whatsapp}?text=Namaste! Can you help me find ${r.name} in ${r.city}? 🙏`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold px-3 py-2 rounded-full transition-colors"
                    style={{ background: '#dcfce7', color: '#16a34a' }}>
                    Directions
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
            Dining Tips for Pilgrims
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { tip: 'All food in Mathura & Vrindavan is 100% vegetarian — you will not find meat or eggs anywhere.' },
              { tip: 'Eat a hearty breakfast before morning darshan — most temples have long queues and you need energy.' },
              { tip: 'Try the prasadam distributed at temples — it is free, blessed, and delicious.' },
              { tip: 'Mathura Peda makes a perfect gift — buy from trusted shops near Holi Gate for authentic flavour.' },
              { tip: 'Carry water and light snacks if doing the Govardhan Parikrama (21 km walk).' },
              { tip: 'Most dhabas are busiest 12-2 PM and 7-9 PM. Visit slightly off-peak for faster service.' },
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