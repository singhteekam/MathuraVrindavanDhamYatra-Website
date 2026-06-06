import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUserDoc extends Document {
  name: string
  email: string
  phone: string
  password?: string
  role: 'customer' | 'driver' | 'admin' | 'superadmin'
  avatar?: string
  isActive: boolean
  emailVerified?: Date
  otpCode?:          string
  otpExpiry?:        Date
  newsletterOptOut:  boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUserDoc>(
  {
    name:          { type: String, required: true, trim: true },
    email:         { type: String, required: true, lowercase: true, trim: true },
    phone:         { type: String, required: true, trim: true },
    password:      { type: String, select: false },   // excluded by default
    role:          { type: String, enum: ['customer', 'driver', 'admin', 'superadmin'], default: 'customer' },
    avatar:        { type: String },
    isActive:      { type: Boolean, default: true },
    emailVerified: { type: Date },
    otpCode:          { type: String },
    otpExpiry:        { type: Date },
    newsletterOptOut: { type: Boolean, default: false },
  },
  { timestamps: true },
)

// Indexes for fast lookups
UserSchema.index({ email: 1 })
UserSchema.index({ phone: 1 })
UserSchema.index({ role: 1 })

const User: Model<IUserDoc> =
  mongoose.models.User ?? mongoose.model<IUserDoc>('User', UserSchema)

export default User