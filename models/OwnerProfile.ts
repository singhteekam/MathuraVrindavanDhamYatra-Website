import mongoose from 'mongoose'

const BLString = { en: { type: String, default: '' }, hi: { type: String, default: '' } }

const OwnerProfileSchema = new mongoose.Schema(
  {
    name:         { type: BLString, default: () => ({ en: '', hi: '' }) },
    title:        { type: BLString, default: () => ({ en: '', hi: '' }) },
    bio:          { type: BLString, default: () => ({ en: '', hi: '' }) },
    photo:        { type: String,   default: '' },
    phone:        { type: String,   default: '' },
    email:        { type: String,   default: '' },
    whatsapp:     { type: String,   default: '' },
    experience:   { type: Number,   default: 0  },
    achievements: [{ en: { type: String, default: '' }, hi: { type: String, default: '' } }],
    socialLinks: {
      instagram: { type: String, default: '' },
      facebook:  { type: String, default: '' },
      youtube:   { type: String, default: '' },
      twitter:   { type: String, default: '' },
    },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export interface IOwnerProfile {
  name:         { en: string; hi: string }
  title:        { en: string; hi: string }
  bio:          { en: string; hi: string }
  photo:        string
  phone:        string
  email:        string
  whatsapp:     string
  experience:   number
  achievements: { en: string; hi: string }[]
  socialLinks: {
    instagram: string
    facebook:  string
    youtube:   string
    twitter:   string
  }
  isVisible: boolean
}

const OwnerProfile =
  mongoose.models.OwnerProfile ?? mongoose.model('OwnerProfile', OwnerProfileSchema)

export default OwnerProfile
