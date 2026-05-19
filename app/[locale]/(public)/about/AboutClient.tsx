'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { siteConfig } from '@/config/site'

const VALUES = [
  { emoji: '🙏', title: 'Devotion First',      desc: 'We treat every trip as a sacred journey, not just a business transaction.' },
  { emoji: '💰', title: 'Transparent Pricing', desc: 'What you see is what you pay. Zero hidden charges, ever.' },
  { emoji: '🚗', title: 'Safety & Comfort',    desc: 'Verified drivers, clean AC vehicles, and 24/7 support on every trip.' },
  { emoji: '❤️', title: 'Heartfelt Service',   desc: "Born in Braj, we serve with the love of Krishna's own land." },
]

const STATS = [
  { value: '2000+', label: 'Happy Pilgrims' },
  { value: '5+',    label: 'Years of Service' },
  { value: '50+',   label: 'Sacred Places Covered' },
  { value: '15+',   label: 'Tour Packages' },
]

const TIMELINE = [
  { year: '2018', event: 'Started with a single car and a vision to serve pilgrims with honesty.' },
  { year: '2019', event: 'Expanded fleet to 5 vehicles. Launched hotel assistance service.' },
  { year: '2020', event: 'Built first website. Added WhatsApp booking during the pandemic.' },
  { year: '2021', event: 'Reached 500 happy pilgrims. Added local guide service.' },
  { year: '2022', event: 'Fleet grew to 15 vehicles. Launched 84 Kos Yatra packages.' },
  { year: '2023', event: 'Crossed 1000 bookings. Added restaurant recommendation service.' },
  { year: '2024', event: '2000+ happy pilgrims. Launched this new digital platform.' },
]

const TRUST_POINTS = [
  'All drivers are police-verified and locally trained',
  'Transparent pricing — final quote before booking, no changes',
  'Vehicles cleaned and sanitized before every trip',
  'Real-time support on WhatsApp throughout your journey',
  'Free cancellation up to 24 hours before trip',
  'Hotel & restaurant assistance at no extra charge',
  'We know every temple timing, aarti, and shortcut in Braj',
  'Over 2000 happy pilgrims and counting',
]

export default function AboutClient() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <div
        className="py-16 md:py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1e1b4b 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 50%, #ff7d0f, transparent 60%), radial-gradient(circle at 70% 50%, #4338ca, transparent 60%)',
          }}
        />
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-saffron-400 font-semibold text-sm uppercase tracking-widest mb-3"
              >
                ✦ Our Story ✦
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Born in Braj, Serving with Love
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-gray-300 leading-relaxed text-base mb-4"
              >
                Mathura Vrindavan Dham Yatra was founded in 2018 by a local family that has lived
                in the shadow of Krishna&apos;s temples their entire lives. What began as a single
                taxi helping pilgrims reach Banke Bihari Temple has grown into a trusted
                pilgrimage travel service — but our values have never changed.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-gray-300 leading-relaxed text-base mb-8"
              >
                We are not just a travel company. We are devotees ourselves. Every driver
                on our team knows the significance of each temple, the timing of every aarti,
                and the story behind every sacred site in Braj Bhoomi.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="flex gap-4 flex-wrap"
              >
                <Link href="/packages" className="btn-primary">View Our Packages</Link>
                <Link href="/contact" className="btn-secondary"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
                  Contact Us
                </Link>
              </motion.div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="rounded-2xl p-6 text-center"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <p className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mission ── */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <p className="section-subtitle mb-3">✦ Our Mission ✦</p>
            <h2 className="section-title mb-5">Making Every Pilgrimage Peaceful, Safe &amp; Memorable</h2>
            <p className="text-gray-500 leading-relaxed text-base">
              We believe every devotee deserves a smooth, comfortable, and spiritually fulfilling
              journey to the holy land of Braj. Whether you are a first-time visitor or a seasoned
              pilgrim, we handle every detail — from your pickup to your return — so you can focus
              entirely on your darshan and devotion.
            </p>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="section-subtitle mb-3">✦ Our Values ✦</p>
            <h2 className="section-title">What We Stand For</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card card-hover p-6 text-center"
              >
                <p className="text-4xl mb-4">{v.emoji}</p>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="section-subtitle mb-3">✦ Our Journey ✦</p>
            <h2 className="section-title">Growing with Every Pilgrimage</h2>
          </div>
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-saffron-200" />
            <div className="space-y-6">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-6 items-start"
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xs z-10 relative"
                      style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}
                    >
                      {item.year.slice(2)}
                    </div>
                  </div>
                  <div className="card p-4 flex-1 rounded-xl">
                    <p className="text-saffron-600 font-bold text-sm mb-1">{item.year}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust ── */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="section-subtitle mb-3">✦ Why Trust Us ✦</p>
              <h2 className="section-title mb-6">The Mathura Vrindavan Dham Yatra Promise</h2>
              <div className="space-y-4">
                {TRUST_POINTS.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-saffron-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="rounded-3xl p-8 text-center"
              style={{ background: 'linear-gradient(135deg, #fff8ed, #ffefd4)', border: '1px solid #ffdba8' }}
            >
              <p className="text-6xl mb-5">🙏</p>
              <h3 className="font-bold text-gray-900 text-2xl mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                Jai Shri Krishna
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6 text-base">
                &ldquo;Our goal is simple — every pilgrim who travels with us should feel like
                they are being looked after by a family member who loves this sacred land
                as much as they do.&rdquo;
              </p>
              <p className="font-bold text-saffron-700">— The MVTravel Family</p>
              <div className="mt-8 flex gap-3 justify-center flex-wrap">
                <Link href="/booking"  className="btn-primary">Book Your Tour</Link>
                <Link href="/packages" className="btn-secondary">View Packages</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}