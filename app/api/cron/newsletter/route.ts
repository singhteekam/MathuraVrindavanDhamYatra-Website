import { NextRequest }  from 'next/server'
import { connectDB }    from '@/lib/db'
import Newsletter       from '@/models/Newsletter'
import User             from '@/models/User'
import { sendNewsletterEmail } from '@/lib/email'
import { buildUnsubscribeUrl } from '@/lib/newsletterUtils'

// GET /api/cron/newsletter — called by Vercel Cron
// Vercel automatically passes Authorization: Bearer <CRON_SECRET>
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    await connectDB()

    // Find newsletters scheduled to send now or in the past
    const due = await Newsletter.find({
      status:      'scheduled',
      scheduledAt: { $lte: new Date() },
    })

    if (due.length === 0) {
      return new Response(JSON.stringify({ message: 'No newsletters due.', processed: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? 'https://mathuravrindavandhamyatra.com'
    const results: Array<{ id: string; sent: number; failed: number }> = []

    for (const newsletter of due) {
      // Lock
      newsletter.status = 'sending'
      await newsletter.save()

      const recipients = await User.find({
        role:             { $in: newsletter.targetRoles },
        isActive:         true,
        newsletterOptOut: { $ne: true },
        email:            { $exists: true, $ne: '' },
      }).select('_id email').lean()

      newsletter.stats.totalRecipients = recipients.length
      let sent = 0, failed = 0

      for (const recipient of recipients) {
        try {
          await sendNewsletterEmail({
            to:             recipient.email,
            subject:        newsletter.subject,
            previewText:    newsletter.previewText,
            htmlContent:    newsletter.htmlContent,
            unsubscribeUrl: buildUnsubscribeUrl(recipient._id.toString(), baseUrl),
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

      results.push({ id: newsletter._id.toString(), sent, failed })
    }

    return new Response(JSON.stringify({ message: 'Done.', processed: due.length, results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[CRON /api/cron/newsletter]', err)
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
