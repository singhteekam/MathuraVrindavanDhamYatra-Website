'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronDown, Phone, MessageCircle } from 'lucide-react'
import { siteConfig } from '@/config/site'

const FAQ_CATEGORIES = [
  {
    category: 'Booking & Payment',
    emoji: '💳',
    faqs: [
      {
        q: 'How do I book a tour?',
        a: 'You can book directly on our website by clicking "Book Now", call us, or send a WhatsApp message. We confirm your booking within 1 hour with all trip details.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept UPI (GPay, PhonePe, Paytm), bank transfer, credit/debit cards via Razorpay, and cash on arrival. A 30% advance secures your booking.',
      },
      {
        q: 'Is advance payment required?',
        a: 'For most packages, a 30% advance is required to confirm booking. The remaining 70% can be paid on the day of the trip before departure.',
      },
      {
        q: 'Can I book on the same day?',
        a: 'Yes, same-day bookings are available subject to vehicle availability. We recommend booking at least 1 day in advance, and 1 week in advance during festivals.',
      },
      {
        q: 'Do you offer discounts for group bookings?',
        a: 'Yes, groups of 10 or more get special pricing. Contact us directly on WhatsApp for a custom group quote.',
      },
    ],
  },
  {
    category: 'Tour Packages',
    emoji: '🚗',
    faqs: [
      {
        q: 'What is included in the package price?',
        a: 'The price includes AC vehicle, experienced driver, all fuel charges, parking fees, and inter-city transfers. Meals, hotel stays, and entry fees are not included unless specifically mentioned.',
      },
      {
        q: 'Can I customize the itinerary?',
        a: 'Absolutely! We specialize in custom itineraries. Tell us your temples of interest, duration, group size, and budget — we will create a personalized plan.',
      },
      {
        q: 'Do you provide a guide along with the driver?',
        a: 'Our drivers have deep local knowledge. A dedicated professional guide is available as an add-on for ₹500/day.',
      },
      {
        q: 'What vehicles are available?',
        a: 'Swift Dzire (4 pax), Maruti Eeco (7 pax), Maruti Ertiga (7 pax), Toyota Innova (8 pax), and Innova Crysta (7 pax). All AC, GPS-equipped, and regularly serviced.',
      },
      {
        q: 'Do you offer airport or railway station pickup?',
        a: 'Yes, pickup from Mathura Junction, Agra Airport, and Delhi IGI Airport. This can be added when booking.',
      },
    ],
  },
  {
    category: 'Hotels & Restaurants',
    emoji: '🏨',
    faqs: [
      {
        q: 'Do you help with hotel bookings?',
        a: 'Yes, hotel finding assistance is completely free. We know the best hotels in Mathura, Vrindavan, Govardhan and Barsana across all budgets.',
      },
      {
        q: 'Are restaurants in Mathura Vrindavan vegetarian?',
        a: 'Yes, the vast majority serve only pure vegetarian food as the cities are sacred to Lord Krishna. We can recommend the best options for your budget.',
      },
      {
        q: 'Can you arrange prasadam for us?',
        a: 'Yes, we guide you to temples where prasadam is distributed and also to dhaba-style places serving traditional Braj cuisine.',
      },
    ],
  },
  {
    category: 'Cancellation & Refunds',
    emoji: '❌',
    faqs: [
      {
        q: 'What is your cancellation policy?',
        a: 'Free cancellation up to 24 hours before trip — 100% refund. 12–24 hours before: 80% refund. Less than 12 hours: 50% refund. No-shows: no refund.',
      },
      {
        q: 'How long does the refund take?',
        a: 'Refunds are processed within 3-5 business days to the original payment method.',
      },
      {
        q: "What if the driver doesn't show up?",
        a: "This has never happened in our 5+ years of service. But if it ever does, you get a 100% refund and we arrange an alternative vehicle within 30 minutes.",
      },
    ],
  },
  {
    category: 'Places & Darshan',
    emoji: '🛕',
    faqs: [
      {
        q: 'Which is the most important temple in Mathura?',
        a: 'Shri Krishna Janmabhoomi (birthplace of Krishna) is the most sacred. Dwarkadhish Temple and Vishram Ghat are also must-visits.',
      },
      {
        q: 'What is the best time to visit Mathura Vrindavan?',
        a: 'October to March is the best time — pleasant weather. Janmashtami (August) and Holi (March) are the most spectacular festivals. Avoid May-June summers.',
      },
      {
        q: 'How many temples can we visit in one day?',
        a: 'On a typical one-day tour you can comfortably visit 6-8 major temples and ghats across Mathura and Vrindavan.',
      },
      {
        q: 'Is Govardhan Parikrama possible in a day trip?',
        a: 'Yes. We recommend starting by 5 AM. E-rickshaws are available on the Parikrama path for those who cannot walk the full 21 km.',
      },
    ],
  },
]

function FaqItem({ faq }: { faq: { q: string; a: string } }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-800 pr-4 leading-relaxed">{faq.q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <ChevronDown size={18} className="text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-3 bg-gray-50" style={{ borderTop: '1px solid #f3f4f6' }}>
              <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FaqClient() {
  const [activeCategory, setActiveCategory] = useState('All')
  const categories = ['All', ...FAQ_CATEGORIES.map((c) => c.category)]

  const displayed =
    activeCategory === 'All'
      ? FAQ_CATEGORIES
      : FAQ_CATEGORIES.filter((c) => c.category === activeCategory)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div
        className="py-16 md:py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1a0a00 100%)' }}
      >
        <div className="container-custom relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3"
          >
            ✦ FAQ ✦
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-gray-300 max-w-xl mx-auto text-base"
          >
            Everything you need to know about booking a Mathura Vrindavan tour with us.
            Can&apos;t find your answer? Call or WhatsApp us directly.
          </motion.p>
        </div>
      </div>

      <div className="container-custom py-10">

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
              style={activeCategory === cat
                ? { background: '#4338ca', color: '#fff', boxShadow: '0 4px 15px rgba(67,56,202,0.3)' }
                : { background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb' }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ list */}
        <div className="max-w-3xl mx-auto space-y-10">
          {displayed.map((section, si) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: si * 0.05 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">{section.emoji}</span>
                <h2 className="text-lg font-bold text-gray-900">{section.category}</h2>
                <span className="text-xs px-2 py-1 rounded-full font-semibold"
                  style={{ background: '#f3f4f6', color: '#9ca3af' }}>
                  {section.faqs.length} questions
                </span>
              </div>
              <div className="space-y-3">
                {section.faqs.map((faq, i) => (
                  <FaqItem key={i} faq={faq} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 max-w-2xl mx-auto rounded-3xl p-8 text-center"
          style={{ background: 'linear-gradient(135deg, #fff8ed, #ffefd4)', border: '1px solid #ffdba8' }}
        >
          <p className="text-3xl mb-3">💬</p>
          <h3 className="font-bold text-gray-900 text-xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Still Have Questions?
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Our team is happy to answer any question about your pilgrimage. Reach out anytime.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href={`tel:${siteConfig.phone}`} className="btn-primary">
              <Phone size={16} /> Call Us
            </a>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm"
              style={{ background: '#dcfce7', color: '#16a34a' }}
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <Link href="/contact" className="btn-secondary">Contact Form</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}