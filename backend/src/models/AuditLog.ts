import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  actorId?: mongoose.Types.ObjectId;
  actorEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    actorEmail: { type: String, required: false, trim: true, lowercase: true },
    action: { type: String, required: true, trim: true, index: true },
    resource: { type: String, required: true, trim: true, index: true },
    resourceId: { type: String, required: false, trim: true },
    details: { type: Schema.Types.Mixed, required: false },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
