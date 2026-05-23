import mongoose, { Schema, Document, Model } from 'mongoose'
import type { LocalizedString } from '@/lib/i18nHelpers'

export interface IHotelDoc extends Document {
  name:        LocalizedString
  slug:        string
  city:        LocalizedString
  address:     LocalizedString
  description: LocalizedString
  rating:      number
  priceRange:  { min: number; max: number }
  amenities:   LocalizedString[]  // e.g. [{ en: 'AC', hi: 'एसी' }, ...]
  category:    LocalizedString    // e.g. { en: 'budget', hi: 'किफायती' }
  isVegOnly:   boolean
  isFeatured:  boolean
  isActive:    boolean
  images:      string[]
  createdAt:   Date
  updatedAt:   Date
}

const HotelSchema = new Schema<IHotelDoc>(
  {
    name:        { type: Schema.Types.Mixed, required: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    city:        { type: Schema.Types.Mixed, required: true },
    address:     { type: Schema.Types.Mixed, required: true },
    description: { type: Schema.Types.Mixed, required: true },
    rating:      { type: Number, default: 0, min: 0, max: 5 },
    priceRange:  {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    amenities:  [{ type: Schema.Types.Mixed }],
    category:   { type: Schema.Types.Mixed, required: true },
    isVegOnly:  { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true },
    images:     [{ type: String }],
  },
  { timestamps: true },
)

const Hotel: Model<IHotelDoc> =
  mongoose.models.Hotel ??
  mongoose.model<IHotelDoc>('Hotel', HotelSchema)

export default Hotel
