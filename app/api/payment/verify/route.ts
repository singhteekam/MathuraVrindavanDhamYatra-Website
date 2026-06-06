import { NextRequest }          from 'next/server'
import { getServerSession }       from 'next-auth'
import { authOptions }            from '@/lib/auth'
import crypto                     from 'crypto'
import { connectDB }              from '@/lib/db'
import Booking                    from '@/models/Booking'
import { sendBookingConfirmation, sendAdminBookingNotification } from '@/lib/email'
import { successResponse, errorResponse } from '@/lib/apiResponse'

// POST /api/payment/verify
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse('Unauthorized.', 401)

    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      bookingId, paymentType, paidAmount,
    } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return errorResponse('Missing payment details.')
    }

    // ── HMAC signature verification (server-side only, uses secret key) ──────
    const sigBody   = `${razorpay_order_id}|${razorpay_payment_id}`
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET ?? '')
      .update(sigBody)
      .digest('hex')

    if (expected !== razorpay_signature) {
      return errorResponse('Payment verification failed. Invalid signature.', 400)
    }

    // ── Update booking in DB ────────────────────────────────────────────────
    if (!bookingId) return errorResponse('bookingId is required.')

    await connectDB()

    const isFullPayment = paymentType === 'full'
    const amountPaid    = Number(paidAmount) || 0

    const booking = await Booking.findOneAndUpdate(
      { bookingId },
      {
        $set: {
          paymentId:          razorpay_payment_id,
          razorpayOrderId:    razorpay_order_id,
          razorpaySignature:  razorpay_signature,
          paymentType:        paymentType as 'full' | 'advance',
          paymentStatus:      isFullPayment ? 'paid' : 'partial',
          paidAmount:         amountPaid,
          paidAt:             new Date(),
          status:             'confirmed',
        },
      },
      { new: true },
    )

    if (!booking) return errorResponse('Booking not found.', 404)

    const sessionEmail  = (session.user as { email?: string }).email
    const userName      = (session.user as { name?: string }).name
    const b = booking as unknown as {
      customerName?: string; customerEmail?: string; customerPhone?: string
      discountPercent?: number; originalAmount?: number; paymentMethod?: string
      addons?: string[]; specialRequests?: string
    }
    const formattedDate = new Date(booking.startDate).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    const resolvedName = b.customerName ?? userName ?? 'Valued Customer'

    // ── Customer confirmation email ──────────────────────────────────────
    const emailList = [sessionEmail, b.customerEmail]
      .filter((e): e is string => Boolean(e?.trim()))
    if (emailList.length > 0) {
      sendBookingConfirmation({
        bookingId:      booking.bookingId,
        customerName:   resolvedName,
        customerEmail:  emailList,
        carName:        booking.carName,
        startDate:      formattedDate,
        pickupLocation: booking.pickupLocation,
        totalAmount:    booking.totalAmount,
        paidAmount:     amountPaid > 0 ? amountPaid : undefined,
      }).catch(console.error)
    }

    // ── Admin notification ───────────────────────────────────────────────
    sendAdminBookingNotification({
      bookingId:       booking.bookingId,
      customerName:    resolvedName,
      customerPhone:   b.customerPhone ?? 'Not provided',
      customerEmail:   b.customerEmail ?? sessionEmail ?? undefined,
      carName:         booking.carName,
      startDate:       formattedDate,
      pickupLocation:  booking.pickupLocation,
      totalAmount:     booking.totalAmount,
      originalAmount:  b.originalAmount  ?? undefined,
      discountPercent: b.discountPercent ?? 0,
      paymentMethod:   b.paymentMethod   ?? 'online',
      addons:          b.addons?.length ? b.addons : undefined,
      specialRequests: b.specialRequests ?? undefined,
    }).catch(console.error)

    return successResponse({
      verified:    true,
      paymentId:   razorpay_payment_id,
      paymentType,
      paidAmount:  amountPaid,
      message:     isFullPayment ? 'Full payment confirmed.' : 'Advance payment confirmed.',
    })
  } catch (err) {
    console.error('[POST /api/payment/verify]', err)
    return errorResponse('Payment verification error.', 500)
  }
}
