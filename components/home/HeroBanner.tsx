'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Phone, ChevronDown, Star, Users, MapPin, Calendar } from 'lucide-react'
import { siteConfig, cars, durations } from '@/config/site'
import { formatCurrency } from '@/lib/utils'

export default function HeroBanner() {
  const [selectedCar, setSelectedCar]      = useState(cars[0].id)
  const [selectedDuration, setSelectedDuration] = useState(durations[0].id)

  const selectedCarData = cars.find((c) => c.id === selectedCar)!
  const selectedDurationData = durations.find((d) => d.id === selectedDuration)!
  const estimatedPrice = selectedCarData.basePrice * selectedDurationData.days

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* Background gradient — replace with next/image once you have a real photo */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(135deg, #1a0a00 0%, #3d1a00 30%, #1e1b4b 70%, #0f0a2e 100%)',
        }}
      />

      {/* Decorative circles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ff7d0f, transparent)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #4338ca, transparent)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }}
        />
      </div>

      {/* Sanskrit pattern overlay */}
      <div
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,125,15,0.3) 40px, rgba(255,125,15,0.3) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,125,15,0.3) 40px, rgba(255,125,15,0.3) 41px)',
        }}
      />

      <div className="container-custom relative z-10 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── Left: Text content ── */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: 'rgba(255,125,15,0.15)',
                border: '1px solid rgba(255,125,15,0.3)',
              }}
            >
              {/* <span className="text-lg">🙏</span> */}
              <span className="text-sm font-semibold" style={{ color: '#ffb366' }}>
                {/* Jai Shri Krishna — Welcome to Braj Bhoomi */}
                🪶🦚राधे राधे 𓃔 🦚 🪄 — Welcome to Braj Bhoomi
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Experience the{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #ff7d0f, #f59e0b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Divine Land
              </span>{' '}
              of Lord Krishna
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-300 leading-relaxed mb-8 max-w-lg"
            >
              Discover Mathura &amp; Vrindavan — the sacred birthplace and playground
              of Lord Krishna. Comfortable cars, expert guides, and spiritual
              experiences crafted with love.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <Link href="/packages" className="btn-primary text-base px-8 py-4">
                Explore Packages
              </Link>
              <a
                href={`tel:${siteConfig.phone}`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-all duration-300"
                style={{
                  border: '2px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <Phone size={18} />
                Call Now
              </a>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-6"
            >
              {[
                { icon: <Star size={16} fill="currentColor" />, text: '4.9/5 Rating', color: '#f59e0b' },
                { icon: <Users size={16} />, text: '10+ Happy Pilgrims', color: '#34d399' },
                { icon: <MapPin size={16} />, text: '50+ Sacred Places', color: '#60a5fa' },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: item.color }}
                >
                  {item.icon}
                  <span className="text-gray-300">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Booking widget ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div
              className="rounded-3xl p-6 sm:p-8"
              style={{
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <h3
                className="text-white font-bold text-xl mb-1"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Plan Your Trip
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Get an instant price estimate
              </p>

              {/* Car selection */}
              <div className="mb-5">
                <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-3">
                  Choose Your Vehicle
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {cars.slice(0, 3).map((car) => (
                    <button
                      key={car.id}
                      onClick={() => setSelectedCar(car.id)}
                      className="p-3 rounded-xl text-center transition-all duration-200 cursor-pointer"
                      style={{
                        background:
                          selectedCar === car.id
                            ? 'rgba(255,125,15,0.25)'
                            : 'rgba(255,255,255,0.05)',
                        border:
                          selectedCar === car.id
                            ? '1.5px solid #ff7d0f'
                            : '1.5px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <p
                        className="text-xs font-semibold"
                        style={{
                          color: selectedCar === car.id ? '#ff9b37' : '#d1d5db',
                        }}
                      >
                        {car.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                        {car.capacity}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration selection */}
              <div className="mb-5">
                <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-3">
                  <Calendar size={12} className="inline mr-1" />
                  Trip Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {durations.slice(0, 3).map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDuration(d.id)}
                      className="py-2.5 px-1 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
                      style={{
                        background:
                          selectedDuration === d.id
                            ? 'rgba(255,125,15,0.25)'
                            : 'rgba(255,255,255,0.05)',
                        border:
                          selectedDuration === d.id
                            ? '1.5px solid #ff7d0f'
                            : '1.5px solid rgba(255,255,255,0.1)',
                        color: selectedDuration === d.id ? '#ff9b37' : '#d1d5db',
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price estimate */}
              <div
                className="rounded-2xl p-4 mb-5"
                style={{ background: 'rgba(255,125,15,0.12)', border: '1px solid rgba(255,125,15,0.2)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Estimated Price</p>
                    <p className="text-2xl font-bold" style={{ color: '#ff7d0f' }}>
                      {formatCurrency(estimatedPrice)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedCarData.name} · {selectedDurationData.label}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Starting from</p>
                    <p className="text-sm font-semibold text-green-400">
                      ✓ No hidden charges
                    </p>
                    <p className="text-sm font-semibold text-blue-400">
                      ✓ AC Vehicle
                    </p>
                  </div>
                </div>
              </div>

              <Link href={`/booking?car=${selectedCar}&duration=${selectedDuration}`} className="btn-primary w-full justify-center text-base py-4">
                Book This Package
              </Link>

              <p className="text-center text-xs text-gray-500 mt-3">
                Free cancellation up to 24 hours before trip
              </p>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <span className="text-xs text-gray-500">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown size={20} className="text-gray-500" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}