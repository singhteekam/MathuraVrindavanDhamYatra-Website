import mongoose from 'mongoose'

export interface IVisitorLog {
  page:       string
  visitorId:  string   // anonymous browser UUID stored in localStorage
  sessionId:  string   // per-tab session identifier
  device:     string   // desktop | mobile | tablet
  browser:    string   // Chrome | Firefox | Safari | Edge | Opera | Samsung | Other
  os:         string   // Windows | macOS | Android | iOS | Linux | Other
  country:    string   // ISO-2 country code from CF-IPCountry / X-Vercel-IP-Country header
  city:       string   // best-effort city from headers
  ipHash:     string   // salted HMAC-SHA256 of IP — no raw IP stored (privacy-safe)
  referrer:   string   // document.referrer (empty if direct)
  utm:        string   // ?utm_source=... query param if present
  timeOnPage: number   // seconds spent on page (sent on beacon/unload)
  dayKey:     string   // YYYY-MM-DD (IST)
  weekKey:    string   // YYYY-Www (IST)
  monthKey:   string   // YYYY-MM (IST)
  timestamp:  Date
}

const VisitorLogSchema = new mongoose.Schema<IVisitorLog>({
  page:       { type: String, required: true },
  visitorId:  { type: String, default: '' },
  sessionId:  { type: String, default: '' },
  device:     { type: String, default: 'desktop' },
  browser:    { type: String, default: '' },
  os:         { type: String, default: '' },
  country:    { type: String, default: '' },
  city:       { type: String, default: '' },
  ipHash:     { type: String, default: '' },
  referrer:   { type: String, default: '' },
  utm:        { type: String, default: '' },
  timeOnPage: { type: Number, default: 0 },
  dayKey:     { type: String, required: true },
  weekKey:    { type: String, required: true },
  monthKey:   { type: String, required: true },
  timestamp:  { type: Date, default: Date.now },
}, { timestamps: false })

// Auto-delete after 90 days
VisitorLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7_776_000 })

// Query indexes
VisitorLogSchema.index({ dayKey:    1 })
VisitorLogSchema.index({ weekKey:   1 })
VisitorLogSchema.index({ monthKey:  1 })
VisitorLogSchema.index({ visitorId: 1, timestamp: -1 })
VisitorLogSchema.index({ page:      1 })
VisitorLogSchema.index({ country:   1 })
VisitorLogSchema.index({ device:    1 })
VisitorLogSchema.index({ browser:   1 })

export default mongoose.models.VisitorLog ?? mongoose.model<IVisitorLog>('VisitorLog', VisitorLogSchema)
