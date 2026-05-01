import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  topic: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  parentMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema(
  {
    topic: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    parentMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      optional: true,
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model<IMessage>('Message', messageSchema);
