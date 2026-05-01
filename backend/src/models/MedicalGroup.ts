import mongoose, { Document, Schema } from 'mongoose';

export interface IMedicalGroup extends Document {
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const medicalGroupSchema = new Schema<IMedicalGroup>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, required: false, trim: true },
  },
  { timestamps: true },
);

export const MedicalGroup = mongoose.model<IMedicalGroup>('MedicalGroup', medicalGroupSchema);
