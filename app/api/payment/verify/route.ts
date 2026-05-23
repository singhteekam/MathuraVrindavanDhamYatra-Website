import { NextRequest }          from 'next/server'
import { getServerSession }       from 'next-auth'
import { authOptions }            from '@/lib/auth'
import crypto                     from 'crypto'
import { connectDB }              from '@/lib/db'
import Booking                    from '@/models/Booking'
import { sendBookingConfirmation } from '@/lib/email'
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
          paymentId:       razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          paymentStatus:   isFullPayment ? 'paid' : 'partial',
          paidAmount:      amountPaid,
          status:          'confirmed',
        },
      },
      { new: true },
    )

    if (!booking) return errorResponse('Booking not found.', 404)

    // ── Send confirmation email after successful payment ──────────────────
    // Send to both the account email (session) and the form-entered email (booking.customerEmail)
    const sessionEmail  = (session.user as { email?: string }).email
    const userName      = (session.user as { name?: string }).name
    const bookingEmail  = (booking as unknown as { customerEmail?: string }).customerEmail
    const emailList     = [sessionEmail, bookingEmail]
      .filter((e): e is string => Boolean(e?.trim()))
    if (emailList.length > 0) {
      sendBookingConfirmation({
        bookingId:      booking.bookingId,
        customerName:   (booking as unknown as { customerName?: string }).customerName ?? userName ?? 'Valued Customer',
        customerEmail:  emailList,
        carName:        booking.carName,
        startDate:      new Date(booking.startDate).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'long', year: 'numeric',
        }),
        pickupLocation: booking.pickupLocation,
        totalAmount:    booking.totalAmount,
      }).catch(console.error)
    }

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
