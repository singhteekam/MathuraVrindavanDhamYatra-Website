import type { Metadata } from 'next'
import { Link }          from '@/i18n/navigation'
import { Clock, Tag }    from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { BLOG_POSTS, getLocalizedPost } from '@/lib/blogContent'

export const metadata: Metadata = {
  title: 'Travel Blog — Mathura Vrindavan Dham Yatra',
  description:
    'Travel guides, temple timings, festival dates, and tips for visiting Mathura and Vrindavan. Everything you need to plan your pilgrimage.',
}

type Props = { params: Promise<{ locale: string }> }

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  const t          = await getTranslations({ locale, namespace: 'BlogPage' })

  const posts    = BLOG_POSTS.map((p) => ({ ...getLocalizedPost(p, locale), date: p.date, emoji: p.emoji, featured: p.featured }))
  const featured = posts.filter((p) => p.featured)
  const regular  = posts.filter((p) => !p.featured)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Hero */}
      <div
        className="py-16 md:py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1a0a00 100%)' }}
      >
        <div className="container-custom relative z-10 text-center">
          <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">
            ✦ {t('heroSubtitle')} ✦
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}>
            {t('heroTitle')}
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto text-base">
            {t('heroDescription')}
          </p>
        </div>
      </div>

      <div className="container-custom py-10">

        {/* Featured posts */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-5"
            style={{ fontFamily: 'var(--font-serif)' }}>
            {t('featuredArticles')}
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
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-2 leading-snug">{post.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4 flex-1">{post.excerpt}</p>
                  <div className="flex items-center justify-between pt-4"
                    style={{ borderTop: '1px solid #f3f4f6' }}>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={10} />{post.date}
                    </span>
                    <Link href={`/blog/${post.slug}`}
                      className="text-xs font-semibold"
                      style={{ color: '#ff7d0f' }}>
                      {t('readMore')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All posts */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-5"
            style={{ fontFamily: 'var(--font-serif)' }}>
            {t('allArticles')}
          </h2>
          <div className="space-y-4">
            {regular.map((post) => (
              <div key={post.slug}
                className="card card-hover rounded-2xl p-5 flex items-start gap-5"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 text-3xl"
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
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1 leading-snug">{post.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{post.excerpt}</p>
                </div>
                <Link href={`/blog/${post.slug}`}
                  className="text-xs font-semibold whitespace-nowrap shrink-0 self-center"
                  style={{ color: '#ff7d0f' }}>
                  {t('read')}
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
            {t('ctaTitle')}
          </h3>
          <p className="text-gray-500 text-sm mb-5 max-w-md mx-auto">
            {t('ctaDescription')}
          </p>
          <Link href="/contact" className="btn-primary inline-flex">
            {t('ctaButton')}
          </Link>
        </div>
      </div>
    </div>
  )
}