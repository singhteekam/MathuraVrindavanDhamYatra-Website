'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, MapPin, Phone, Wifi, UtensilsCrossed, Car, Snowflake } from 'lucide-react'
import { siteConfig } from '@/config/site'

const HOTELS = [
  {
    name: 'Hotel Brijwasi Royal',
    city: 'Mathura',
    address: 'Near Vishram Ghat, Mathura',
    rating: 4.3,
    priceRange: { min: 1200, max: 3500 },
    amenities: ['AC', 'WiFi', 'Restaurant', 'Parking'],
    description:
      'Well-located hotel near Vishram Ghat with clean rooms, pure veg restaurant, and great views of the Yamuna.',
    isVegOnly: true,
    isFeatured: true,
    category: 'mid-range',
  },
  {
    name: 'Radha Ashok Hotel',
    city: 'Mathura',
    address: 'Masani Bypass Road, Mathura',
    rating: 4.1,
    priceRange: { min: 900, max: 2200 },
    amenities: ['AC', 'WiFi', 'Restaurant', 'Parking'],
    description:
      'Budget-friendly hotel with comfortable rooms, ideal for families and pilgrim groups visiting Mathura.',
    isVegOnly: true,
    isFeatured: false,
    category: 'budget',
  },
  {
    name: 'Nidhivan Sarovar Portico',
    city: 'Vrindavan',
    address: 'Raman Reti Road, Vrindavan',
    rating: 4.6,
    priceRange: { min: 3500, max: 8000 },
    amenities: ['AC', 'WiFi', 'Restaurant', 'Parking'],
    description:
      'The most premium hotel in Vrindavan — walking distance from Prem Mandir with excellent pure veg dining.',
    isVegOnly: true,
    isFeatured: true,
    category: 'premium',
  },
  {
    name: 'Hotel Vrindavan Palace',
    city: 'Vrindavan',
    address: 'Bhaktivedanta Swami Marg, Vrindavan',
    rating: 4.2,
    priceRange: { min: 1500, max: 4000 },
    amenities: ['AC', 'WiFi', 'Restaurant', 'Parking'],
    description:
      'Comfortable mid-range hotel near ISKCON Temple, popular with devotee groups and families.',
    isVegOnly: true,
    isFeatured: false,
    category: 'mid-range',
  },
  {
    name: 'ISKCON Guesthouse',
    city: 'Vrindavan',
    address: 'ISKCON Campus, Vrindavan',
    rating: 4.4,
    priceRange: { min: 800, max: 2500 },
    amenities: ['AC', 'Restaurant', 'Parking'],
    description:
      'Stay inside the ISKCON campus — simple, clean rooms with prasadam included. Ideal for spiritual retreats.',
    isVegOnly: true,
    isFeatured: true,
    category: 'budget',
  },
  {
    name: 'Govardhan Eco Village',
    city: 'Govardhan',
    address: 'Near Govardhan Hill, Govardhan',
    rating: 4.5,
    priceRange: { min: 2000, max: 5000 },
    amenities: ['AC', 'WiFi', 'Restaurant', 'Parking'],
    description:
      'A spiritual retreat at the base of Govardhan Hill — perfect for devotees doing the Govardhan Parikrama.',
    isVegOnly: true,
    isFeatured: false,
    category: 'mid-range',
  },
]

const CITIES     = ['All', 'Mathura', 'Vrindavan', 'Govardhan', 'Barsana']
const CATEGORIES = [
  { value: 'all',       label: 'All Budgets'            },
  { value: 'budget',    label: 'Budget (₹500–1500)'    },
  { value: 'mid-range', label: 'Mid-Range (₹1500–4000)' },
  { value: 'premium',   label: 'Premium (₹4000+)'       },
]

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi:       <Wifi size={13} />,
  AC:         <Snowflake size={13} />,
  Restaurant: <UtensilsCrossed size={13} />,
  Parking:    <Car size={13} />,
}

function formatPrice(min: number, max: number) {
  return `₹${min.toLocaleString('en-IN')} – ₹${max.toLocaleString('en-IN')}/night`
}

