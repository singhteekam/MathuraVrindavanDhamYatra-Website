import type { Metadata } from 'next'
import Link              from 'next/link'
import { FileText }      from 'lucide-react'

export const metadata: Metadata = {
  title:       'Terms & Conditions — Mathura Vrindavan Dham Yatra',
  description: 'Read the Terms & Conditions for booking tour packages and using services of Mathura Vrindavan Dham Yatra.',
}

const EFFECTIVE_DATE = 'May 1, 2026'
const SITE_NAME      = 'Mathura Vrindavan Dham Yatra'
const SITE_URL       = 'mathuravrindavandhamyatra.com'
const CONTACT_EMAIL  = 'info@mathuravrindavandhamyatra.com'
const CONTACT_PHONE  = '+91 85348 90870'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using the website ${SITE_URL}, making a booking, or using any of our tour and travel services, you agree to be bound by these Terms & Conditions. If you do not agree to any part of these terms, you may not use our services. These terms apply to all visitors, users, and customers of ${SITE_NAME}.`,
  },
  {
    title: '2. Services Provided',
    content: `${SITE_NAME} provides pilgrimage and tour services including but not limited to:`,
    list: [
      'Car and taxi services across Mathura, Vrindavan, Govardhan, Gokul, Barsana, and surrounding Braj region',
      'Guided tour packages for pilgrims and tourists',
      'Hotel finding and accommodation assistance',
      'Restaurant and dining recommendations',
      'Puja and aarti arrangement assistance',
      'Airport and railway station pickup and drop services',
    ],
    footer: 'All services are subject to availability and confirmation.',
  },
  {
    title: '3. Booking and Payment',
    content: 'When you make a booking on our platform:',
    list: [
      'A 30% advance payment is required to confirm your booking. The remaining 70% is to be paid on the day of the trip to the driver or our representative.',
      'All prices are quoted in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.',
      'Prices may vary during peak seasons such as Janmashtami, Holi, Govardhan Puja, and other major festivals.',
      'Booking confirmation is sent via WhatsApp and email (if provided) within 30 minutes of payment receipt.',
      'Payments can be made via Razorpay (UPI, Net Banking, Cards) or directly via WhatsApp/cash arrangement.',
    ],
  },
  {
    title: '4. Cancellation and Refund Policy',
    list: [
      'Cancellations made 48 hours or more before the trip: Full refund of the advance amount.',
      'Cancellations made 24–48 hours before the trip: 50% refund of the advance amount.',
      'Cancellations made less than 24 hours before the trip: No refund of the advance amount.',
      'No-show on the day of the trip: No refund.',
      'If we cancel a booking due to unforeseen circumstances or vehicle unavailability, a full refund will be issued within 5–7 business days.',
      'Refunds are processed to the original payment method and may take 5–10 business days to appear.',
    ],
  },
  {
    title: '5. Customer Responsibilities',
    content: 'As a customer using our services, you agree to:',
    list: [
      'Provide accurate and complete personal information during booking.',
      'Be available at the confirmed pickup location at the agreed time. Waiting time of more than 30 minutes may result in cancellation without refund.',
      'Treat our drivers and staff with respect and dignity.',
      'Not carry or transport any illegal substances, weapons, or prohibited items in our vehicles.',
      'Follow all temple rules and regulations at each place of visit.',
      'Dress modestly and appropriately for temple visits (covering shoulders and knees is required at most temples).',
      'Ensure that all members of your group are aware of and comply with these terms.',
    ],
  },
  {
    title: '6. Vehicle and Driver Policy',
    list: [
      'All vehicles are air-conditioned and regularly maintained for passenger safety and comfort.',
      'Our drivers are experienced, licensed, and familiar with the Braj region.',
      'Smoking is strictly prohibited inside all vehicles.',
      'Consumption of alcohol or intoxicating substances inside vehicles is not permitted.',
      'The number of passengers must not exceed the vehicle\'s official seating capacity.',
      'We reserve the right to substitute a vehicle of equal or higher class if the booked vehicle becomes unavailable.',
      'In case of a vehicle breakdown, we will arrange an alternative vehicle as quickly as possible. Waiting time compensation may be offered at our discretion.',
    ],
  },
  {
    title: '7. Itinerary and Changes',
    list: [
      'Itineraries are planned guides and may be adjusted based on temple timings, road conditions, festivals, or other circumstances.',
      'We reserve the right to alter, modify, or cancel portions of the itinerary if necessary for safety or operational reasons.',
      'Additional stops or detours requested by the customer may be accommodated subject to availability and additional charges.',
      'We are not responsible for delays caused by traffic, road closures, festivals, or other factors beyond our control.',
    ],
  },
  {
    title: '8. Liability and Disclaimers',
    list: [
      `${SITE_NAME} acts as a service facilitator. We are not responsible for personal accidents, loss of belongings, medical emergencies, or any incidents that occur during the tour.`,
      'We strongly recommend that all passengers carry personal travel insurance.',
      'We are not liable for any indirect, incidental, or consequential damages arising from the use of our services.',
      'Hotel and restaurant recommendations are made in good faith. We are not responsible for the quality, safety, or service standards of third-party hotels or restaurants.',
      'Our maximum liability in any circumstance is limited to the amount paid for the specific booking in question.',
    ],
  },
  {
    title: '9. Health and Safety',
    list: [
      'Customers with medical conditions should consult a physician before undertaking pilgrimages, especially the Govardhan Parikrama (21 km walk).',
      'We reserve the right to refuse service to any person who appears to be in a condition that may endanger themselves or other passengers.',
      'It is the customer\'s responsibility to carry any required medications.',
      'Children below 12 years and elderly passengers are advised to inform us in advance so appropriate arrangements can be made.',
    ],
  },
  {
    title: '10. Intellectual Property',
    content: `All content on ${SITE_URL}, including text, images, logos, graphics, and software, is the property of ${SITE_NAME} and is protected by applicable copyright and intellectual property laws. You may not reproduce, distribute, or use any content without prior written permission.`,
  },
  {
    title: '11. User Accounts',
    list: [
      'You are responsible for maintaining the confidentiality of your account credentials.',
      'You agree to notify us immediately of any unauthorised use of your account.',
      'We reserve the right to terminate accounts that violate these terms or engage in fraudulent activity.',
    ],
  },
  {
    title: '12. Governing Law and Disputes',
    content: 'These Terms & Conditions are governed by the laws of India. Any disputes arising from or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of Mathura, Uttar Pradesh, India. We encourage customers to first contact us directly to resolve any disputes amicably.',
  },
  {
    title: '13. Changes to Terms',
    content: `We reserve the right to modify these Terms & Conditions at any time. Updated terms will be posted on ${SITE_URL} with the effective date. Continued use of our services after any changes constitutes acceptance of the new terms. We recommend reviewing this page periodically.`,
  },
  {
    title: '14. Contact Us',
    content: 'If you have any questions about these Terms & Conditions, please contact us:',
    list: [
      `Email: ${CONTACT_EMAIL}`,
      `Phone / WhatsApp: ${CONTACT_PHONE}`,
      'Address: Mathura, Uttar Pradesh, India — 281001',
      `Website: ${SITE_URL}`,
    ],
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}>
            <FileText size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: 'var(--font-serif)' }}>
            Terms &amp; Conditions
          </h1>
          <p className="text-gray-500 text-sm">
            Last updated: <strong>{EFFECTIVE_DATE}</strong>
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Please read these terms carefully before using our services.
          </p>
        </div>

        {/* Introduction card */}
        <div className="card rounded-2xl p-6 mb-5"
          style={{ borderLeft: '4px solid #ff7d0f' }}>
          <p className="text-sm text-gray-600 leading-relaxed">
            Welcome to <strong>{SITE_NAME}</strong>. These Terms &amp; Conditions govern your use
            of our website, mobile experience, and all tour, travel, and pilgrimage services we
            provide. By booking with us or browsing our website, you agree to these terms in full.
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
              {section.list && (
                <ul className="space-y-2">
                  {section.list.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: '#ff7d0f' }} />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.footer && (
                <p className="text-sm text-gray-500 mt-3 italic">{section.footer}</p>
              )}
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-8 p-5 rounded-2xl text-center"
          style={{ background: '#fff8ed', border: '1px solid #ffdba8' }}>
          <p className="text-sm text-gray-600 mb-3">
            Have questions about our terms? We&apos;re happy to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact" className="btn-primary text-sm py-2.5 px-5">
              Contact Us
            </Link>
            <Link href="/privacy"
              className="flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} {SITE_NAME} · <Link href="/" className="hover:underline">Home</Link>
        </p>
      </div>
    </div>
  )
}