import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAnswer extends Document {
  user: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  answer: string | number | boolean;
  isCorrect: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userAnswerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    answer: {
      type: Schema.Types.Mixed,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

export const UserAnswer = mongoose.model<IUserAnswer>('UserAnswer', userAnswerSchema);
