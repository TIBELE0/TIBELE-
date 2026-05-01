import mongoose, { Document, Schema } from 'mongoose';

export interface ISiteSetting extends Document {
  key: 'global';
  siteName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  registrationsOpen: boolean;
  messageMaintenance: string;
  primaryColor: string;
  secondaryColor: string;
  donationUrl: string;
  donationPopupIntervalMinutes: number;
  updatedAt: Date;
  createdAt: Date;
}

const siteSettingSchema = new Schema<ISiteSetting>(
  {
    key: {
      type: String,
      enum: ['global'],
      default: 'global',
      unique: true,
      index: true,
    },
    siteName: {
      type: String,
      default: 'TIBELE Admin',
      trim: true,
    },
    supportEmail: {
      type: String,
      default: 'support@tibele.local',
      trim: true,
      lowercase: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    registrationsOpen: {
      type: Boolean,
      default: true,
    },
    messageMaintenance: {
      type: String,
      default: 'Maintenance en cours. Merci de revenir plus tard.',
      trim: true,
      maxlength: 500,
    },
    primaryColor: {
      type: String,
      default: '#0b3b5a',
      trim: true,
    },
    secondaryColor: {
      type: String,
      default: '#2e8b57',
      trim: true,
    },
    donationUrl: {
      type: String,
      default: 'https://pay.djamo.com/o5y88',
      trim: true,
    },
    donationPopupIntervalMinutes: {
      type: Number,
      default: 5,
      min: 1,
      max: 120,
    },
  },
  { timestamps: true }
);

export const SiteSetting = mongoose.model<ISiteSetting>('SiteSetting', siteSettingSchema);
