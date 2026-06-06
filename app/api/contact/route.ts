import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Contact from '@/models/Contact'
import { sendEnquiryNotification } from '@/lib/email'
import { successResponse, errorResponse } from '@/lib/apiResponse'

// POST /api/contact — save enquiry + send email to admin
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, email, message, tourDate, passengers } = body

    if (!name?.trim() || !phone?.trim() || !message?.trim()) {
      return errorResponse('Name, phone, and message are required.')
    }

    // Length guards — prevent oversized payloads and spam
    if (name.trim().length > 100)    return errorResponse('Name is too long.')
    if (phone.trim().length > 20)    return errorResponse('Invalid phone number.')
    if (message.trim().length > 2000) return errorResponse('Message must be under 2000 characters.')
    if (email && email.trim().length > 254) return errorResponse('Invalid email address.')

    await connectDB()

    const contact = await Contact.create({
      name:       name.trim().slice(0, 100),
      phone:      phone.trim().slice(0, 20),
      email:      email?.trim().slice(0, 254),
      message:    message.trim().slice(0, 2000),
      tourDate,
      passengers,
    })

    // Send email notification to admin (non-blocking)
    sendEnquiryNotification({ name, phone, email, message, tourDate }).catch(console.error)

    return successResponse(
      { id: contact._id.toString(), message: 'Enquiry submitted successfully.' },
      201,
    )
  } catch (err) {
    console.error('[POST /api/contact]', err)
    return errorResponse('Internal server error.', 500)
  }
}

// GET /api/contact — admin only, list all enquiries
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'admin' && user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    await connectDB()

    const { searchParams } = new URL(req.url)
    const page    = Number(searchParams.get('page')  ?? 1)
    const limit   = Number(searchParams.get('limit') ?? 20)
    const unread  = searchParams.get('unread') === 'true'
    const skip    = (page - 1) * limit

    const filter = unread ? { isRead: false } : {}

    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Contact.countDocuments(filter),
    ])

    return successResponse({ contacts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (err) {
    console.error('[GET /api/contact]', err)
    return errorResponse('Internal server error.', 500)
  }
}