export default function HotelsClient() {
  const [city,     setCity]     = useState('All')
  const [category, setCategory] = useState('all')

  const filtered = HOTELS
    .filter((h) => {
      if (city !== 'All' && h.city !== city) return false
      if (category !== 'all' && h.category !== category) return false
      return true
    })
    .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div
        className="py-16 md:py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 40%, #1e1b4b 100%)' }}
      >
        <div className="container-custom relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-saffron-400 font-semibold text-sm uppercase tracking-widest mb-3"
          >
            ✦ Hotel Recommendations ✦
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Stay Comfortably in Braj
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-gray-300 max-w-xl mx-auto text-base mb-6"
          >
            Hand-picked pure vegetarian hotels across Mathura, Vrindavan, Govardhan
            and Barsana — from budget pilgrim stays to premium spiritual retreats.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}?text=Namaste! I need help finding a hotel in Mathura Vrindavan. Please help. 🙏`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm"
              style={{ background: '#22c55e', color: '#fff' }}
            >
              WhatsApp for Free Hotel Help
            </a>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-8">

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {CITIES.map((c) => (
              <button key={c} onClick={() => setCity(c)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={city === c
                  ? { background: '#ff7d0f', color: '#fff' }
                  : { background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb' }
                }
              >
                <MapPin size={11} />{c}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button key={cat.value} onClick={() => setCategory(cat.value)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={category === cat.value
                  ? { background: '#4338ca', color: '#fff' }
                  : { background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb' }
                }
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Showing <strong>{filtered.length}</strong> hotels
          {city !== 'All' && <> in <strong className="text-saffron-600">{city}</strong></>}
        </p>

        {/* Hotel grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((hotel, i) => (
            <motion.div
              key={hotel.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="card card-hover overflow-hidden flex flex-col"
            >
              {/* Image placeholder */}
              <div className="relative h-44"
                style={{ background: 'linear-gradient(135deg, #fff8ed, #ffefd4)' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl">🏨</span>
                </div>
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="badge-saffron badge">
                    <MapPin size={9} />{hotel.city}
                  </span>
                  {hotel.isVegOnly && (
                    <span className="badge" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                      🟢 Pure Veg
                    </span>
                  )}
                </div>
                {hotel.isFeatured && (
                  <div className="absolute top-3 right-3">
                    <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>
                      ⭐ Recommended
                    </span>
                  </div>
                )}
                <div
                  className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(0,0,0,0.6)', color: '#fbbf24' }}>
                  <Star size={10} fill="currentColor" />
                  {hotel.rating}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 text-base mb-1">{hotel.name}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                  <MapPin size={10} />{hotel.address}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">{hotel.description}</p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {hotel.amenities.map((am) => (
                    <span key={am}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: '#f3f4f6', color: '#6b7280' }}>
                      {AMENITY_ICONS[am] ?? null}{am}
                    </span>
                  ))}
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between pt-4"
                  style={{ borderTop: '1px solid #f3f4f6' }}>
                  <div>
                    <p className="text-xs text-gray-400">Price range</p>
                    <p className="text-sm font-bold" style={{ color: '#ff7d0f' }}>
                      {formatPrice(hotel.priceRange.min, hotel.priceRange.max)}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${siteConfig.whatsapp}?text=Namaste! I need help booking ${hotel.name} in ${hotel.city}. 🙏`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full transition-colors"
                    style={{ background: '#dcfce7', color: '#16a34a' }}
                  >
                    <Phone size={11} /> Enquire
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hotel assistance CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-16 rounded-3xl p-8 md:p-10 text-center"
          style={{ background: 'linear-gradient(135deg, #fff8ed, #ffefd4)', border: '1px solid #ffdba8' }}
        >
          <p className="text-4xl mb-4">🏨</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Need Help Choosing a Hotel?
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
            Our team helps you find the best hotel for your budget, group size, and location
            preference — completely free of charge!
          </p>
          <a
            href={`https://wa.me/${siteConfig.whatsapp}?text=Namaste! I need help finding a hotel in Mathura Vrindavan. 🙏`}
            target="_blank" rel="noopener noreferrer"
            className="btn-primary inline-flex"
          >
            WhatsApp for Free Hotel Help
          </a>
        </motion.div>
      </div>
    </div>
  )
}