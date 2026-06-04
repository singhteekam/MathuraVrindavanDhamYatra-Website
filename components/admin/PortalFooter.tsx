import NextLink from 'next/link'
import { ExternalLink } from 'lucide-react'

const QUICK_LINKS = [
  { label: 'Packages',    href: '/en/packages'    },
  { label: 'Places',      href: '/en/places'      },
  { label: 'Hotels',      href: '/en/hotels'      },
  { label: 'Restaurants', href: '/en/restaurants' },
  { label: 'Blog',        href: '/en/blog'        },
  { label: 'Contact',     href: '/en/contact'     },
]

export default function PortalFooter({ role }: { role: 'admin' | 'superadmin' }) {
  const year = new Date().getFullYear()

  return (
    <footer
      className="shrink-0 px-4 py-3 border-t text-xs flex flex-wrap items-center justify-between gap-3"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-muted)' }}
    >
      {/* Left: copyright */}
      <p className="text-gray-400 dark:text-gray-500">
        © {year} Mathura Vrindavan Dham Yatra · {role === 'superadmin' ? 'Superadmin' : 'Admin'} Panel
      </p>

      {/* Right: public site links */}
      <nav className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-gray-400 dark:text-gray-500 text-[10px]">Public pages:</span>
        {QUICK_LINKS.map((link) => (
          <NextLink
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-0.5 text-gray-500 dark:text-gray-400 hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors font-medium"
          >
            {link.label}
            <ExternalLink size={8} className="opacity-50" />
          </NextLink>
        ))}
      </nav>
    </footer>
  )
}
