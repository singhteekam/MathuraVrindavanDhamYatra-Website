import mongoose from 'mongoose'

const SettingsSchema = new mongoose.Schema(
  {
    key:           { type: String, default: 'site', unique: true },
    siteInfo:      { type: mongoose.Schema.Types.Mixed, default: {} },
    emailConfig:   { type: mongoose.Schema.Types.Mixed, default: {} },
    bookingConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
)

export interface ISettingsDoc {
  key: string
  siteInfo?: Record<string, unknown>
  emailConfig?: Record<string, unknown>
  bookingConfig?: {
    advanceAmount?:    number   // fixed ₹ advance (active mode)
    advancePercent?:   number   // % mode — kept for future switch-back
    cancellationHours?: number
    autoConfirm?:      boolean
    [key: string]: unknown
  }
}

const Settings =
  mongoose.models.Settings ?? mongoose.model('Settings', SettingsSchema)

export default Settings
