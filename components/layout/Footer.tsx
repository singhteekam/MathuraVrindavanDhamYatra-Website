import Link         from 'next/link'
import VisitorBadge from '@/components/shared/VisitorBadge'
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'
import { siteConfig } from '@/config/site'
import Image from 'next/image'

const footerPackages = [
  { label: 'Same Day Mathura Vrindavan', href: '/packages/same-day-mathura-vrindavan' },
  { label: '2 Days Mathura Vrindavan',   href: '/packages/2-days-mathura-vrindavan' },
  { label: '3 Days Govardhan Package',   href: '/packages/3-days-mathura-vrindavan-govardhan' },
  { label: '4 Days Complete Braj Tour',  href: '/packages/4-days-mathura-vrindavan' },
  { label: '7 Days 84 Kos Yatra',        href: '/packages/7-days-braj-84-kos-yatra' },
  { label: 'All Packages',              href: '/packages' },
]

const footerPlaces = [
  { label: 'Banke Bihari Temple',   href: '/places/banke-bihari-temple' },
  { label: 'Prem Mandir',           href: '/places/prem-mandir' },
  { label: 'Krishna Janmabhoomi',   href: '/places/krishna-janmabhoomi' },
  { label: 'Vishram Ghat',          href: '/places/vishram-ghat' },
  { label: 'ISKCON Vrindavan',      href: '/places/iskcon-vrindavan' },
  { label: 'All Places',            href: '/places' },
]

const quickLinks = [
  { label: 'About Us',         href: '/about' },
  { label: 'Hotels',           href: '/hotels' },
  { label: 'Restaurants',      href: '/restaurants' },
  { label: 'Blog',             href: '/blog' },
  { label: 'FAQ',              href: '/faq' },
  { label: 'Contact Us',       href: '/contact' },
  { label: 'Privacy Policy',   href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
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

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">

      {/* CTA band */}
      <div className="bg-gradient-to-r from-saffron-700 to-saffron-500 py-10">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white font-bold text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>
              Ready for Your Spiritual Journey?
            </h3>
            <p className="text-saffron-100 mt-1 text-sm">
              Book your Mathura Vrindavan tour starting from ₹2,000
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/booking"
              className="bg-white text-saffron-600 font-semibold px-6 py-3 rounded-full text-sm hover:bg-saffron-50 transition-colors">
              Book Now
            </Link>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-green-600 transition-colors"
            >
              WhatsApp Us
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
              {/* <div className="w-10 h-10 bg-saffron-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-hindi)' }}>ॐ</span>
              </div> */}

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
              Your trusted travel partner for spiritual journeys to the divine land of Lord Krishna.
              Serving devotees with love since 2018.
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
                  className={cn('w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center transition-colors', hover)}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Packages */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Tour Packages</h4>
            <FooterLinkList items={footerPackages} />
          </div>

          {/* Places */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Popular Places</h4>
            <FooterLinkList items={footerPlaces} />
          </div>

          {/* Quick links + newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Quick Links</h4>
            <FooterLinkList items={quickLinks} />

            <div className="mt-7">
              <p className="text-white text-sm font-semibold mb-3">Get Travel Updates</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-saffron-500 transition-colors"
                />
                <button className="bg-saffron-500 hover:bg-saffron-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0">
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-5">
        <div className="container-custom flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <div className="flex flex-wrap items-center gap-3">
            <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
            <VisitorBadge />
          </div>
          <p>Jai Shri Krishna 🙏 — Built with love for devotees</p>
          <div className="flex gap-4">
            <Link href="/privacy"   className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="/terms"     className="hover:text-gray-300 transition-colors">Terms</Link>
            <span className="text-gray-600">·</span>
            <Link href="/developer" className="hover:text-indigo-400 transition-colors text-gray-500">
              Developer
            </Link>
            <Link href="/sitemap.xml" className="hover:text-gray-300 transition-colors">Sitemap</Link>
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