import mongoose, { Schema, Document } from 'mongoose';

export type TrainingMode = 'QCM' | 'QCD' | 'all';
export type TrainingSessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface ITrainingOptionSnapshot {
  text: string;
}

export interface ITrainingQuestionSnapshot {
  question: mongoose.Types.ObjectId;
  pathologyId: mongoose.Types.ObjectId;
  pathologyTitle: string;
  pathologySlug: string;
  questionText: string;
  type: 'QCM' | 'QCD';
  options: ITrainingOptionSnapshot[];
  correctOptionIndex: number;
  selectedOptionIndex?: number;
  isCorrect?: boolean;
  explanation?: string;
  answeredAt?: Date;
}

export interface ITrainingSession extends Document {
  user: mongoose.Types.ObjectId;
  mode: TrainingMode;
  limit: number;
  status: TrainingSessionStatus;
  startedAt: Date;
  completedAt?: Date;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  scorePercentage: number;
  durationSeconds?: number;
  questions: ITrainingQuestionSnapshot[];
  createdAt: Date;
  updatedAt: Date;
}

const trainingOptionSnapshotSchema = new Schema<ITrainingOptionSnapshot>(
  {
    text: { type: String, required: true },
  },
  { _id: false },
);

const trainingQuestionSnapshotSchema = new Schema<ITrainingQuestionSnapshot>(
  {
    question: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    pathologyId: {
      type: Schema.Types.ObjectId,
      ref: 'Pathology',
      required: true,
    },
    pathologyTitle: {
      type: String,
      required: true,
    },
    pathologySlug: {
      type: String,
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
    options: {
      type: [trainingOptionSnapshotSchema],
      required: true,
    },
    correctOptionIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    selectedOptionIndex: {
      type: Number,
      required: false,
      min: 0,
    },
    isCorrect: {
      type: Boolean,
      required: false,
    },
    explanation: {
      type: String,
      required: false,
    },
    answeredAt: {
      type: Date,
      required: false,
    },
  },
  { _id: false },
);

const trainingSessionSchema = new Schema<ITrainingSession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mode: {
      type: String,
      enum: ['QCM', 'QCD', 'all'],
      required: true,
    },
    limit: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    completedAt: {
      type: Date,
      required: false,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 0,
    },
    answeredCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    correctCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    scorePercentage: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    durationSeconds: {
      type: Number,
      required: false,
      min: 0,
    },
    questions: {
      type: [trainingQuestionSnapshotSchema],
      required: true,
      default: [],
    },
  },
  { timestamps: true },
);

trainingSessionSchema.index({ user: 1, startedAt: -1 });
trainingSessionSchema.index({ user: 1, status: 1, startedAt: -1 });

export const TrainingSession = mongoose.model<ITrainingSession>('TrainingSession', trainingSessionSchema);
