import mongoose, { Schema, Document } from 'mongoose';

export const GROUPES_MEDICAUX = [
  'Maladies infectieuses',
  'Cardiologie',
  'Pédiatrie',
  'Gastroentérologie',
  'Neurologie',
  'Pneumologie',
  'Endocrinologie',
  'Rhumatologie',
  'Dermatologie',
  'Néphrologie',
  'Gynécologie-Obstétrique',
  'Psychiatrie',
  'Urgences et réanimation',
  'Autres',
] as const;

export type GroupeMedical = (typeof GROUPES_MEDICAUX)[number];

export interface IPathology extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  definition: string;
  examinations: string;
  referentialDiagnosis: string;
  onSiteTreatment: string;
  dischargeOrder: string;
  prevention: string;
  references?: string;
  imageUrl?: string;
  isFree: boolean;
  groupe: string;
  createdAt: Date;
  updatedAt: Date;
}

const pathologySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    definition: {
      type: String,
      required: true,
    },
    examinations: {
      type: String,
      required: true,
    },
    referentialDiagnosis: {
      type: String,
      required: true,
    },
    onSiteTreatment: {
      type: String,
      required: true,
    },
    dischargeOrder: {
      type: String,
      required: true,
    },
    prevention: {
      type: String,
      required: true,
    },
    references: {
      type: String,
      optional: true,
    },
    imageUrl: {
      type: String,
      optional: true,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    groupe: {
      type: String,
      default: 'Autres',
      trim: true,
    },
  },
  { timestamps: true }
);

pathologySchema.index({ groupe: 1 });

export const Pathology = mongoose.model<IPathology>('Pathology', pathologySchema);
