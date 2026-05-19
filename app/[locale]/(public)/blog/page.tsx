import type { Metadata } from 'next'
import Link              from 'next/link'
import { Clock, Tag }    from 'lucide-react'

export const metadata: Metadata = {
  title: 'Travel Blog — Mathura Vrindavan Dham Yatra',
  description:
    'Travel guides, temple timings, festival dates, and tips for visiting Mathura and Vrindavan. Everything you need to plan your pilgrimage.',
}

const POSTS = [
  {
    slug:     'best-time-to-visit-mathura-vrindavan',
    title:    'Best Time to Visit Mathura and Vrindavan',
    excerpt:  'October to March is perfect — pleasant weather, clear skies, and peaceful darshan. Here is a month-by-month guide to help you plan.',
    date:     'January 15, 2025',
    readTime: '5 min read',
    category: 'Travel Guide',
    emoji:    '🗓️',
    featured: true,
  },
  {
    slug:     'complete-mathura-vrindavan-temples-guide',
    title:    'Complete Guide to 20 Must-Visit Temples in Mathura Vrindavan',
    excerpt:  'From Krishna Janmabhoomi to Prem Mandir — timings, significance, and practical tips for visiting every major temple in Braj.',
    date:     'December 10, 2024',
    readTime: '12 min read',
    category: 'Temple Guide',
    emoji:    '🛕',
    featured: true,
  },
  {
    slug:     'govardhan-parikrama-complete-guide',
    title:    'Govardhan Parikrama — The Complete Pilgrim\'s Guide',
    excerpt:  'Everything about the sacred 21 km circumambulation — route, stops, best time, e-rickshaw options, and what to expect.',
    date:     'November 22, 2024',
    readTime: '8 min read',
    category: 'Pilgrimage',
    emoji:    '⛰️',
    featured: false,
  },
  {
    slug:     'mathura-holi-festival-guide',
    title:    'Mathura Holi — The World\'s Most Colourful Festival Guide',
    excerpt:  'Barsana Lathmar Holi, Vrindavan Phoolon Ki Holi, and Mathura Holi — dates, locations, and how to experience each one safely.',
    date:     'October 5, 2024',
    readTime: '7 min read',
    category: 'Festivals',
    emoji:    '🎨',
    featured: true,
  },
  {
    slug:     'janmashtami-mathura-guide',
    title:    'Janmashtami in Mathura — The Ultimate Experience Guide',
    excerpt:  'Krishna\'s birthday is celebrated like nowhere else on Earth. Here\'s how to witness this spectacular festival in his birthplace.',
    date:     'September 18, 2024',
    readTime: '6 min read',
    category: 'Festivals',
    emoji:    '🎉',
    featured: false,
  },
  {
    slug:     'mathura-vrindavan-one-day-itinerary',
    title:    'Perfect One Day Itinerary for Mathura and Vrindavan',
    excerpt:  'How to see the best of both cities in a single day — temple order, timings, lunch spots, and what to skip if time is short.',
    date:     'August 30, 2024',
    readTime: '6 min read',
    category: 'Itinerary',
    emoji:    '📍',
    featured: false,
  },
  {
    slug:     '84-kos-braj-yatra-guide',
    title:    '84 Kos Braj Yatra — What You Need to Know',
    excerpt:  'The sacred 84 Kos circumambulation of all Braj Mandal. Route, duration, important stops, and how to join an organized yatra.',
    date:     'July 12, 2024',
    readTime: '10 min read',
    category: 'Pilgrimage',
    emoji:    '🚶',
    featured: false,
  },
  {
    slug:     'mathura-vrindavan-family-travel-guide',
    title:    'Mathura Vrindavan with Family — Complete Tips',
    excerpt:  'Travelling with children or elderly parents? Here is everything you need for a comfortable, safe and spiritually enriching family trip.',
    date:     'June 20, 2024',
    readTime: '7 min read',
    category: 'Family Travel',
    emoji:    '👨‍👩‍👧‍👦',
    featured: false,
  },
]

const CATEGORIES = ['All', 'Travel Guide', 'Temple Guide', 'Festivals', 'Pilgrimage', 'Itinerary', 'Family Travel']

export default function BlogPage() {
  const featured   = POSTS.filter((p) => p.featured)
  const regular    = POSTS.filter((p) => !p.featured)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div
        className="py-16 md:py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1a0a00 100%)' }}
      >
        <div className="container-custom relative z-10 text-center">
          <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">
            ✦ Travel Wisdom ✦
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}>
            Braj Travel Blog
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto text-base">
            Expert guides, temple tips, festival calendars, and travel advice from the
            people who know Mathura and Vrindavan best.
          </p>
        </div>
      </div>

      <div className="container-custom py-10">

        {/* Featured posts */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-5"
            style={{ fontFamily: 'var(--font-serif)' }}>
            Featured Articles
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((post) => (
              <div key={post.slug}
                className="card card-hover rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="h-36 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
                  <span className="text-6xl">{post.emoji}</span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: '#eef2ff', color: '#4338ca' }}>
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-400">{post.readTime}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug">{post.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1">{post.excerpt}</p>
                  <div className="flex items-center justify-between pt-4"
                    style={{ borderTop: '1px solid #f3f4f6' }}>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={10} />{post.date}
                    </span>
                    <Link href={`/blog/${post.slug}`}
                      className="text-xs font-semibold"
                      style={{ color: '#ff7d0f' }}>
                      Read More →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All posts */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-5"
            style={{ fontFamily: 'var(--font-serif)' }}>
            All Articles
          </h2>
          <div className="space-y-4">
            {regular.map((post) => (
              <div key={post.slug}
                className="card card-hover rounded-2xl p-5 flex items-start gap-5"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl"
                  style={{ background: '#fff8ed' }}>
                  {post.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                      style={{ background: '#f3f4f6', color: '#6b7280' }}>
                      <Tag size={9} className="inline mr-1" />{post.category}
                    </span>
                    <span className="text-xs text-gray-400">{post.readTime} · {post.date}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1 leading-snug">{post.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
                </div>
                <Link href={`/blog/${post.slug}`}
                  className="text-xs font-semibold whitespace-nowrap flex-shrink-0 self-center"
                  style={{ color: '#ff7d0f' }}>
                  Read →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="rounded-3xl p-8 text-center"
          style={{ background: 'linear-gradient(135deg, #fff8ed, #ffefd4)', border: '1px solid #ffdba8' }}>
          <p className="text-3xl mb-3">📬</p>
          <h3 className="text-xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: 'var(--font-serif)' }}>
            Planning a Trip to Braj?
          </h3>
          <p className="text-gray-500 text-sm mb-5 max-w-md mx-auto">
            Get a personalized travel plan, temple timings, and local tips sent directly to your WhatsApp.
          </p>
          <Link href="/contact" className="btn-primary inline-flex">
            Get Free Travel Advice
          </Link>
        </div>
      </div>
    </div>
  )
}