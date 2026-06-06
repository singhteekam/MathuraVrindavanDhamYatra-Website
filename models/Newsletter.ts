import mongoose, { Schema, Document, Model } from 'mongoose'

export interface INewsletter extends Document {
  subject:      string
  previewText:  string
  htmlContent:  string
  status:       'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  targetRoles:  string[]
  scheduledAt:  Date | null
  sentAt:       Date | null
  stats: {
    totalRecipients: number
    sentCount:       number
    failedCount:     number
  }
  createdBy: {
    id:   string
    name: string
  }
  errorLog?: string
  createdAt: Date
  updatedAt: Date
}

const NewsletterSchema = new Schema<INewsletter>(
  {
    subject:     { type: String, required: true, trim: true },
    previewText: { type: String, default: '' },
    htmlContent: { type: String, required: true },
    status:      {
      type:    String,
      enum:    ['draft', 'scheduled', 'sending', 'sent', 'failed'],
      default: 'draft',
    },
    targetRoles: {
      type:    [String],
      default: ['customer'],
      enum:    ['customer', 'driver', 'admin', 'superadmin'],
    },
    scheduledAt: { type: Date, default: null },
    sentAt:      { type: Date, default: null },
    stats: {
      totalRecipients: { type: Number, default: 0 },
      sentCount:       { type: Number, default: 0 },
      failedCount:     { type: Number, default: 0 },
    },
    createdBy: {
      id:   { type: String, required: true },
      name: { type: String, required: true },
    },
    errorLog: { type: String },
  },
  { timestamps: true },
)

NewsletterSchema.index({ status: 1, scheduledAt: 1 })
NewsletterSchema.index({ createdAt: -1 })

const Newsletter: Model<INewsletter> =
  mongoose.models.Newsletter ?? mongoose.model<INewsletter>('Newsletter', NewsletterSchema)

export default Newsletter
