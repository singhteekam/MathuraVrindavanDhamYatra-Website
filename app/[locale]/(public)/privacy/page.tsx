import type { Metadata } from 'next'
import Link              from 'next/link'
import { Shield }        from 'lucide-react'

export const metadata: Metadata = {
  title:       'Privacy Policy — Mathura Vrindavan Dham Yatra',
  description: 'Learn how Mathura Vrindavan Dham Yatra collects, uses, and protects your personal information.',
}

const EFFECTIVE_DATE = 'May 1, 2026'
const SITE_NAME      = 'Mathura Vrindavan Dham Yatra'
const SITE_URL       = 'mathuravrindavandhamyatra.com'
const CONTACT_EMAIL  = 'info@mathuravrindavandhamyatra.com'
const CONTACT_PHONE  = '+91 85348 90870'

const SECTIONS = [
  {
    title: '1. Introduction',
    content: `At ${SITE_NAME}, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, store, disclose, and protect your data when you visit ${SITE_URL} or use our services. By using our website or booking our services, you consent to the practices described in this policy.`,
  },
  {
    title: '2. Information We Collect',
    content: 'We collect the following types of information:',
    subsections: [
      {
        subtitle: 'a) Information You Provide Directly',
        list: [
          'Full name, email address, and phone number (required for booking)',
          'Pickup location, travel date, number of passengers, and special requests',
          'Account credentials (email and hashed password) if you register',
          'Payment information — processed securely via Razorpay (we do not store card details)',
          'Reviews and ratings you submit after a completed trip',
          'Messages submitted via the contact form',
        ],
      },
      {
        subtitle: 'b) Information Collected Automatically',
        list: [
          'Device information (browser type, operating system)',
          'IP address and approximate location',
          'Pages visited, time spent, and navigation patterns (via analytics)',
          'Cookies and similar tracking technologies',
        ],
      },
    ],
  },
  {
    title: '3. How We Use Your Information',
    content: 'We use the information we collect for the following purposes:',
    list: [
      'To process and confirm your tour bookings',
      'To assign a driver and coordinate your trip logistics',
      'To send booking confirmations, updates, and reminders via WhatsApp and email',
      'To respond to your enquiries and provide customer support',
      'To improve our website, services, and user experience',
      'To display your reviews and ratings on the website (only after approval)',
      'To send occasional promotional communications (with your consent — you can opt out at any time)',
      'To comply with legal obligations and resolve disputes',
      'To detect and prevent fraud or unauthorised access',
    ],
  },
  {
    title: '4. Sharing Your Information',
    content: 'We do not sell, rent, or trade your personal information to third parties. We may share your information only in the following circumstances:',
    list: [
      'With our assigned drivers — your name, phone number, and pickup details are shared so the driver can reach you',
      'With payment processors (Razorpay) — to securely process your payments',
      'With cloud service providers (MongoDB Atlas, Vercel, Cloudinary) — to store data and deliver our service',
      'With WhatsApp — for booking communication (subject to WhatsApp\'s privacy policy)',
      'With legal authorities — if required by law, court order, or to protect our legal rights',
      'With your consent — in any other case where you have explicitly agreed to the sharing',
    ],
  },
  {
    title: '5. Cookies and Tracking',
    content: 'We use cookies and similar technologies to:',
    list: [
      'Keep you signed in to your account across sessions (authentication cookie)',
      'Remember your preferences and settings',
      'Understand how visitors navigate our website (analytics)',
      'Improve website performance and load times',
    ],
    footer: 'You can control cookies through your browser settings. Disabling cookies may affect some functionality of our website. We do not use cookies for advertising or to track you across other websites.',
  },
  {
    title: '6. Data Storage and Security',
    list: [
      'Your data is stored on secure servers provided by MongoDB Atlas (hosted in India/Asia Pacific regions).',
      'Passwords are hashed using bcrypt — we never store your plain-text password.',
      'We use HTTPS (SSL/TLS) encryption for all data transmitted between your browser and our servers.',
      'Payment processing is handled entirely by Razorpay, which is PCI-DSS compliant. We never store card numbers or CVVs.',
      'Images and media are stored on Cloudinary\'s secure servers.',
      'Access to your data is restricted to authorised staff only.',
      'Despite our best efforts, no system is completely secure. We encourage you to use a strong, unique password for your account.',
    ],
  },
  {
    title: '7. Data Retention',
    list: [
      'Booking records are retained for 3 years for accounting and legal compliance purposes.',
      'Account information is retained as long as your account is active. You may request deletion at any time.',
      'Contact form submissions are retained for up to 1 year.',
      'Analytical data is retained in anonymised form for service improvement.',
      'When data is deleted, it is permanently removed from our systems within 30 days.',
    ],
  },
  {
    title: '8. Your Rights',
    content: 'Under applicable data protection laws, you have the following rights:',
    list: [
      'Right to Access — request a copy of the personal data we hold about you',
      'Right to Rectification — request correction of inaccurate or incomplete data',
      'Right to Erasure — request deletion of your personal data ("right to be forgotten")',
      'Right to Portability — request your data in a structured, machine-readable format',
      'Right to Restrict Processing — ask us to stop or limit how we use your data',
      'Right to Withdraw Consent — opt out of marketing communications at any time',
      'Right to Object — object to processing of your data for direct marketing',
    ],
    footer: `To exercise any of these rights, please contact us at ${CONTACT_EMAIL}. We will respond within 30 days.`,
  },
  {
    title: '9. Children\'s Privacy',
    content: `Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us at ${CONTACT_EMAIL} and we will delete it promptly.`,
  },
  {
    title: '10. Third-Party Links',
    content: 'Our website may contain links to third-party websites (Google Maps, WhatsApp, hotel booking platforms, etc.). We are not responsible for the privacy practices or content of those websites. We encourage you to read the privacy policies of any third-party sites you visit.',
  },
  {
    title: '11. WhatsApp Communication',
    content: `We use WhatsApp Business to send booking confirmations, driver details, and support messages. By providing your phone number, you consent to receive WhatsApp messages related to your booking. You can opt out by notifying us at ${CONTACT_EMAIL} or via WhatsApp. WhatsApp communication is subject to Meta's privacy policy.`,
  },
  {
    title: '12. Changes to This Policy',
    content: `We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. When we make significant changes, we will post the updated policy on ${SITE_URL} with the new effective date. We encourage you to review this page regularly. Continued use of our services after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '13. Contact Us',
    content: 'If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please contact us:',
    list: [
      `Email: ${CONTACT_EMAIL}`,
      `Phone / WhatsApp: ${CONTACT_PHONE}`,
      'Address: Mathura, Uttar Pradesh, India — 281001',
      `Website: ${SITE_URL}`,
    ],
    footer: 'We are committed to resolving any privacy concerns promptly and transparently.',
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #4338ca, #1e1b4b)' }}>
            <Shield size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: 'var(--font-serif)' }}>
            Privacy Policy
          </h1>
          <p className="text-gray-500 text-sm">
            Last updated: <strong>{EFFECTIVE_DATE}</strong>
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Your privacy matters to us. Here&apos;s how we protect your data.
          </p>
        </div>

        {/* Intro card */}
        <div className="card rounded-2xl p-6 mb-5"
          style={{ borderLeft: '4px solid #4338ca' }}>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>{SITE_NAME}</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
            operates <strong>{SITE_URL}</strong>. This policy describes how we collect and use
            your personal information when you book our pilgrimage and tour services.
            We are committed to keeping your data safe and using it only to serve you better.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {SECTIONS.map((section, i) => (
            <div key={i} className="card rounded-2xl p-6">
              <h2 className="font-bold text-gray-900 mb-3 text-base"
                style={{ fontFamily: 'var(--font-serif)' }}>
                {section.title}
              </h2>

              {section.content && (
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{section.content}</p>
              )}

              {/* Subsections (for section 2) */}
              {section.subsections && section.subsections.map((sub, j) => (
                <div key={j} className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">{sub.subtitle}</p>
                  <ul className="space-y-2">
                    {sub.list.map((item, k) => (
                      <li key={k} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: '#4338ca' }} />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {section.list && (
                <ul className="space-y-2">
                  {section.list.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: '#4338ca' }} />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.footer && (
                <p className="text-sm text-gray-500 mt-3 italic leading-relaxed">
                  {section.footer}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-8 p-5 rounded-2xl text-center"
          style={{ background: '#ede9fe', border: '1px solid #c4b5fd' }}>
          <p className="text-sm text-gray-700 mb-3">
            Questions about your privacy or data? We&apos;re here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact" className="btn-primary text-sm py-2.5 px-5"
              style={{ background: 'linear-gradient(135deg, #4338ca, #1e1b4b)' }}>
              Contact Us
            </Link>
            <Link href="/terms"
              className="flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-5 rounded-full border border-gray-300 text-gray-600 hover:bg-white transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} {SITE_NAME} ·{' '}
          <Link href="/" className="hover:underline">Home</Link>
        </p>
      </div>
    </div>
  )
}