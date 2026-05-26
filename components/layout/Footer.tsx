import { Link }     from '@/i18n/navigation'
import VisitorBadge from '@/components/shared/VisitorBadge'
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'
import { siteConfig } from '@/config/site'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

const footerPackagesData = [
  { key: 'sameDay',   href: '/packages/same-day-mathura-vrindavan' },
  { key: 'twoDays',   href: '/packages/2-days-mathura-vrindavan' },
  { key: 'threeDays', href: '/packages/3-days-mathura-vrindavan-govardhan' },
  { key: 'fourDays',  href: '/packages/4-days-mathura-vrindavan' },
  { key: 'sevenDays', href: '/packages/7-days-braj-84-kos-yatra' },
  { key: 'all',       href: '/packages' },
]

const footerPlacesData = [
  { key: 'bankeBihari', href: '/places/banke-bihari-temple' },
  { key: 'premMandir',  href: '/places/prem-mandir' },
  { key: 'janmabhoomi', href: '/places/krishna-janmabhoomi' },
  { key: 'vishramGhat', href: '/places/vishram-ghat' },
  { key: 'iskcon',      href: '/places/iskcon-vrindavan' },
  { key: 'all',         href: '/places' },
]

const quickLinksData = [
  { key: 'aboutUs',      href: '/about' },
  { key: 'hotels',       href: '/hotels' },
  { key: 'restaurants',  href: '/restaurants' },
  { key: 'blog',         href: '/blog' },
  { key: 'faq',          href: '/faq' },
  { key: 'contactUs',    href: '/contact' },
  { key: 'privacy',      href: '/privacy' },
  { key: 'terms',        href: '/terms' },
]

function FooterLinkList({ items }: { items: { label: string; href: string }[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="text-sm text-gray-400 hover:text-saffron-400 transition-colors flex items-center gap-2 group"
          >
            <span className="w-1 h-1 rounded-full bg-saffron-700 group-hover:bg-saffron-400 transition-colors flex-shrink-0" />
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default async function Footer({ locale }: { locale: string }) {
  const t  = await getTranslations({ locale, namespace: 'Footer' })
  const tc = await getTranslations({ locale, namespace: 'Common' })

  const footerPackages = footerPackagesData.map((item) => ({
    label: t(`packages.${item.key}`),
    href:  item.href,
  }))
  const footerPlaces = footerPlacesData.map((item) => ({
    label: t(`places.${item.key}`),
    href:  item.href,
  }))
  const quickLinks = quickLinksData.map((item) => ({
    label: t(`quick.${item.key}`),
    href:  item.href,
  }))

  return (
    <footer className="text-gray-300" style={{ background: 'var(--bg-footer)' }}>

      {/* CTA band */}
      <div className="py-10" style={{ background: 'var(--bg-footer-cta)' }}>
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white font-bold text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>
              {t('ctaTitle')}
            </h3>
            <p className="text-saffron-100 mt-1 text-sm">
              {t('ctaSubtitle')}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/booking"
              className="bg-white text-saffron-600 font-semibold px-6 py-3 rounded-full text-sm hover:bg-saffron-50 transition-colors">
              {tc('bookNow')}
            </Link>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-green-600 transition-colors"
            >
              {t('whatsAppUs')}
            </a>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand col */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-48 h-18 md:w-24 md:h-12 flex-shrink-0 -ml-5">
                <Image
                  src="/logo/logo128x128.png"
                  alt="Mathura Vrindavan Dham Yatra Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="leading-tight">
                <p className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-serif)' }}>
                  Mathura Vrindavan
                </p>
                <p className="text-saffron-400 text-xs font-semibold tracking-widest uppercase">Dham Yatra</p>
              </div>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              {t('tagline')}
            </p>

            <div className="space-y-3 mb-6">
              <a href={`tel:${siteConfig.phone}`}
                className="flex items-center gap-2.5 text-sm hover:text-saffron-400 transition-colors">
                <Phone size={14} className="text-saffron-500 flex-shrink-0" />
                {siteConfig.phone}
              </a>
              <a href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-2.5 text-sm hover:text-saffron-400 transition-colors">
                <Mail size={14} className="text-saffron-500 flex-shrink-0" />
                {siteConfig.email}
              </a>
              <p className="flex items-start gap-2.5 text-sm">
                <MapPin size={14} className="text-saffron-500 flex-shrink-0 mt-0.5" />
                {siteConfig.address}
              </p>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { href: siteConfig.social.facebook,  Icon: Facebook,  hover: 'hover:bg-blue-600' },
                { href: siteConfig.social.instagram, Icon: Instagram, hover: 'hover:bg-pink-500' },
                { href: siteConfig.social.youtube,   Icon: Youtube,   hover: 'hover:bg-red-600'  },
              ].map(({ href, Icon, hover }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ background: 'var(--bg-footer-surface)' }}
                  className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-colors', hover)}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Packages */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">{t('tourPackages')}</h4>
            <FooterLinkList items={footerPackages} />
          </div>

          {/* Places */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">{t('popularPlaces')}</h4>
            <FooterLinkList items={footerPlaces} />
          </div>

          {/* Quick links + newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">{t('quickLinks')}</h4>
            <FooterLinkList items={quickLinks} />

            <div className="mt-7">
              <p className="text-white text-sm font-semibold mb-3">{t('getTravelUpdates')}</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={t('yourEmail')}
                  style={{ background: 'var(--bg-footer-surface)', border: '1px solid var(--bg-footer-border)' }}
                  className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-saffron-500 transition-colors"
                />
                <button className="bg-saffron-500 hover:bg-saffron-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0">
                  {t('go')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="py-5" style={{ borderTop: '1px solid var(--bg-footer-border)' }}>
        <div className="container-custom flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-400">
          <div className="flex flex-wrap items-center gap-3">
            <p>© {new Date().getFullYear()} {siteConfig.name}. {t('copyright')}</p>
            <VisitorBadge />
          </div>
          <p>{t('builtWithLove')}</p>
          <div className="flex gap-4">
            <Link href="/privacy"   className="hover:text-gray-300 transition-colors">{t('privacy')}</Link>
            <Link href="/terms"     className="hover:text-gray-300 transition-colors">{t('terms')}</Link>
            <span className="text-gray-400">·</span>
            <Link href="/developer" className="hover:text-indigo-400 transition-colors text-gray-400">
              {t('developer')}
            </Link>
            <a href="/sitemap.xml" className="hover:text-gray-300 transition-colors">{t('sitemap')}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// local cn helper since this is a server component
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
