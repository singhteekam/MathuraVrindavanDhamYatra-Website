'use client'

import NextLink from 'next/link'
import { ExternalLink, Globe } from 'lucide-react'

const PUBLIC_LINKS = [
  { label: 'Home',         href: '/en'            },
  { label: 'Packages',    href: '/en/packages'    },
  { label: 'Places',      href: '/en/places'      },
  { label: 'Hotels',      href: '/en/hotels'      },
  { label: 'Restaurants', href: '/en/restaurants' },
  { label: 'Blog',        href: '/en/blog'        },
]

export default function PortalHeader({ role }: { role: 'admin' | 'superadmin' }) {
  const badge = role === 'superadmin'
    ? { label: 'Superadmin Panel', bg: '#1e1b4b', color: '#a5b4fc' }
    : { label: 'Admin Panel',      bg: '#7c2c00', color: '#fdba74' }

  return (
    <header
      className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs border-b shrink-0"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-muted)' }}
    >
      {/* Left: role badge + site name */}
      <div className="flex items-center gap-2 sm:gap-3">
        <span
          className="px-2 py-0.5 rounded font-semibold text-[10px] uppercase tracking-wider shrink-0"
          style={{ background: badge.bg, color: badge.color }}
        >
          {badge.label}
        </span>
        <span className="hidden sm:inline text-gray-300 dark:text-gray-600">|</span>
        <NextLink
          href="/en"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1 font-semibold text-saffron-600 dark:text-saffron-400 hover:text-saffron-700 dark:hover:text-saffron-300 transition-colors"
        >
          <Globe size={11} />
          Mathura Vrindavan Dham Yatra
          <ExternalLink size={9} className="opacity-60" />
        </NextLink>
      </div>

      {/* Right: quick-access public page links */}
      <nav className="flex items-center gap-0.5 flex-wrap">
        <span className="text-gray-400 dark:text-gray-500 text-[10px] mr-1 hidden sm:inline">View site →</span>
        {PUBLIC_LINKS.map((link) => (
          <NextLink
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 rounded text-gray-500 dark:text-gray-400 hover:text-saffron-600 dark:hover:text-saffron-400 hover:bg-saffron-50 dark:hover:bg-saffron-900/20 transition-colors font-medium text-[11px] sm:text-xs"
          >
            {link.label}
          </NextLink>
        ))}
      </nav>
    </header>
  )
}
