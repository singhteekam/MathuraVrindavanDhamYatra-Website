import type { Metadata } from 'next'
import SuperadminSidebarWrapper from './SuperadminSidebarWrapper'
import PortalHeader from '@/components/admin/PortalHeader'

export const metadata: Metadata = {
  title:  { default: 'Superadmin', template: '%s | SA — MVTravel' },
  robots: { index: false, follow: false },
}

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <SuperadminSidebarWrapper />
      <main className="flex-1 overflow-hidden flex flex-col">
        <PortalHeader role="superadmin" />
        {children}
      </main>
    </div>
  )
}