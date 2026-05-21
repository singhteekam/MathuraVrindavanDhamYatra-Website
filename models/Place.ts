import mongoose, { Schema, Document, Model } from 'mongoose'
import type { LocalizedString } from '@/lib/i18nHelpers'

interface ISection {
  type: 'rich_text' | 'highlights' | 'travel_tips' | 'distances' | 'faq'
  title: LocalizedString
  content?: LocalizedString
  items?: unknown[]
}

export interface IPlaceDoc extends Document {
  name: LocalizedString
  slug: string
  city: LocalizedString
  type: LocalizedString
  shortDescription: LocalizedString
  description?: LocalizedString
  thumbnail: string
  images: string[]
  location: {
    address: LocalizedString
    lat: number
    lng: number
    distanceFromMathura?: string
  }
  timings?: {
    morning?: LocalizedString
    evening?: LocalizedString
    note?: LocalizedString
  }
  entryFee?: LocalizedString
  timeRequired?: LocalizedString
  isFeatured: boolean
  tags: LocalizedString[]
  sections: ISection[]
  createdAt: Date
  updatedAt: Date
}

const PlaceSchema = new Schema<IPlaceDoc>(
  {
    name:             { type: Schema.Types.Mixed, required: true },
    slug:             { type: String, required: true, lowercase: true, trim: true },
    city:             { type: Schema.Types.Mixed, required: true },
    type:             { type: Schema.Types.Mixed, required: true },
    shortDescription: { type: Schema.Types.Mixed, required: true },
    description:      { type: Schema.Types.Mixed },
    thumbnail:        { type: String, default: '' },
    images:           [{ type: String }],
    location: {
      address:             { type: Schema.Types.Mixed, required: true },
      lat:                 { type: Number, required: true },
      lng:                 { type: Number, required: true },
      distanceFromMathura: { type: String },
    },
    timings: {
      morning: { type: Schema.Types.Mixed },
      evening: { type: Schema.Types.Mixed },
      note:    { type: Schema.Types.Mixed },
    },
    entryFee:     { type: Schema.Types.Mixed },
    timeRequired: { type: Schema.Types.Mixed },
    isFeatured:   { type: Boolean, default: false },
    tags:         [{ type: Schema.Types.Mixed }],
    sections: [
      {
        type:    { type: String, enum: ['rich_text', 'highlights', 'travel_tips', 'distances', 'faq'] },
        title:   { type: Schema.Types.Mixed },
        content: { type: Schema.Types.Mixed },
        items:   [{ type: Schema.Types.Mixed }],
      },
    ],
  },
  { timestamps: true },
)

PlaceSchema.index({ slug: 1 })
PlaceSchema.index({ city: 1 })
PlaceSchema.index({ type: 1 })
PlaceSchema.index({ isFeatured: 1 })
PlaceSchema.index({ tags: 1 })

// In development, always recreate so schema changes (Mixed types, new fields)
// are picked up after hot-reloads without needing a full server restart.
if (process.env.NODE_ENV !== 'production') {
  delete (mongoose.models as Record<string, unknown>).Place
}

const Place: Model<IPlaceDoc> =
  (mongoose.models.Place as Model<IPlaceDoc>) ?? mongoose.model<IPlaceDoc>('Place', PlaceSchema)

export default Place
