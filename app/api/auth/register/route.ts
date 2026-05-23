import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { sendOTPEmail } from '@/lib/email'
import { successResponse, errorResponse } from '@/lib/apiResponse'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json()

    if (!name || !email || !phone || !password) {
      return errorResponse('All fields are required.')
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters.')
    }

    await connectDB()

    const cleanEmail = email.toLowerCase().trim()
    const existing   = await User.findOne({ email: cleanEmail }).lean()

    if (existing) {
      if (!existing.emailVerified) {
        // Account exists but unverified — resend OTP via atomic updateOne
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        await User.updateOne(
          { _id: existing._id },
          { $set: { otpCode: otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000) } },
        )
        sendOTPEmail(existing.email, existing.name, otp).catch(console.error)
        return errorResponse(
          'An unverified account with this email already exists. A new OTP has been sent to verify it.',
          409,
        )
      }
      return errorResponse('An account with this email already exists.', 409)
    }

    const hashed = await bcrypt.hash(password, 12)

    // Create user first (no OTP in create — avoids strict-mode field-drop on stale cached model)
    const user = await User.create({
      name:  name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      password: hashed,
      role: 'customer',
    })

    // Write OTP fields atomically after creation — bypasses any schema-caching issues
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    await User.updateOne(
      { _id: user._id },
      { $set: { otpCode: otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000) } },
    )

    // Fire-and-forget — don't fail registration if SMTP is down
    sendOTPEmail(cleanEmail, name.trim(), otp).catch(console.error)

    return successResponse({ needsVerification: true, email: cleanEmail }, 201)
  } catch (err) {
    console.error('[POST /api/auth/register]', err)
    return errorResponse('Internal server error.', 500)
  }
}
