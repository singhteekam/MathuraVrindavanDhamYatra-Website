'use client'

import { useTranslations, useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { CheckCircle } from 'lucide-react'

const VALUES_DATA = {
  en: [
    { emoji: '🙏', title: 'Devotion First',      desc: 'We treat every trip as a sacred journey, not just a business transaction.' },
    { emoji: '💰', title: 'Transparent Pricing', desc: 'What you see is what you pay. Zero hidden charges, ever.' },
    { emoji: '🚗', title: 'Safety & Comfort',    desc: 'Verified drivers, clean AC vehicles, and 24/7 support on every trip.' },
    { emoji: '❤️', title: 'Heartfelt Service',   desc: "Born in Braj, we serve with the love of Krishna's own land." },
  ],
  hi: [
    { emoji: '🙏', title: 'भक्ति प्रथम',           desc: 'हम हर यात्रा को एक पवित्र यात्रा मानते हैं, न कि केवल व्यापार।' },
    { emoji: '💰', title: 'पारदर्शी मूल्य निर्धारण', desc: 'जो आप देखते हैं वही आप चुकाते हैं। कोई छुपा शुल्क नहीं।' },
    { emoji: '🚗', title: 'सुरक्षा और आराम',        desc: 'सत्यापित ड्राइवर, साफ AC वाहन और हर यात्रा पर 24/7 सहायता।' },
    { emoji: '❤️', title: 'हार्दिक सेवा',            desc: 'ब्रज में जन्मे, हम कृष्ण की अपनी भूमि के प्रेम से सेवा करते हैं।' },
  ],
}

const STATS_DATA = {
  en: [
    { value: '2000+', label: 'Happy Pilgrims' },
    { value: '5+',    label: 'Years of Service' },
    { value: '50+',   label: 'Sacred Places Covered' },
    { value: '15+',   label: 'Tour Packages' },
  ],
  hi: [
    { value: '2000+', label: 'खुश तीर्थयात्री' },
    { value: '5+',    label: 'सेवा के वर्ष' },
    { value: '50+',   label: 'पवित्र स्थान' },
    { value: '15+',   label: 'टूर पैकेज' },
  ],
}

const TIMELINE_DATA = {
  en: [
    { year: '2018', event: 'Started with a single car and a vision to serve pilgrims with honesty.' },
    { year: '2019', event: 'Expanded fleet to 5 vehicles. Launched hotel assistance service.' },
    { year: '2020', event: 'Built first website. Added WhatsApp booking during the pandemic.' },
    { year: '2021', event: 'Reached 500 happy pilgrims. Added local guide service.' },
    { year: '2022', event: 'Fleet grew to 15 vehicles. Launched 84 Kos Yatra packages.' },
    { year: '2023', event: 'Crossed 1000 bookings. Added restaurant recommendation service.' },
    { year: '2024', event: '2000+ happy pilgrims. Launched this new digital platform.' },
  ],
  hi: [
    { year: '2018', event: 'ईमानदारी से तीर्थयात्रियों की सेवा के विजन के साथ एक कार से शुरुआत।' },
    { year: '2019', event: '5 वाहनों तक बेड़ा विस्तारित। होटल सहायता सेवा शुरू।' },
    { year: '2020', event: 'पहली वेबसाइट बनाई। महामारी के दौरान व्हाट्सऐप बुकिंग जोड़ी।' },
    { year: '2021', event: '500 खुश तीर्थयात्री। स्थानीय गाइड सेवा जोड़ी।' },
    { year: '2022', event: 'बेड़ा 15 वाहनों तक बढ़ा। 84 कोस यात्रा पैकेज लॉन्च किए।' },
    { year: '2023', event: '1000 बुकिंग पार की। रेस्टोरेंट अनुशंसा सेवा जोड़ी।' },
    { year: '2024', event: '2000+ खुश तीर्थयात्री। यह नया डिजिटल प्लेटफ़ॉर्म लॉन्च।' },
  ],
}

const TRUST_POINTS_DATA = {
  en: [
    'All drivers are police-verified and locally trained',
    'Transparent pricing — final quote before booking, no changes',
    'Vehicles cleaned and sanitized before every trip',
    'Real-time support on WhatsApp throughout your journey',
    'Free cancellation up to 24 hours before trip',
    'Hotel & restaurant assistance at no extra charge',
    'We know every temple timing, aarti, and shortcut in Braj',
    'Over 2000 happy pilgrims and counting',
  ],
  hi: [
    'सभी ड्राइवर पुलिस-सत्यापित और स्थानीय रूप से प्रशिक्षित हैं',
    'पारदर्शी मूल्य निर्धारण — बुकिंग से पहले अंतिम उद्धरण, कोई बदलाव नहीं',
    'हर यात्रा से पहले वाहन साफ और सैनिटाइज़ किए जाते हैं',
    'पूरी यात्रा के दौरान व्हाट्सऐप पर रियल-टाइम सहायता',
    'यात्रा से 24 घंटे पहले तक निःशुल्क रद्दीकरण',
    'बिना अतिरिक्त शुल्क के होटल और रेस्टोरेंट सहायता',
    'हम ब्रज में हर मंदिर का समय, आरती और शॉर्टकट जानते हैं',
    '2000 से अधिक खुश तीर्थयात्री और यह सिलसिला जारी है',
  ],
}

export default function AboutClient() {
  const t      = useTranslations('AboutPage')
  const locale = useLocale() as 'en' | 'hi'
  const values = VALUES_DATA[locale] ?? VALUES_DATA.en
  const stats  = STATS_DATA[locale]  ?? STATS_DATA.en
  const timeline = TIMELINE_DATA[locale] ?? TIMELINE_DATA.en
  const trustPoints = TRUST_POINTS_DATA[locale] ?? TRUST_POINTS_DATA.en

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ── Hero ── */}
      <div
        className="py-16 md:py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1e1b4b 100%)' }}
      >
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #ff7d0f, transparent 60%), radial-gradient(circle at 70% 50%, #4338ca, transparent 60%)' }} />
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-saffron-400 font-semibold text-sm uppercase tracking-widest mb-3">
                ✦ {t('ourStory')} ✦
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight"
                style={{ fontFamily: 'var(--font-serif)' }}>
                {t('heroTitle')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-gray-300 leading-relaxed text-base mb-4">
                {t('heroPara1')}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-gray-300 leading-relaxed text-base mb-8">
                {t('heroPara2')}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="flex gap-4 flex-wrap">
                <Link href="/packages" className="btn-primary">{t('viewPackages')}</Link>
                <Link href="/contact" className="btn-secondary"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
                  {t('contactUs')}
                </Link>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="rounded-2xl p-6 text-center"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
                  <p className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-serif)' }}>{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mission ── */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <p className="section-subtitle mb-3">✦ {t('missionSubtitle')} ✦</p>
            <h2 className="section-title mb-5">{t('missionTitle')}</h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-base">{t('missionDesc')}</p>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="section-subtitle mb-3">✦ {t('valuesSubtitle')} ✦</p>
            <h2 className="section-title">{t('valuesTitle')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card card-hover p-6 text-center">
                <p className="text-4xl mb-4">{v.emoji}</p>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="section-subtitle mb-3">✦ {t('timelineSubtitle')} ✦</p>
            <h2 className="section-title">{t('timelineTitle')}</h2>
          </div>
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-saffron-200 dark:bg-saffron-900" />
            <div className="space-y-6">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="flex gap-6 items-start">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xs z-10 relative"
                      style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
                      {item.year.slice(2)}
                    </div>
                  </div>
                  <div className="card p-4 flex-1 rounded-xl">
                    <p className="text-saffron-600 font-bold text-sm mb-1">{item.year}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{item.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust ── */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="section-subtitle mb-3">✦ {t('trustSubtitle')} ✦</p>
              <h2 className="section-title mb-6">{t('trustTitle')}</h2>
              <div className="space-y-4">
                {trustPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-saffron-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl p-8 text-center"
              style={{ background: 'var(--surface-saffron)', border: '1px solid var(--surface-saffron-border)' }}>
              <p className="text-6xl mb-5">🙏</p>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-2xl mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                {t('jaiShriKrishna')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-base">
                &ldquo;{t('quote')}&rdquo;
              </p>
              <p className="font-bold text-saffron-700">— {t('quoteAuthor')}</p>
              <div className="mt-8 flex gap-3 justify-center flex-wrap">
                <Link href="/booking"  className="btn-primary">{t('bookTour')}</Link>
                <Link href="/packages" className="btn-secondary">{t('viewPackagesBtn')}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
