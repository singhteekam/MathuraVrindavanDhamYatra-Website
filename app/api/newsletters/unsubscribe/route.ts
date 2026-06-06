import { NextRequest } from 'next/server'
import { connectDB }  from '@/lib/db'
import User           from '@/models/User'
import { verifyUnsubscribeToken } from '@/lib/newsletterUtils'
import { siteConfig } from '@/config/site'

// GET /api/newsletters/unsubscribe?userId=xxx&token=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId') ?? ''
  const token  = searchParams.get('token')  ?? ''

  const successHtml = (msg: string) => new Response(
    `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Unsubscribed — ${siteConfig.name}</title>
    <style>body{font-family:Arial,sans-serif;background:#f9fafb;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
    .box{background:#fff;border-radius:16px;padding:40px;max-width:400px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    h2{color:#111827;margin-bottom:8px}p{color:#6b7280;font-size:15px;margin-bottom:24px}
    a{display:inline-block;padding:10px 24px;background:#ff7d0f;color:#fff;border-radius:8px;text-decoration:none;font-weight:600}</style>
    </head><body><div class="box">
    <div style="font-size:40px;margin-bottom:12px">✅</div>
    <h2>${msg}</h2>
    <p>You will no longer receive newsletter emails from us.</p>
    <a href="/">Back to Home</a></div></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html' } },
  )

  const errorHtml = (msg: string) => new Response(
    `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Error — ${siteConfig.name}</title>
    <style>body{font-family:Arial,sans-serif;background:#f9fafb;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
    .box{background:#fff;border-radius:16px;padding:40px;max-width:400px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    h2{color:#ef4444;margin-bottom:8px}p{color:#6b7280;font-size:15px}</style>
    </head><body><div class="box">
    <div style="font-size:40px;margin-bottom:12px">❌</div>
    <h2>Invalid Link</h2><p>${msg}</p></div></body></html>`,
    { status: 400, headers: { 'Content-Type': 'text/html' } },
  )

  if (!userId || !token) return errorHtml('Missing parameters.')
  if (!verifyUnsubscribeToken(userId, token)) return errorHtml('This unsubscribe link is invalid or has expired.')

  try {
    await connectDB()
    const user = await User.findByIdAndUpdate(userId, { newsletterOptOut: true }, { new: true })
    if (!user) return errorHtml('User not found.')
    return successHtml('You have been unsubscribed.')
  } catch {
    return errorHtml('Something went wrong. Please try again.')
  }
}
