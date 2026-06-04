import type { Metadata } from 'next'
import AdminSidebarWrapper from './AdminSidebarWrapper'
import PortalHeader        from '@/components/admin/PortalHeader'
import PortalFooter        from '@/components/admin/PortalFooter'

export const metadata: Metadata = {
  title: {
    default: 'Admin — Mathura Vrindavan Dham Yatra',
    template: '%s | Admin',
  },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <AdminSidebarWrapper />
      <div className="flex-1 flex flex-col min-w-0">
        <PortalHeader role="admin" />
        {children}
        <PortalFooter role="admin" />
      </div>
    </div>
  )
}