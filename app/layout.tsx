import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import AuthProvider        from '@/components/AuthProvider'
import InactivityWatcher   from '@/components/shared/InactivityWatcher'
import ThemeProvider       from '@/components/shared/ThemeProvider'
import VisitorTracker      from '@/components/shared/VisitorTracker'
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  metadataBase: new URL('https://mathuravrindavandhamyatra.com'),

  /* ── Titles ── */
  title: {
    default:  'Mathura Vrindavan Dham Yatra | Best Tour Packages & Taxi Service',
    template: '%s | Mathura Vrindavan Dham Yatra',
  },

  /* ── Description ── */
  description:
    'Experience the divine land of Lord Krishna with Mathura Vrindavan Dham Yatra. ' +
    'Best AC car taxi service, temple tour packages from ₹2000, hotel assistance, local guide. ' +
    'Book online or WhatsApp for Mathura, Vrindavan, Govardhan, Barsana & Gokul pilgrimage tours.',

  /* ── Keywords (long-tail + local SEO) ── */
  keywords: [
    'Mathura Vrindavan tour packages',
    'Mathura Vrindavan Dham Yatra',
    'Vrindavan taxi service',
    'Mathura tour package from Delhi',
    'Mathura Vrindavan same day tour',
    'Krishna temple tour Mathura',
    'Vrindavan temple darshan package',
    'Mathura Vrindavan trip planner',
    'best taxi service Mathura Vrindavan',
    'AC car hire Mathura',
    'Govardhan parikrama tour',
    'Barsana Holi tour package',
    'Gokul Nandgaon tour',
    '84 kos yatra Mathura Vrindavan',
    'Banke Bihari temple Vrindavan',
    'ISKCON Vrindavan tour',
    'Mathura Janmabhoomi darshan',
    'Yamuna aarti Mathura',
    'pilgrimage tour Braj',
    'Braj Mandal yatra package',
    'Mathura Vrindavan honeymoon tour',
    'family tour package Mathura Vrindavan',
    'senior citizen pilgrimage tour Mathura',
    'budget tour Mathura Vrindavan',
    'Mathura Vrindavan hotel booking assistance',
    'local guide Mathura Vrindavan',
    'airport transfer Mathura Vrindavan',
    'Mathura darshan taxi',
    'Vrindavan parikrama tour',
    'religious tourism Uttar Pradesh',
  ],

  /* ── Authors & creator ── */
  authors:  [{ name: 'Mathura Vrindavan Dham Yatra', url: 'https://mathuravrindavandhamyatra.com' }],
  creator:  'Mathura Vrindavan Dham Yatra',
  publisher:'Mathura Vrindavan Dham Yatra',

  /* ── Canonical ── */
  alternates: {
    canonical: 'https://mathuravrindavandhamyatra.com',
    languages: {
      'en-IN': 'https://mathuravrindavandhamyatra.com/en',
      'hi-IN': 'https://mathuravrindavandhamyatra.com/hi',
    },
  },

  /* ── Open Graph ── */
  openGraph: {
    type:      'website',
    locale:    'en_IN',
    url:       'https://mathuravrindavandhamyatra.com',
    siteName:  'Mathura Vrindavan Dham Yatra',
    title:     'Mathura Vrindavan Dham Yatra | Best Tour Packages & Taxi Service',
    description:
      'Best AC car service for Mathura Vrindavan pilgrimage. Tour packages from ₹2000, ' +
      'local expert guides, hotel assistance. Book now for divine Braj yatra experience.',
    images: [
      {
        url:    '/images/og-image.jpg',
        width:  1200,
        height: 630,
        alt:    'Mathura Vrindavan Dham Yatra — Krishna Temple Tour Packages',
      },
    ],
  },

  /* ── Twitter / X Card ── */
  twitter: {
    card:        'summary_large_image',
    title:       'Mathura Vrindavan Dham Yatra | Best Tour Packages & Taxi Service',
    description: 'Best AC taxi & tour packages for Mathura Vrindavan pilgrimage. Book online from ₹2000.',
    images:      ['/images/og-image.jpg'],
    creator:     '@mathuravrindavandhamyatra',
  },

  /* ── App metadata ── */
  applicationName: 'Mathura Vrindavan Dham Yatra',
  category:        'Travel & Tourism',

  /* ── Robots ── */
  robots: {
    index:                    true,
    follow:                   true,
    nocache:                  false,
    googleBot: {
      index:                  true,
      follow:                 true,
      'max-video-preview':    -1,
      'max-image-preview':    'large',
      'max-snippet':          -1,
    },
  },

  /* ── Verification (add actual codes when available) ── */
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? '',
  },

  /* ── Icons ── */
  icons: {
    icon:        '/favicon.ico',
    shortcut:    '/favicon.ico',
    apple:       '/apple-touch-icon.png',
  },
}

const JSON_LD_ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'Mathura Vrindavan Dham Yatra',
  url: 'https://mathuravrindavandhamyatra.com',
  logo: 'https://mathuravrindavandhamyatra.com/logo/logo128x128.png',
  image: 'https://mathuravrindavandhamyatra.com/images/og-image.jpg',
  description:
    'Best AC car taxi service and pilgrimage tour packages for Mathura and Vrindavan. ' +
    'Serving devotees with expert local guides, hotel assistance and transparent pricing since 2018.',
  telephone: '+91-85348-90870',
  email: 'info@mathuravrindavandhamyatra.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Mathura, Uttar Pradesh',
    addressLocality: 'Mathura',
    addressRegion: 'Uttar Pradesh',
    postalCode: '281001',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '27.4924',
    longitude: '77.6737',
  },
  openingHours: 'Mo-Su 06:00-22:00',
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, UPI, Online Transfer',
  areaServed: ['Mathura', 'Vrindavan', 'Govardhan', 'Barsana', 'Gokul', 'Nandgaon', 'Agra'],
  sameAs: [
    'https://facebook.com/mathuravrindavandhamyatra',
    'https://instagram.com/mathuravrindavandhamyatra',
    'https://youtube.com/@mathuravrindavandhamyatra',
  ],
}

const JSON_LD_WEBSITE = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Mathura Vrindavan Dham Yatra',
  url: 'https://mathuravrindavandhamyatra.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://mathuravrindavandhamyatra.com/en/packages?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_ORGANIZATION) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_WEBSITE) }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}

            {/* Visitor tracking — anonymous, privacy-safe, skips admin pages */}
            <VisitorTracker />
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