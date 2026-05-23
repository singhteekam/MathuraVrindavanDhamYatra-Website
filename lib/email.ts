import nodemailer from 'nodemailer'
import { siteConfig } from '@/config/site'

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Generic send — `to` accepts a single address or an array (duplicates removed)
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[]
  subject: string
  html: string
}) {
  const recipients = Array.isArray(to)
    ? [...new Set(to.map((e) => e.trim().toLowerCase()).filter(Boolean))].join(', ')
    : to
  return transporter.sendMail({
    from: process.env.EMAIL_FROM ?? `${siteConfig.name} <info@mathuravrindavandhamyatra.com>`,
    to:   recipients,
    subject,
    html,
  })
}

// ── Shared layout helpers ─────────────────────────────────────────────────────

function emailHeader(title: string, subtitle = 'Jai Shri Krishna 🙏') {
  return `
    <div style="background: linear-gradient(135deg, #ff7d0f, #c74a06); padding: 32px 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${siteConfig.url}/logo/logo128x128.png" alt="${siteConfig.shortName}" style="height:48px;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;" onerror="this.style.display='none'" />
      <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">${title}</h1>
      <p style="color: rgba(255,255,255,0.88); margin: 6px 0 0; font-size: 14px;">${subtitle}</p>
    </div>
  `
}

function emailFooter() {
  const year = new Date().getFullYear()
  return `
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">

      <!-- Contact block -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#374151;">📞 Phone / WhatsApp</td>
          <td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827;text-align:right;">
            <a href="tel:${siteConfig.phone.replace(/\s/g,'')}" style="color:#ff7d0f;text-decoration:none;">${siteConfig.phone}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#374151;">✉️ Email</td>
          <td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827;text-align:right;">
            <a href="mailto:${siteConfig.email}" style="color:#ff7d0f;text-decoration:none;">${siteConfig.email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#374151;">📍 Address</td>
          <td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827;text-align:right;">${siteConfig.address}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#374151;">🌐 Website</td>
          <td style="padding:6px 0;text-align:right;">
            <a href="${siteConfig.url}" style="font-size:13px;color:#ff7d0f;font-weight:600;text-decoration:none;">${siteConfig.url.replace('https://','')}</a>
          </td>
        </tr>
      </table>

      <!-- Social links -->
      <div style="text-align:center;margin-bottom:16px;">
        <a href="${siteConfig.social.facebook}" style="display:inline-block;margin:0 6px;padding:6px 14px;background:#1877f2;color:#fff;font-size:12px;font-weight:600;border-radius:6px;text-decoration:none;">Facebook</a>
        <a href="${siteConfig.social.instagram}" style="display:inline-block;margin:0 6px;padding:6px 14px;background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff;font-size:12px;font-weight:600;border-radius:6px;text-decoration:none;">Instagram</a>
        <a href="${siteConfig.social.youtube}" style="display:inline-block;margin:0 6px;padding:6px 14px;background:#ff0000;color:#fff;font-size:12px;font-weight:600;border-radius:6px;text-decoration:none;">YouTube</a>
      </div>

      <!-- Copyright -->
      <p style="text-align:center;font-size:11px;color:#9ca3af;margin:0 0 4px;">
        © ${year} <strong>${siteConfig.name}</strong>. All rights reserved.
      </p>
      <p style="text-align:center;font-size:11px;color:#d1d5db;margin:0;">
        You received this email because of activity on your account or booking.
      </p>
    </div>
  `
}

