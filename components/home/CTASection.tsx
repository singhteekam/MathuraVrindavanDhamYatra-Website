'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Phone, MessageCircle, Send, MapPin } from 'lucide-react'
import { siteConfig } from '@/config/site'
import toast from 'react-hot-toast'

export default function CTASection() {
  const t                     = useTranslations('CTASection')
  const [form, setForm]       = useState({ name: '', phone: '', date: '', message: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.phone) {
      toast.error(t('errorMissingFields'))
      return
    }
    setLoading(true)
    // Will connect to API route later
    await new Promise((r) => setTimeout(r, 1000))
    toast.success(t('successSent'))
    setForm({ name: '', phone: '', date: '', message: '' })
    setLoading(false)
  }

  return (
    <section className="py-20 section-divine">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="section-subtitle mb-3">✦ {t('subtitle')} ✦</p>
            <h2 className="section-title mb-5">
              {t('titleLine1')}<br />
              <span style={{ color: '#ff7d0f' }}>{t('titleHighlight')}</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              {t('description')}
            </p>

            <div className="space-y-5 mb-8">
              {[
                {
                  icon: <Phone size={20} />,
                  label: t('callLabel'),
                  value: siteConfig.phone,
                  href: `tel:${siteConfig.phone}`,
                  color: '#ff7d0f',
                  bg: 'var(--surface-saffron)',
                },
                {
                  icon: <MessageCircle size={20} />,
                  label: t('whatsAppLabel'),
                  value: t('whatsAppValue'),
                  href: `https://wa.me/${siteConfig.whatsapp}`,
                  color: '#16a34a',
                  bg: 'var(--surface-green)',
                },
                {
                  icon: <MapPin size={20} />,
                  label: t('locationLabel'),
                  value: siteConfig.address,
                  href: '#',
                  color: '#4338ca',
                  bg: 'var(--surface-krishna)',
                },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group"
                  style={{ background: item.bg }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: item.color, color: '#fff' }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Quick links */}
            <div className="flex gap-3 flex-wrap">
              <Link href="/packages" className="btn-primary text-sm py-3 px-6">
                {t('viewPackages')}
              </Link>
              <a
                href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(t('whatsAppGreeting'))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200"
                style={{
                  background: 'var(--surface-green)',
                  color: 'var(--text-on-green)',
                  border: '1px solid var(--surface-green-border)',
                }}
              >
                <MessageCircle size={16} />
                {t('whatsApp')}
              </a>
            </div>
          </motion.div>

          {/* Right: Enquiry form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="rounded-3xl p-7 sm:p-9"
              style={{
                background: 'var(--surface-saffron)',
                border: '1px solid var(--surface-saffron-border)',
                boxShadow: '0 8px 40px rgba(255,125,15,0.1)',
              }}
            >
              <h3
                className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {t('formTitle')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {t('formSubtitle')}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                      {t('yourName')} *
                    </label>
                    <input
                      type="text"
                      placeholder={t('yourNamePlaceholder')}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                      {t('phoneWhatsApp')} *
                    </label>
                    <input
                      type="tel"
                      placeholder={t('phonePlaceholder')}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                    {t('plannedDate')}
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                    {t('messageLabel')}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={t('messagePlaceholder')}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="input-field resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-4 text-base"
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('sending')}
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      {t('sendEnquiry')}
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400">
                  {t('privacyNote')}
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}