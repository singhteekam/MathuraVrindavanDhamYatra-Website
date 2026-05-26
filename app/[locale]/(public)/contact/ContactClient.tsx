'use client'

import { useState }                   from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { motion }                     from 'framer-motion'
import { Link }                       from '@/i18n/navigation'
import {
  Phone, Mail, MapPin, Clock, Send,
  MessageCircle, Instagram, Facebook, Youtube,
} from 'lucide-react'
import toast            from 'react-hot-toast'
import { siteConfig }   from '@/config/site'

const QUICK_FAQS_DATA = {
  en: [
    { q: 'How do I book a tour?',         a: 'You can book on our website, call us, or WhatsApp. We confirm within 1 hour.' },
    { q: 'Do you provide hotel assistance?', a: 'Yes, we help find and book hotels in Mathura and Vrindavan — free of charge.' },
    { q: 'What is your cancellation policy?', a: 'Free cancellation up to 24 hours before the trip. After that, 20% fee applies.' },
    { q: 'Do you operate on festival days?', a: 'Yes, we operate 365 days a year. Book festival trips well in advance.' },
  ],
  hi: [
    { q: 'टूर कैसे बुक करें?',            a: 'आप हमारी वेबसाइट पर, कॉल करके, या व्हाट्सऐप से बुक कर सकते हैं। हम 1 घंटे में पुष्टि करते हैं।' },
    { q: 'क्या आप होटल सहायता प्रदान करते हैं?', a: 'हाँ, हम मथुरा और वृन्दावन में होटल खोजने और बुक करने में निःशुल्क सहायता करते हैं।' },
    { q: 'आपकी रद्दीकरण नीति क्या है?',    a: 'यात्रा से 24 घंटे पहले तक निःशुल्क रद्दीकरण। उसके बाद 20% शुल्क लागू होता है।' },
    { q: 'क्या आप त्यौहारों पर काम करते हैं?', a: 'हाँ, हम वर्ष के 365 दिन काम करते हैं। त्यौहार यात्राएं काफी पहले बुक करें।' },
  ],
}

