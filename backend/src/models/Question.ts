import mongoose, { Schema, Document } from 'mongoose';

export interface IOption {
  text: string;
  isCorrect: boolean;
}

export interface IQuestion extends Document {
  pathology: mongoose.Types.ObjectId;
  questionText: string;
  type: 'QCM' | 'QCD';
  options: IOption[];
  explanation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema(
  {
    pathology: {
      type: Schema.Types.ObjectId,
      ref: 'Pathology',
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['QCM', 'QCD'],
      required: true,
    },
    options: [
      {
        text: String,
        isCorrect: Boolean,
      },
    ],
    explanation: {
      type: String,
      optional: true,
    },
  },
  { timestamps: true }
);

export const Question = mongoose.model<IQuestion>('Question', questionSchema);
