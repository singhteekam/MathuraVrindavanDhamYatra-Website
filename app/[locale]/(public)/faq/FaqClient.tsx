'use client'

import { useState }                   from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { motion, AnimatePresence }    from 'framer-motion'
import { Link }                       from '@/i18n/navigation'
import { ChevronDown, Phone, MessageCircle } from 'lucide-react'
import { siteConfig }                 from '@/config/site'
import { getFaqData, type FaqItem }   from '@/lib/faqContent'

function FaqItemRow({ faq }: { faq: FaqItem }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 pr-4 leading-relaxed">{faq.q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <ChevronDown size={18} className="text-gray-400 dark:text-gray-500" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden">
            <div className="px-5 pb-5 pt-3 bg-gray-50 dark:bg-gray-900" style={{ borderTop: '1px solid var(--border-muted)' }}>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{faq.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FaqClient() {
  const t            = useTranslations('FaqPage')
  const locale       = useLocale()
  const faqData      = getFaqData(locale)
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = faqData.map((c) => c.category)
  const displayed  = activeCategory === 'all'
    ? faqData
    : faqData.filter((c) => c.category === activeCategory)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Hero */}
      <div className="py-16 md:py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1a0a00 100%)' }}>
        <div className="container-custom relative z-10 text-center">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">
            ✦ {t('heroSubtitle')} ✦
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}>
            {t('heroTitle')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-gray-300 max-w-xl mx-auto text-base">
            {t('heroDesc')}
          </motion.p>
        </div>
      </div>

      <div className="container-custom py-10">

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          <button
            onClick={() => setActiveCategory('all')}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
            style={activeCategory === 'all'
              ? { background: '#4338ca', color: '#fff', boxShadow: '0 4px 15px rgba(67,56,202,0.3)' }
              : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}>
            {t('allCategories')}
          </button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
              style={activeCategory === cat
                ? { background: '#4338ca', color: '#fff', boxShadow: '0 4px 15px rgba(67,56,202,0.3)' }
                : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ list */}
        <div className="max-w-3xl mx-auto space-y-10">
          {displayed.map((section, si) => (
            <motion.div key={section.category}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: si * 0.05 }}>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">{section.emoji}</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{section.category}</h2>
                <span className="text-xs px-2 py-1 rounded-full font-semibold bg-gray-100 dark:bg-gray-800 text-gray-400">
                  {section.faqs.length} {t('questionsLabel')}
                </span>
              </div>
              <div className="space-y-3">
                {section.faqs.map((faq, i) => (
                  <FaqItemRow key={i} faq={faq} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-16 max-w-2xl mx-auto rounded-3xl p-8 text-center"
          style={{ background: 'var(--surface-saffron)', border: '1px solid var(--surface-saffron-border)' }}>
          <p className="text-3xl mb-3">💬</p>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('stillHaveQuestions')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t('ctaDesc')}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href={`tel:${siteConfig.phone}`} className="btn-primary">
              <Phone size={16} /> {t('callUs')}
            </a>
            <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm"
              style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)' }}>
              <MessageCircle size={16} /> {t('whatsApp')}
            </a>
            <Link href="/contact" className="btn-secondary">{t('contactForm')}</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
