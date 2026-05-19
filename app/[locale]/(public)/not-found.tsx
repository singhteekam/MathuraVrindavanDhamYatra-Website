import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <p className="text-8xl mb-6">🙏</p>
        <h1
          className="text-4xl font-bold text-gray-900 mb-3"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Page Not Found
        </h1>
        <p className="text-gray-500 mb-2 text-base">
          This page has gone on a Vrindavan Parikrama and hasn&apos;t returned yet.
        </p>
        <p className="text-saffron-500 font-semibold text-sm mb-8">
          Jai Shri Krishna 🌸
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
          <Link href="/packages" className="btn-secondary">
            View Packages
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-3 justify-center text-sm">
          {[
            { label: 'Places',      href: '/places' },
            { label: 'Hotels',      href: '/hotels' },
            { label: 'Contact',     href: '/contact' },
            { label: 'Book a Tour', href: '/booking' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-400 hover:text-saffron-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}