export default function ContactClient() {
  const t      = useTranslations('ContactPage')
  const locale = useLocale() as 'en' | 'hi'
  const quickFaqs = QUICK_FAQS_DATA[locale] ?? QUICK_FAQS_DATA.en

  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', passengers: '', message: '' })
  const [loading,  setLoading]  = useState(false)
  const [openFaq,  setOpenFaq]  = useState<number | null>(null)

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error(t('toastNamePhone'))
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:       form.name.trim(),
          phone:      form.phone.trim(),
          email:      form.email.trim()   || undefined,
          message:    form.message.trim() || `Enquiry from ${form.name}`,
          tourDate:   form.date           || undefined,
          passengers: form.passengers     || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? t('toastError')); return }
      toast.success(t('toastSuccess'))
      setForm({ name: '', phone: '', email: '', date: '', passengers: '', message: '' })
    } catch {
      toast.error(t('toastNetworkError'))
    } finally {
      setLoading(false)
    }
  }

  const CONTACT_ITEMS = [
    { icon: <Phone size={22} />,       label: t('callLabel'),       value: siteConfig.phone,           sub: t('callSub'),       href: `tel:${siteConfig.phone}`,               color: '#ff7d0f', bg: 'var(--surface-saffron)' },
    { icon: <MessageCircle size={22}/>, label: t('whatsappLabel'),  value: t('whatsappValue'),          sub: t('whatsappSub'),   href: `https://wa.me/${siteConfig.whatsapp}`,  color: '#16a34a', bg: 'var(--surface-green)'   },
    { icon: <Mail size={22} />,         label: t('emailLabel'),     value: siteConfig.email,            sub: t('emailSub'),      href: `mailto:${siteConfig.email}`,            color: '#4338ca', bg: 'var(--surface-krishna)' },
    { icon: <MapPin size={22} />,       label: t('officeLabel'),    value: t('officeValue'),            sub: t('officeSub'),     href: 'https://maps.google.com/?q=Mathura,UP,India', color: '#db2777', bg: 'var(--surface-red)'     },
  ]

  const BUSINESS_HOURS = [
    { day: t('mondayFriday'), time: '7:00 AM – 10:00 PM' },
    { day: t('saturday'),     time: '6:00 AM – 10:00 PM' },
    { day: t('sunday'),       time: '6:00 AM – 9:00 PM'  },
    { day: t('allFestivals'), time: t('extendedHours')    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Hero */}
      <div className="py-16 md:py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1e1b4b 100%)' }}>
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ff7d0f, transparent)' }} />
        <div className="container-custom relative z-10 text-center">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-saffron-400 font-semibold text-sm uppercase tracking-widest mb-3">
            ✦ {t('heroSubtitle')} ✦
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-serif)' }}>
            {t('heroTitle')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-gray-300 max-w-xl mx-auto text-base">
            {t('heroDesc')}
          </motion.p>
        </div>
      </div>

      <div className="container-custom py-14">

        {/* Contact cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {CONTACT_ITEMS.map((item, i) => (
            <motion.a key={item.label} href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card card-hover p-6 block">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: item.bg, color: item.color }}>
                {item.icon}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide mb-1">{item.label}</p>
              <p className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">{item.value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{item.sub}</p>
            </motion.a>
          ))}
        </div>

        {/* Form + FAQ */}
        <div className="grid lg:grid-cols-2 gap-12">

          {/* Enquiry form */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2"
              style={{ fontFamily: 'var(--font-serif)' }}>
              {t('sendMessage')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-7">{t('formDesc')}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    {t('fullName')}
                  </label>
                  <input type="text" placeholder={t('fullNamePlaceholder')} required
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    {t('phone')}
                  </label>
                  <input type="tel" placeholder={t('phonePlaceholder')} required
                    value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  {t('email')}
                </label>
                <input type="email" placeholder="your@email.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    {t('travelDate')}
                  </label>
                  <input type="date" min={new Date().toISOString().split('T')[0]}
                    value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    {t('numberOfPeople')}
                  </label>
                  <select value={form.passengers}
                    onChange={(e) => setForm({ ...form, passengers: e.target.value })}
                    className="input-field">
                    <option value="">{t('select')}</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, '9+'].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? t('person') : t('people')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  {t('messageLabel')}
                </label>
                <textarea rows={4} placeholder={t('messagePlaceholder')}
                  value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="input-field resize-none" />
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-4 text-base"
                style={{ opacity: loading ? 0.7 : 1 }}>
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t('sending')}</>
                  : <><Send size={18} /> {t('sendBtn')}</>}
              </button>
              <p className="text-center text-xs text-gray-400">{t('privacyNote')}</p>
            </form>
          </motion.div>

          {/* Right: hours + FAQ + social */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="space-y-8">

            {/* Hours */}
            <div className="card p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-saffron-100 dark:bg-saffron-900/30 flex items-center justify-center">
                  <Clock size={18} className="text-saffron-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">{t('businessHours')}</h3>
              </div>
              <div className="space-y-3">
                {BUSINESS_HOURS.map((item) => (
                  <div key={item.day}
                    className="flex justify-between items-center py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.day}</span>
                    <span className="text-sm font-semibold text-saffron-600">{item.time}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl"
                style={{ background: 'var(--surface-green)', border: '1px solid var(--surface-green-border)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-on-green)' }}>{t('whatsAppNote')}</p>
              </div>
            </div>

            {/* Mini FAQ */}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-lg"
                style={{ fontFamily: 'var(--font-serif)' }}>
                {t('quickAnswers')}
              </h3>
              <div className="space-y-3">
                {quickFaqs.map((faq, i) => (
                  <div key={i} className="card rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 pr-4">{faq.q}</span>
                      <span className="text-saffron-500 font-bold shrink-0 text-lg leading-none">
                        {openFaq === i ? '−' : '+'}
                      </span>
                    </button>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 pb-4" style={{ borderTop: '1px solid var(--border-muted)' }}>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pt-3">{faq.a}</p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
              <Link href="/faq" className="inline-flex items-center gap-1 mt-4 text-sm font-semibold"
                style={{ color: '#ff7d0f' }}>
                {t('viewAllFaqs')}
              </Link>
            </div>

            {/* Social */}
            <div className="card p-6 rounded-2xl">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">{t('followUs')}</h3>
              <div className="flex gap-3">
                {[
                  { icon: <Facebook size={18} />,  href: siteConfig.social.facebook,  label: 'Facebook',  color: '#1877f2', bg: 'var(--surface-krishna)' },
                  { icon: <Instagram size={18} />, href: siteConfig.social.instagram, label: 'Instagram', color: '#e1306c', bg: 'var(--surface-red)'     },
                  { icon: <Youtube size={18} />,   href: siteConfig.social.youtube,   label: 'YouTube',   color: '#ff0000', bg: 'var(--surface-red)'     },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl font-semibold text-xs transition-all hover:scale-105"
                    style={{ background: s.bg, color: s.color }}>
                    {s.icon}{s.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
