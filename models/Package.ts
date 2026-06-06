import mongoose, { Schema, Document, Model } from 'mongoose'
import type { LocalizedString } from '@/lib/i18nHelpers'

interface IItineraryDay {
  day: number
  title: LocalizedString
  description: LocalizedString
  places: LocalizedString[]
}

interface IPricing {
  carType: string
  carName: string
  price: number
}

export interface IPackageDoc extends Document {
  name: LocalizedString
  slug: string
  duration: number
  nights: number
  cities: LocalizedString[]
  thumbnail: string
  images: string[]
  shortDescription: LocalizedString
  highlights: LocalizedString[]
  itinerary: IItineraryDay[]
  inclusions: LocalizedString[]
  exclusions: LocalizedString[]
  pricing: IPricing[]
  basePrice: number
  isActive: boolean
  isFeatured: boolean
  isPopular: boolean
  rating: number
  totalReviews:    number
  totalBookings:   number
  discountPercent: number
  discountEndsAt:  Date | null
  discountLabel:   string
  createdAt: Date
  updatedAt: Date
}

const PackageSchema = new Schema<IPackageDoc>(
  {
    name:             { type: Schema.Types.Mixed, required: true },
    slug:             { type: String, required: true, lowercase: true, trim: true },
    duration:         { type: Number, required: true },
    nights:           { type: Number, required: true, default: 0 },
    cities:           [{ type: Schema.Types.Mixed }],
    thumbnail:        { type: String, default: '' },
    images:           [{ type: String }],
    shortDescription: { type: Schema.Types.Mixed, required: true },
    highlights:       [{ type: Schema.Types.Mixed }],
    itinerary: [
      {
        day:         { type: Number, required: true },
        title:       { type: Schema.Types.Mixed, required: true },
        description: { type: Schema.Types.Mixed, required: true },
        places:      [{ type: Schema.Types.Mixed }],
      },
    ],
    inclusions:    [{ type: Schema.Types.Mixed }],
    exclusions:    [{ type: Schema.Types.Mixed }],
    pricing: [
      {
        carType: { type: String, required: true },
        carName: { type: String, required: true },
        price:   { type: Number, required: true },
      },
    ],
    basePrice:     { type: Number, required: true },
    isActive:      { type: Boolean, default: true },
    isFeatured:    { type: Boolean, default: false },
    isPopular:     { type: Boolean, default: false },
    rating:        { type: Number, default: 5.0 },
    totalReviews:  { type: Number, default: 0 },
    totalBookings:   { type: Number,  default: 0 },
    discountPercent: { type: Number,  default: 0, min: 0, max: 100 },
    discountEndsAt:  { type: Date,    default: null },
    discountLabel:   { type: String,  default: '' },
  },
  { timestamps: true },
)

PackageSchema.index({ slug: 1 })
PackageSchema.index({ isActive: 1 })
PackageSchema.index({ isFeatured: 1 })
PackageSchema.index({ duration: 1 })

if (process.env.NODE_ENV !== 'production') {
  delete (mongoose.models as Record<string, unknown>).Package
}
const Package: Model<IPackageDoc> =
  (mongoose.models.Package as Model<IPackageDoc>) ?? mongoose.model<IPackageDoc>('Package', PackageSchema)

export default Package
