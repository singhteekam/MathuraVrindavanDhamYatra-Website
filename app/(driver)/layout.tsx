import type { Metadata } from 'next'
import DriverSidebarWrapper from './DriverSidebarWrapper'

export const metadata: Metadata = {
  title: {
    default: 'Driver Portal — MVTravel',
    template: '%s | Driver Portal',
  },
  robots: { index: false, follow: false },
}

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <DriverSidebarWrapper />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}