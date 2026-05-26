import type { Metadata } from 'next'
import { notFound }        from 'next/navigation'
import { Link }            from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { Clock, Tag, ArrowLeft, Lightbulb, Info } from 'lucide-react'
import { BLOG_POSTS, getPostBySlug, getLocalizedPost, type ContentBlock } from '@/lib/blogContent'
import { routing }         from '@/i18n/routing'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    BLOG_POSTS.map((post) => ({ locale, slug: post.slug })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  const lp = getLocalizedPost(post, locale)
  return {
    title:       `${lp.title} — Mathura Vrindavan Dham Yatra`,
    description: lp.excerpt,
  }
}

function renderBlock(block: ContentBlock, t: (key: string) => string, index: number) {
  switch (block.type) {
    case 'h2':
      return (
        <h2 key={index} id={`section-${index}`}
          className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-3"
          style={{ fontFamily: 'var(--font-serif)' }}>
          {block.text}
        </h2>
      )
    case 'h3':
      return (
        <h3 key={index} className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-5 mb-2">
          {block.text}
        </h3>
      )
    case 'p':
      return (
        <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-sm">
          {block.text}
        </p>
      )
    case 'ul':
      return (
        <ul key={index} className="space-y-2 mb-4 ml-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-saffron-500 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol key={index} className="space-y-2 mb-4 ml-1 list-decimal list-inside">
          {block.items.map((item, i) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {item}
            </li>
          ))}
        </ol>
      )
    case 'tip':
      return (
        <div key={index}
          className="flex gap-3 rounded-xl p-4 mb-4"
          style={{ background: 'var(--surface-saffron)', border: '1px solid var(--surface-saffron-border)' }}>
          <Lightbulb size={16} className="shrink-0 mt-0.5" style={{ color: '#ff7d0f' }} />
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: '#ff7d0f' }}>{t('tipLabel')}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{block.text}</p>
          </div>
        </div>
      )
    case 'info':
      return (
        <div key={index}
          className="flex gap-3 rounded-xl p-4 mb-4"
          style={{ background: 'var(--surface-blue)', border: '1px solid var(--surface-blue-border)' }}>
          <Info size={16} className="shrink-0 mt-0.5 text-blue-500" />
          <div>
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">{t('infoLabel')}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{block.text}</p>
          </div>
        </div>
      )
    case 'table':
      return (
        <div key={index} className="overflow-x-auto mb-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
                {block.headers.map((h, i) => (
                  <th key={i} className="px-3 py-2.5 text-left text-xs font-semibold text-white whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2.5 text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    default:
      return null
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params
  const raw = getPostBySlug(slug)
  if (!raw) notFound()

  const post = getLocalizedPost(raw, locale)
  const t    = await getTranslations({ locale, namespace: 'BlogPost' })

  const h2Headings = post.content
    .filter((b): b is Extract<ContentBlock, { type: 'h2' }> => b.type === 'h2')
    .map((b) => ({ text: b.text, id: `section-${post.content.indexOf(b)}` }))

  const relatedPosts = BLOG_POSTS
    .filter((p) => p.slug !== slug)
    .slice(0, 3)
    .map((p) => getLocalizedPost(p, locale))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Hero */}
      <div
        className="py-14 md:py-18 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1a0a00 100%)' }}
      >
        <div className="container-custom relative z-10">
          <Link href="/blog"
            className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-5 hover:text-amber-300 transition-colors">
            <ArrowLeft size={13} />
            {t('backToBlog')}
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fcd34d' }}>
              <Tag size={9} className="inline mr-1" />{post.category}
            </span>
            <span className="text-amber-300/70 text-xs flex items-center gap-1">
              <Clock size={10} />{post.readTime}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 max-w-2xl"
            style={{ fontFamily: 'var(--font-serif)' }}>
            <span className="mr-3">{raw.emoji}</span>{post.title}
          </h1>
          <p className="text-gray-300 max-w-xl text-sm leading-relaxed">{post.excerpt}</p>
          <p className="text-gray-400 text-xs mt-3">{t('published')}: {raw.date}</p>
        </div>
      </div>

      <div className="container-custom py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Main content */}
          <article className="flex-1 min-w-0">
            <div className="card rounded-2xl p-6 md:p-8">
              {post.content.map((block, i) => renderBlock(block, t, i))}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-5 lg:sticky lg:top-24">

            {/* Table of contents */}
            {h2Headings.length > 0 && (
              <div className="card rounded-2xl p-5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">
                  {t('tableOfContents')}
                </h4>
                <ul className="space-y-2">
                  {h2Headings.map((h, i) => (
                    <li key={i}>
                      <a href={`#${h.id}`}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors leading-relaxed block">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <div className="rounded-2xl p-5 text-center"
              style={{ background: 'var(--surface-saffron)', border: '1px solid var(--surface-saffron-border)' }}>
              <p className="text-2xl mb-2">🙏</p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                {locale === 'hi' ? 'यात्रा प्लान करें' : 'Plan Your Trip'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {locale === 'hi' ? 'विशेषज्ञ गाइड के साथ' : 'With an expert local guide'}
              </p>
              <Link href="/booking"
                className="block text-xs font-semibold py-2 px-4 rounded-full text-white transition-colors"
                style={{ background: '#ff7d0f' }}>
                {locale === 'hi' ? 'अभी बुक करें' : 'Book Now'}
              </Link>
            </div>
          </aside>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-5"
              style={{ fontFamily: 'var(--font-serif)' }}>
              {t('relatedPosts')}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedPosts.map((rp) => {
                const rawRp = BLOG_POSTS.find((p) => p.slug === rp.slug)!
                return (
                  <div key={rp.slug} className="card card-hover rounded-2xl overflow-hidden flex flex-col">
                    <div className="h-28 flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
                      <span className="text-5xl">{rawRp.emoji}</span>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <span className="text-xs font-semibold mb-2" style={{ color: '#4338ca' }}>
                        {rp.category}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug mb-3 flex-1">
                        {rp.title}
                      </h3>
                      <Link href={`/blog/${rp.slug}`}
                        className="text-xs font-semibold" style={{ color: '#ff7d0f' }}>
                        {t('readMore')}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
