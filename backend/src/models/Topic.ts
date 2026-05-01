import mongoose, { Schema, Document } from 'mongoose';

export interface ITopic extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  pathology?: mongoose.Types.ObjectId;
  replyCount: number;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const topicSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pathology: {
      type: Schema.Types.ObjectId,
      ref: 'Pathology',
      optional: true,
    },
    replyCount: {
      type: Number,
      default: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

export const Topic = mongoose.model<ITopic>('Topic', topicSchema);
