import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ReactNode } from 'react'

interface Crumb {
  label: string
  href?: string
}

interface AdminPageHeaderProps {
  title:   string
  crumbs?: Crumb[]
  action?: ReactNode
}

export default function AdminPageHeader({ title, crumbs, action }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        {crumbs && crumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <Link href="/admin" className="hover:text-saffron-500 transition-colors">Admin</Link>
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight size={11} />
                {c.href ? (
                  <Link href={c.href} className="hover:text-saffron-500 transition-colors">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}