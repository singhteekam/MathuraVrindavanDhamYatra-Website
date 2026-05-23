import { connectDB } from '@/lib/db'
import Settings      from '@/models/Settings'
import { successResponse, errorResponse } from '@/lib/apiResponse'

// GET /api/settings/booking — public endpoint, returns advance amount (fixed ₹)
export async function GET() {
  try {
    await connectDB()
    const settings = await Settings.findOne({ key: 'site' }).lean() as {
      bookingConfig?: { advanceAmount?: number; advancePercent?: number }
    } | null

    const advanceAmount = settings?.bookingConfig?.advanceAmount ?? 500

    return successResponse({ advanceAmount })
  } catch (err) {
    console.error('[GET /api/settings/booking]', err)
    return errorResponse('Internal server error.', 500)
  }
}
