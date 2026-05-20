import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import AuthProvider        from '@/components/AuthProvider'
import InactivityWatcher   from '@/components/shared/InactivityWatcher'
import ThemeProvider       from '@/components/shared/ThemeProvider'
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  metadataBase: new URL('https://mathuravrindavandhamyatra.com'),
  title: {
    default: 'Mathura Vrindavan Dham Yatra | Best Tour Packages & Taxi Service',
    template: '%s | Mathura Vrindavan Dham Yatra',
  },
  description:
    'Experience the divine land of Lord Krishna with Mathura Vrindavan Dham Yatra. Best tour packages, taxi service, hotel assistance from ₹2000.',
  keywords: [
    'Mathura Vrindavan Dham Yatra tour packages',
    'Vrindavan taxi service',
    'Mathura tour',
    'Krishna temple tour',
  ],
  authors: [{ name: 'Mathura Vrindavan Dham Yatra' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://mathuravrindavandhamyatra.com',
    siteName: 'Mathura Vrindavan Dham Yatra',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}

            {/* Auto-logout after 30 min inactivity on protected routes */}
            <InactivityWatcher />
            <Analytics />
            <SpeedInsights />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1a1a1a',
                  color: '#fff',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: { primary: '#ff7d0f', secondary: '#fff' },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}