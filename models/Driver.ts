import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IDriverDoc extends Document {
  userId: Types.ObjectId
  name: string
  phone: string
  email: string
  gender?: 'male' | 'female' | 'other'
  avatar?: string
  licenseNumber: string
  aadharNumber?: string
  aadharFront?: string   // Cloudinary URL — front side
  aadharBack?: string    // Cloudinary URL — back side
  panNumber?: string
  panCard?: string       // Cloudinary URL
  vehicle: {
    type: string         // swift | eeco | ertiga | innova | crysta
    name: string
    number: string       // UP85 AB 1234
    color: string
    image?: string       // Cloudinary URL
  }
  isAvailable: boolean
  isVerified: boolean
  totalTrips: number
  rating: number
  totalRatings: number
  earnings: number
  createdAt: Date
  updatedAt: Date
}

const DriverSchema = new Schema<IDriverDoc>(
  {
    userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name:          { type: String, required: true, trim: true },
    phone:         { type: String, required: true, trim: true },
    email:         { type: String, required: true, lowercase: true, trim: true },
    gender:        { type: String, enum: ['male', 'female', 'other'] },
    avatar:        { type: String },
    licenseNumber: { type: String, required: true, unique: true },
    aadharNumber:  { type: String },
    aadharFront:   { type: String },
    aadharBack:    { type: String },
    panNumber:     { type: String },
    panCard:       { type: String },
    vehicle: {
      type:   { type: String, required: true },
      name:   { type: String, required: true },
      number: { type: String, required: true, uppercase: true },
      color:  { type: String, required: true },
      image:  { type: String },
    },
    isAvailable:  { type: Boolean, default: true },
    isVerified:   { type: Boolean, default: false },
    totalTrips:   { type: Number, default: 0 },
    rating:       { type: Number, default: 5.0, min: 1, max: 5 },
    totalRatings: { type: Number, default: 0 },
    earnings:     { type: Number, default: 0 },
  },
  { timestamps: true },
)

DriverSchema.index({ isAvailable: 1 })
DriverSchema.index({ 'vehicle.type': 1 })
DriverSchema.index({ isVerified: 1 })

const Driver: Model<IDriverDoc> =
  mongoose.models.Driver ?? mongoose.model<IDriverDoc>('Driver', DriverSchema)

export default Driver