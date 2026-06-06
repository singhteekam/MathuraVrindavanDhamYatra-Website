import { NextRequest }     from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { connectDB }        from '@/lib/db'
import Newsletter           from '@/models/Newsletter'
import User                 from '@/models/User'
import { sendNewsletterEmail } from '@/lib/email'
import { buildUnsubscribeUrl } from '@/lib/newsletterUtils'
import { successResponse, errorResponse } from '@/lib/apiResponse'

interface Params { params: Promise<{ id: string }> }

// POST /api/newsletters/[id]/send — admin/superadmin: send newsletter immediately
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const user    = session?.user as { role?: string } | undefined
    if (user?.role !== 'admin' && user?.role !== 'superadmin') return errorResponse('Forbidden.', 403)

    const { id } = await params
    await connectDB()

    const newsletter = await Newsletter.findById(id)
    if (!newsletter) return errorResponse('Newsletter not found.', 404)

    if (newsletter.status === 'sending') return errorResponse('Already sending.')
    if (newsletter.status === 'sent')    return errorResponse('Already sent.')

    // Lock for sending
    newsletter.status = 'sending'
    await newsletter.save()

    // Fetch eligible recipients
    const recipients = await User.find({
      role:             { $in: newsletter.targetRoles },
      isActive:         true,
      newsletterOptOut: { $ne: true },
      email:            { $exists: true, $ne: '' },
    }).select('_id email name').lean()

    newsletter.stats.totalRecipients = recipients.length

    const baseUrl = process.env.NEXTAUTH_URL ?? 'https://mathuravrindavandhamyatra.com'
    let sent = 0, failed = 0

    for (const recipient of recipients) {
      try {
        const unsubUrl = buildUnsubscribeUrl(recipient._id.toString(), baseUrl)
        await sendNewsletterEmail({
          to:             recipient.email,
          subject:        newsletter.subject,
          previewText:    newsletter.previewText,
          htmlContent:    newsletter.htmlContent,
          unsubscribeUrl: unsubUrl,
        })
        sent++
      } catch {
        failed++
      }
    }

    newsletter.status            = 'sent'
    newsletter.sentAt            = new Date()
    newsletter.stats.sentCount   = sent
    newsletter.stats.failedCount = failed
    await newsletter.save()

    return successResponse({
      message:         'Newsletter sent.',
      totalRecipients: recipients.length,
      sentCount:       sent,
      failedCount:     failed,
    })
  } catch (err) {
    console.error('[POST /api/newsletters/:id/send]', err)
    // Try to reset status if something catastrophically failed
    try {
      const { id } = await params
      await Newsletter.findByIdAndUpdate(id, { status: 'failed', errorLog: String(err) })
    } catch { /* ignore */ }
    return errorResponse('Internal server error.', 500)
  }
}
