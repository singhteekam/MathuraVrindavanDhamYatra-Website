import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IReviewDoc extends Document {
  customer:   Types.ObjectId
  booking:    Types.ObjectId
  package?:   Types.ObjectId
  rating:     number
  title:      string | { en: string; hi: string }
  comment:    string | { en: string; hi: string }
  images?:    string[]
  isApproved: boolean
  createdAt:  Date
  updatedAt:  Date
}

const ReviewSchema = new Schema<IReviewDoc>(
  {
    customer:   { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    booking:    { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    package:    { type: Schema.Types.ObjectId, ref: 'Package' },
    rating:     { type: Number,                required: true, min: 1, max: 5 },
    title:      { type: Schema.Types.Mixed,   required: true },
    comment:    { type: Schema.Types.Mixed,   required: true },
    images:     [{ type: String }],
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true },
)

ReviewSchema.index({ package: 1, isApproved: 1 })
ReviewSchema.index({ customer: 1 })
ReviewSchema.index({ createdAt: -1 })

const Review: Model<IReviewDoc> =
  mongoose.models.Review ?? mongoose.model<IReviewDoc>('Review', ReviewSchema)

export default Review