function emailWrap(headerHtml: string, bodyHtml: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      ${headerHtml}
      <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        ${bodyHtml}
        ${emailFooter()}
      </div>
    </div>
  `
}

// ── Email functions ───────────────────────────────────────────────────────────

// OTP verification email
export async function sendOTPEmail(email: string, name: string, otp: string) {
  const body = `
    <p style="font-size:15px;color:#374151;">Dear <strong>${name}</strong>,</p>
    <p style="color:#6b7280;font-size:14px;">Use the OTP below to verify your email address. It is valid for <strong>10 minutes</strong>.</p>
    <div style="background:#fff8ed;border:2px solid #ff7d0f;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
      <p style="margin:0 0 8px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:2px;">Your OTP</p>
      <p style="margin:0;font-size:40px;font-weight:bold;color:#ff7d0f;letter-spacing:10px;font-family:monospace;">${otp}</p>
    </div>
    <p style="color:#9ca3af;font-size:12px;">If you did not create an account with us, please ignore this email.</p>
    <p style="color:#374151;font-size:14px;margin-top:16px;">Jai Shri Krishna 🙏<br><strong>${siteConfig.name}</strong></p>
  `
  return sendEmail({
    to:      email,
    subject: `${otp} — Verify your email | ${siteConfig.shortName}`,
    html:    emailWrap(emailHeader('Verify Your Email ✉️', siteConfig.shortName), body),
  })
}

// Booking confirmation to customer
export async function sendBookingConfirmation(booking: {
  bookingId:      string
  customerName:   string
  customerEmail:  string | string[]
  carName:        string
  startDate:      string
  pickupLocation: string
  totalAmount:    number
  addons?:        string[]
  specialRequests?:string
  locale?:        string
}) {
  const isHi = booking.locale === 'hi'

  const t = {
    title:      isHi ? 'बुकिंग की पुष्टि हो गई! 🙏'  : 'Booking Confirmed! 🙏',
    subtitle:   isHi ? 'जय श्री कृष्ण'                : 'Jai Shri Krishna',
    dear:       isHi ? 'प्रिय'                         : 'Dear',
    body:       isHi
      ? 'आपके मथुरा वृन्दावन टूर की बुकिंग की पुष्टि हो गई है! यहाँ आपकी बुकिंग का विवरण है:'
      : 'Your Mathura Vrindavan tour has been confirmed! Here are your booking details:',
    bookingId:  isHi ? 'बुकिंग आईडी'  : 'Booking ID',
    vehicle:    isHi ? 'वाहन'          : 'Vehicle',
    travelDate: isHi ? 'यात्रा तिथि'  : 'Travel Date',
    pickup:     isHi ? 'पिकअप स्थान'  : 'Pickup Location',
    total:      isHi ? 'कुल राशि'      : 'Total Amount',
    callNotice: isHi
      ? `हमारी टीम जल्द ही ड्राइवर विवरण की पुष्टि के लिए संपर्क करेगी। किसी भी जानकारी के लिए <a href="tel:${siteConfig.phone.replace(/\s/g,'')}" style="color:#ff7d0f;font-weight:bold;">${siteConfig.phone}</a> पर कॉल करें।`
      : `Our team will contact you shortly to confirm driver details. For any queries, call us at <a href="tel:${siteConfig.phone.replace(/\s/g,'')}" style="color:#ff7d0f;font-weight:bold;">${siteConfig.phone}</a>.`,
    closing: isHi ? 'जय श्री कृष्ण 🙏' : 'Jai Shri Krishna 🙏',
  }

  const subject = isHi
    ? `बुकिंग की पुष्टि — ${booking.bookingId} | मथुरा वृन्दावन धाम यात्रा`
    : `Booking Confirmed — ${booking.bookingId} | Mathura Vrindavan Dham Yatra`

  const addonsRow = booking.addons?.length
    ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Add-ons</td><td style="padding:8px 0;font-weight:600;color:#111827;text-align:right;">${booking.addons.join(', ')}</td></tr>`
    : ''

  const body = `
    <p style="font-size:16px;color:#374151;">${t.dear} <strong>${booking.customerName}</strong>,</p>
    <p style="color:#6b7280;">${t.body}</p>
    <div style="background:#fff8ed;border:1px solid #ffdba8;border-radius:8px;padding:20px;margin:20px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">${t.bookingId}</td><td style="padding:8px 0;font-weight:bold;color:#ff7d0f;text-align:right;">${booking.bookingId}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">${t.vehicle}</td><td style="padding:8px 0;font-weight:600;color:#111827;text-align:right;">${booking.carName}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">${t.travelDate}</td><td style="padding:8px 0;font-weight:600;color:#111827;text-align:right;">${booking.startDate}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">${t.pickup}</td><td style="padding:8px 0;font-weight:600;color:#111827;text-align:right;">${booking.pickupLocation}</td></tr>
        ${addonsRow}
        ${booking.specialRequests ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Special Requests</td><td style="padding:8px 0;font-weight:600;color:#111827;text-align:right;">${booking.specialRequests}</td></tr>` : ''}
        <tr style="border-top:1px solid #ffdba8;">
          <td style="padding:12px 0 0;color:#374151;font-weight:bold;">${t.total}</td>
          <td style="padding:12px 0 0;font-weight:bold;color:#ff7d0f;font-size:18px;text-align:right;">₹${booking.totalAmount.toLocaleString('en-IN')}</td>
        </tr>
      </table>
    </div>
    <p style="color:#6b7280;font-size:14px;">${t.callNotice}</p>
    <p style="color:#374151;font-size:14px;margin-top:16px;">${t.closing}<br><strong>${siteConfig.name}</strong></p>
  `
  return sendEmail({
    to:      booking.customerEmail,
    subject,
    html:    emailWrap(emailHeader(t.title, t.subtitle), body),
  })
}

// Booking update notification to customer
export async function sendBookingUpdateEmail(booking: {
  bookingId:      string
  customerName:   string
  customerEmail:  string
  status:         string
  paymentStatus:  string
  totalAmount:    number
  paidAmount:     number
  startDate:      string
  carName:        string
  pickupLocation: string
  adminNotes?:    string
  cancelReason?:  string
  driverName?:    string
  driverPhone?:   string
}) {
  const statusLabel: Record<string, string> = {
    pending:         'Pending',
    confirmed:       'Confirmed',
    driver_assigned: 'Driver Assigned',
    ongoing:         'On The Way',
    completed:       'Completed',
    cancelled:       'Cancelled',
  }
  const payLabel: Record<string, string> = {
    pending: 'Pending', partial: 'Partially Paid', paid: 'Paid', refunded: 'Refunded',
  }

  const balance = booking.totalAmount - booking.paidAmount

  const body = `
    <p style="font-size:16px;color:#374151;">Dear <strong>${booking.customerName}</strong>,</p>
    <p style="color:#6b7280;">Your booking details have been updated. Here is the latest information:</p>

    <div style="background:#fff8ed;border:1px solid #ffdba8;border-radius:8px;padding:20px;margin:20px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Booking ID</td><td style="padding:8px 0;font-weight:bold;color:#ff7d0f;text-align:right;font-family:monospace;">${booking.bookingId}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Status</td><td style="padding:8px 0;font-weight:600;color:#111827;text-align:right;">${statusLabel[booking.status] ?? booking.status}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Vehicle</td><td style="padding:8px 0;font-weight:600;color:#111827;text-align:right;">${booking.carName}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Travel Date</td><td style="padding:8px 0;font-weight:600;color:#111827;text-align:right;">${booking.startDate}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Pickup</td><td style="padding:8px 0;font-weight:600;color:#111827;text-align:right;">${booking.pickupLocation}</td></tr>
        ${booking.driverName ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Driver</td><td style="padding:8px 0;font-weight:600;color:#111827;text-align:right;">${booking.driverName}${booking.driverPhone ? ' · ' + booking.driverPhone : ''}</td></tr>` : ''}
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Payment</td><td style="padding:8px 0;font-weight:600;color:#111827;text-align:right;">${payLabel[booking.paymentStatus] ?? booking.paymentStatus}</td></tr>
        <tr style="border-top:1px solid #ffdba8;">
          <td style="padding:12px 0 0;color:#374151;font-weight:bold;">Total Amount</td>
          <td style="padding:12px 0 0;font-weight:bold;color:#ff7d0f;font-size:18px;text-align:right;">₹${booking.totalAmount.toLocaleString('en-IN')}</td>
        </tr>
        ${booking.paidAmount > 0 ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Paid</td><td style="padding:6px 0;font-weight:600;color:#16a34a;text-align:right;">₹${booking.paidAmount.toLocaleString('en-IN')}</td></tr>` : ''}
        ${balance > 0 ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Balance Due</td><td style="padding:6px 0;font-weight:bold;color:#d97706;text-align:right;">₹${balance.toLocaleString('en-IN')}</td></tr>` : ''}
      </table>
    </div>

    ${booking.adminNotes ? `<div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:14px;border-radius:0 8px 8px 0;margin-bottom:12px;"><p style="margin:0;color:#1e40af;font-size:14px;"><strong>📌 Note from Admin:</strong> ${booking.adminNotes}</p></div>` : ''}
    ${booking.cancelReason ? `<div style="background:#fff1f2;border-left:4px solid #ef4444;padding:14px;border-radius:0 8px 8px 0;margin-bottom:12px;"><p style="margin:0;color:#dc2626;font-size:14px;"><strong>Cancellation Reason:</strong> ${booking.cancelReason}</p></div>` : ''}

    <p style="color:#374151;font-size:14px;margin-top:16px;">
      For any queries, call us at <a href="tel:${siteConfig.phone.replace(/\s/g,'')}" style="color:#ff7d0f;font-weight:bold;">${siteConfig.phone}</a> or reply to this email.
    </p>
    <p style="color:#374151;font-size:14px;margin-top:8px;">Jai Shri Krishna 🙏<br><strong>${siteConfig.name}</strong></p>
  `
  return sendEmail({
    to:      booking.customerEmail,
    subject: `Booking Updated — ${booking.bookingId} | ${siteConfig.shortName}`,
    html:    emailWrap(emailHeader('Booking Updated 🔔'), body),
  })
}

// Driver assigned notification — sent when admin assigns a driver to a booking
export async function sendDriverAssignedEmail(params: {
  bookingId:      string
  customerName:   string
  customerEmail:  string
  startDate:      string
  pickupLocation: string
  driver: {
    name:       string
    phone:      string
    gender?:    string
    avatar?:    string
    rating:     number
    isVerified: boolean
    vehicle: {
      name:   string
      number: string
      color:  string
      type:   string
      image?: string
    }
  }
}) {
  const { driver } = params
  const genderLabel: Record<string, string> = { male: 'Male', female: 'Female', other: 'Other' }

  const driverPhotoHtml = driver.avatar
    ? `<img src="${driver.avatar}" alt="${driver.name}" style="width:88px;height:88px;border-radius:50%;object-fit:cover;border:3px solid #ff7d0f;display:block;margin:0 auto 10px;" />`
    : `<div style="width:88px;height:88px;border-radius:50%;background:linear-gradient(135deg,#ff7d0f,#c74a06);line-height:88px;text-align:center;font-size:34px;font-weight:bold;color:#fff;margin:0 auto 10px;">${driver.name.charAt(0).toUpperCase()}</div>`

  const vehiclePhotoHtml = driver.vehicle.image
    ? `<img src="${driver.vehicle.image}" alt="${driver.vehicle.name}" style="width:100%;max-height:180px;object-fit:cover;border-radius:8px;margin-bottom:14px;display:block;" />`
    : ''

  const body = `
    <p style="font-size:16px;color:#374151;">Dear <strong>${params.customerName}</strong>,</p>
    <p style="color:#6b7280;">Great news! A driver has been assigned for booking <strong style="color:#ff7d0f;">${params.bookingId}</strong>. Here are the details:</p>

    <!-- Driver Profile Card -->
    <div style="background:#f9fafb;border-radius:12px;padding:24px;margin:20px 0;text-align:center;">
      ${driverPhotoHtml}
      <h2 style="margin:4px 0 6px;color:#111827;font-size:20px;">${driver.name}</h2>
      ${driver.isVerified ? '<span style="display:inline-block;background:#f0fdf4;color:#16a34a;font-size:12px;padding:3px 12px;border-radius:999px;font-weight:700;margin-bottom:12px;">✓ Verified Driver</span>' : ''}
      <table style="width:100%;max-width:320px;margin:12px auto 0;border-collapse:collapse;">
        <tr>
          <td style="padding:8px;text-align:center;border-right:1px solid #e5e7eb;">
            <p style="margin:0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Phone</p>
            <p style="margin:4px 0 0;font-weight:bold;color:#111827;font-size:15px;">
              <a href="tel:${driver.phone.replace(/\s/g,'')}" style="color:#ff7d0f;text-decoration:none;">📞 ${driver.phone}</a>
            </p>
          </td>
          <td style="padding:8px;text-align:center;${driver.gender ? 'border-right:1px solid #e5e7eb;' : ''}">
            <p style="margin:0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Rating</p>
            <p style="margin:4px 0 0;font-weight:bold;color:#ff7d0f;font-size:15px;">⭐ ${driver.rating.toFixed(1)}/5</p>
          </td>
          ${driver.gender ? `
          <td style="padding:8px;text-align:center;">
            <p style="margin:0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Gender</p>
            <p style="margin:4px 0 0;font-weight:bold;color:#111827;font-size:15px;">${genderLabel[driver.gender] ?? driver.gender}</p>
          </td>` : ''}
        </tr>
      </table>
    </div>

    <!-- Vehicle Card -->
    <div style="background:#fff8ed;border:1px solid #ffdba8;border-radius:12px;padding:20px;margin:20px 0;">
      <h3 style="margin:0 0 14px;color:#92400e;font-size:13px;text-transform:uppercase;letter-spacing:1px;">🚗 Vehicle Details</h3>
      ${vehiclePhotoHtml}
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:7px 0;color:#6b7280;font-size:14px;">Vehicle Name</td><td style="padding:7px 0;font-weight:600;color:#111827;text-align:right;">${driver.vehicle.name}</td></tr>
        <tr><td style="padding:7px 0;color:#6b7280;font-size:14px;">Vehicle Number</td><td style="padding:7px 0;font-weight:bold;color:#ff7d0f;text-align:right;font-family:monospace;font-size:15px;">${driver.vehicle.number}</td></tr>
        <tr><td style="padding:7px 0;color:#6b7280;font-size:14px;">Color</td><td style="padding:7px 0;font-weight:600;color:#111827;text-align:right;">${driver.vehicle.color}</td></tr>
        <tr><td style="padding:7px 0;color:#6b7280;font-size:14px;">Type</td><td style="padding:7px 0;font-weight:600;color:#111827;text-align:right;text-transform:capitalize;">${driver.vehicle.type}</td></tr>
      </table>
    </div>

    <!-- Trip Summary -->
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0;">
      <h3 style="margin:0 0 12px;color:#374151;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Trip Summary</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Booking ID</td><td style="padding:6px 0;font-weight:bold;color:#ff7d0f;text-align:right;font-family:monospace;">${params.bookingId}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Travel Date</td><td style="padding:6px 0;font-weight:600;color:#111827;text-align:right;">${params.startDate}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Pickup</td><td style="padding:6px 0;font-weight:600;color:#111827;text-align:right;">${params.pickupLocation}</td></tr>
      </table>
    </div>

    <p style="color:#374151;font-size:14px;">
      Need help? Call or WhatsApp us at <a href="tel:${siteConfig.phone.replace(/\s/g,'')}" style="color:#ff7d0f;font-weight:bold;">${siteConfig.phone}</a> or email
      <a href="mailto:${siteConfig.email}" style="color:#ff7d0f;font-weight:bold;">${siteConfig.email}</a>.
    </p>
    <p style="color:#374151;font-size:14px;margin-top:8px;">Jai Shri Krishna 🙏<br><strong>${siteConfig.name}</strong></p>
  `
  return sendEmail({
    to:      params.customerEmail,
    subject: `Driver Assigned for Your Trip — ${params.bookingId} | ${siteConfig.shortName}`,
    html:    emailWrap(emailHeader('Your Driver is Assigned! 🚗', 'Ready for your Mathura Vrindavan journey'), body),
  })
}

// New enquiry notification to admin
export async function sendEnquiryNotification(contact: {
  name: string
  phone: string
  email?: string
  message: string
  tourDate?: string
}) {
  const body = `
    <p style="font-size:15px;color:#374151;">A new enquiry has been received from the website.</p>
    <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:16px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;font-weight:bold;color:#374151;width:120px;">Name</td><td style="padding:8px 0;color:#6b7280;">${contact.name}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Phone</td><td style="padding:8px 0;color:#6b7280;"><a href="tel:${contact.phone}" style="color:#ff7d0f;">${contact.phone}</a></td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Email</td><td style="padding:8px 0;color:#6b7280;">${contact.email ? `<a href="mailto:${contact.email}" style="color:#ff7d0f;">${contact.email}</a>` : 'Not provided'}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;color:#374151;">Tour Date</td><td style="padding:8px 0;color:#6b7280;">${contact.tourDate ?? 'Not specified'}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;color:#374151;vertical-align:top;">Message</td><td style="padding:8px 0;color:#6b7280;">${contact.message}</td></tr>
      </table>
    </div>
    <p style="font-size:13px;color:#9ca3af;">Received via the contact form on ${siteConfig.url}</p>
  `
  return sendEmail({
    to:      process.env.SMTP_USER ?? siteConfig.email,
    subject: `New Enquiry from ${contact.name} — ${siteConfig.shortName}`,
    html:    emailWrap(emailHeader('New Enquiry Received 📩', siteConfig.shortName), body),
  })
}
