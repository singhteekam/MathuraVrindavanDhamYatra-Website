import mongoose, { Schema, Document, Model } from 'mongoose'
import type { LocalizedString } from '@/lib/i18nHelpers'

export interface IRestaurantDoc extends Document {
  name:        LocalizedString
  slug:        string
  city:        LocalizedString
  address:     LocalizedString
  type:        LocalizedString
  specialty:   LocalizedString
  description: LocalizedString
  tags:        LocalizedString[]
  emoji:       string
  rating:      number
  priceRange:  LocalizedString // e.g. { en: '₹50–200', hi: '₹50–200' }
  timings:     LocalizedString // e.g. { en: '7 AM – 10 PM', hi: 'सुबह 7 – रात 10' }
  isPopular:   boolean
  isActive:    boolean
  images:      string[]
  createdAt:   Date
  updatedAt:   Date
}

const RestaurantSchema = new Schema<IRestaurantDoc>(
  {
    name:        { type: Schema.Types.Mixed, required: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    city:        { type: Schema.Types.Mixed, required: true },
    address:     { type: Schema.Types.Mixed, required: true },
    type:        { type: Schema.Types.Mixed, required: true },
    specialty:   { type: Schema.Types.Mixed, required: true },
    description: { type: Schema.Types.Mixed, required: true },
    tags:        [{ type: Schema.Types.Mixed }],
    emoji:       { type: String, default: '🍽️' },
    rating:      { type: Number, default: 0, min: 0, max: 5 },
    priceRange:  { type: Schema.Types.Mixed, default: { en: '', hi: '' } },
    timings:     { type: Schema.Types.Mixed, default: { en: '', hi: '' } },
    isPopular:   { type: Boolean, default: false },
    isActive:    { type: Boolean, default: true },
    images:      [{ type: String }],
  },
  { timestamps: true },
)

const Restaurant: Model<IRestaurantDoc> =
  mongoose.models.Restaurant ??
  mongoose.model<IRestaurantDoc>('Restaurant', RestaurantSchema)

export default Restaurant
