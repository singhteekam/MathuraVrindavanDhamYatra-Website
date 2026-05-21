'use client'

import { useEffect, useState }    from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link                       from 'next/link'
import { motion }                 from 'framer-motion'
import {
  Home, Search, MapPin, Package, Phone, ArrowRight,
  BookOpen, Map, UtensilsCrossed, HelpCircle, MessageCircle,
} from 'lucide-react'

// ── Route similarity matching ──────────────────────────────────────────────────
const ALL_ROUTES = [
  { path: '/',              label: 'Home',           icon: <Home          size={16} />, keywords: ['home', 'main', 'index']                                },
  { path: '/packages',     label: 'Tour Packages',  icon: <Package       size={16} />, keywords: ['package', 'tour', 'trip', 'yatra', 'booking']          },
  { path: '/places',       label: 'Sacred Places',  icon: <MapPin        size={16} />, keywords: ['place', 'temple', 'ghat', 'mandir', 'sacred', 'visit'] },
  { path: '/booking',      label: 'Book a Tour',    icon: <BookOpen      size={16} />, keywords: ['book', 'reserve', 'taxi', 'car']                       },
  { path: '/hotels',       label: 'Hotels',         icon: <Map           size={16} />, keywords: ['hotel', 'stay', 'accommodation', 'lodge', 'dharamshala']},
  { path: '/restaurants',  label: 'Restaurants',    icon: <UtensilsCrossed size={16} />, keywords: ['restaurant', 'food', 'eat', 'dhaba', 'prasad']       },
  { path: '/contact',      label: 'Contact Us',     icon: <Phone         size={16} />, keywords: ['contact', 'help', 'support', 'reach']                  },
  { path: '/about',        label: 'About Us',       icon: <HelpCircle    size={16} />, keywords: ['about', 'who', 'company', 'team']                      },
  { path: '/faq',          label: 'FAQ',            icon: <HelpCircle    size={16} />, keywords: ['faq', 'question', 'answer', 'help']                    },
  { path: '/blog',         label: 'Travel Blog',    icon: <BookOpen      size={16} />, keywords: ['blog', 'article', 'guide', 'tips', 'read']             },
]

// Suggest routes whose keywords overlap with the invalid path segments
function getSuggestions(pathname: string): typeof ALL_ROUTES {
  const segments = pathname.toLowerCase().split('/').filter(Boolean)
  const scored = ALL_ROUTES.map((route) => {
    const score = segments.reduce((s, seg) =>
      route.keywords.some((kw) => kw.includes(seg) || seg.includes(kw)) ? s + 1 : s, 0,
    )
    return { ...route, score }
  }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score)

  // Always return at least 4 suggestions
  if (scored.length >= 4) return scored.slice(0, 4)
  const fallback = ALL_ROUTES.filter((r) => !scored.find((s) => s.path === r.path))
  return [...scored, ...fallback].slice(0, 4)
}

// ── Sanskrit / devotional quotes ─────────────────────────────────────────────
const QUOTES = [
  { text: 'सर्वे भवन्तु सुखिनः', meaning: 'May all beings be happy' },
  { text: 'यदा यदा हि धर्मस्य', meaning: 'Whenever dharma declines, I appear' },
  { text: 'कर्मण्येवाधिकारस्ते', meaning: 'You have a right to perform your duties' },
  { text: 'जय श्री कृष्ण 🙏', meaning: 'Victory to Lord Krishna' },
  { text: 'राधे राधे 🌸', meaning: 'Glory to Radha Rani' },
]

const FUN_FACTS = [
  'Mathura has over 1,000 temples within its city limits.',
  'Vrindavan\'s Banke Bihari temple closes the curtain every few minutes to protect devotees from the deity\'s intense gaze.',
  'The Govardhan Parikrama is 21 km — Lord Krishna lifted this entire hill on his finger.',
  'Prem Mandir in Vrindavan used 1,000 artisans and took 11 years to build.',
  'Barsana\'s Lathmar Holi is played weeks before the main Holi festival.',
  'Krishna Janmabhoomi marks the exact prison cell where Lord Krishna was born.',
  'The Yamuna Aarti at Vishram Ghat has happened every evening for centuries.',
]

export default function NotFoundPage() {
  const pathname          = usePathname()
  const router            = useRouter()
  const [search, setSearch] = useState('')
  const [quote,  setQuote]  = useState(QUOTES[0])
  const [fact,   setFact]   = useState(FUN_FACTS[0])

  const suggestions = getSuggestions(pathname ?? '')

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])
    setFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)])
  }, [])

  function handleSearch(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!search.trim()) return
    const q = search.trim().toLowerCase()
    const match = ALL_ROUTES.find((r) =>
      r.keywords.some((kw) => kw.includes(q) || q.includes(kw)) ||
      r.label.toLowerCase().includes(q),
    )
    router.push(match?.path ?? `/blog`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full mx-auto">

        {/* 404 hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8">
          {/* Animated om symbol */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="text-8xl mb-4 select-none">
            🙏
          </motion.div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #e5e7eb)' }} />
            <span className="text-6xl font-black text-gray-100">404</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, #e5e7eb)' }} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2"
            style={{ fontFamily: 'var(--font-serif)' }}>
            This Path Leads to the Divine
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist — but many sacred paths await you.
          </p>

          {/* Invalid path shown */}
          {pathname && pathname !== '/' && (
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg"
              style={{ background: '#fff1f2' }}>
              <span className="text-xs text-red-400 font-mono">{pathname}</span>
              <span className="text-xs text-red-400">— not found</span>
            </div>
          )}
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card rounded-2xl p-5 mb-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            🔍 Search for what you need
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="packages, temples, hotels, booking..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 py-2.5 text-sm w-full"
              />
            </div>
            <button type="submit"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
              style={{ background: '#ff7d0f' }}>
              Go
            </button>
          </form>
        </motion.div>

        {/* Smart suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card rounded-2xl p-5 mb-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            🗺️ Were you looking for?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((route) => (
              <Link key={route.path} href={route.path}
                className="flex items-center gap-2.5 p-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700">
                <span style={{ color: '#ff7d0f' }}>{route.icon}</span>
                {route.label}
                <ArrowRight size={12} className="ml-auto text-gray-300" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Quick nav */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card rounded-2xl p-5 mb-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            ⚡ Popular Destinations
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/',             label: '🏠 Home'         },
              { href: '/packages',     label: '📦 Packages'     },
              { href: '/places',       label: '🛕 Sacred Places' },
              { href: '/booking',      label: '📅 Book a Tour'  },
              { href: '/hotels',       label: '🏨 Hotels'       },
              { href: '/restaurants',  label: '🍽️ Restaurants'  },
              { href: '/contact',      label: '📞 Contact'      },
              { href: '/faq',          label: '❓ FAQ'           },
            ].map((link) => (
              <Link key={link.href} href={link.href}
                className="text-xs font-semibold px-3 py-2 rounded-full transition-all hover:scale-105"
                style={{ background: '#fff8ed', color: '#c74a06', border: '1px solid #ffdba8' }}>
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Fun fact card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl p-5 mb-4"
          style={{ background: 'linear-gradient(135deg, #0f0e2a, #1e1b4b)' }}>
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-2">
            🙏 Did you know?
          </p>
          <p className="text-sm text-gray-200 leading-relaxed mb-4">{fact}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-hindi)' }}>
                {quote.text}
              </p>
              <p className="text-xs text-indigo-300 mt-0.5">{quote.meaning}</p>
            </div>
            <Link href="/blog"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full shrink-0 ml-3"
              style={{ background: 'rgba(255,125,15,0.2)', color: '#ff7d0f' }}>
              Read More <ArrowRight size={11} />
            </Link>
          </div>
        </motion.div>

        {/* WhatsApp CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3">
          <Link href="/"
            className="flex items-center justify-center gap-2 flex-1 py-3.5 rounded-2xl font-semibold text-sm"
            style={{ background: '#ff7d0f', color: '#fff' }}>
            <Home size={16} />Back to Home
          </Link>
          <a href="https://wa.me/919999999999?text=Namaste! I need help navigating the website. 🙏"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 flex-1 py-3.5 rounded-2xl font-semibold text-sm"
            style={{ background: '#dcfce7', color: '#16a34a' }}>
            <MessageCircle size={16} />Need Help? WhatsApp
          </a>
        </motion.div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Jai Shri Krishna 🙏 · <Link href="/" className="hover:underline">Mathura Vrindavan Dham Yatra</Link>
        </p>
      </div>
    </div>
  )
}