import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  fullName?: string;
  matricule: string;
  school: string;
  studyYear?: string;
  major: string;
  matriculeValidated: boolean;
  isBanned: boolean;
  role: 'user' | 'admin';
  isPaid?: boolean;
  subscriptionExpiryDate?: Date;
  refreshTokenHash?: string;
  refreshTokenExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      optional: true,
    },
    matricule: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    school: {
      type: String,
      required: true,
      trim: true,
    },
    studyYear: {
      type: String,
      optional: true,
      trim: true,
    },
    major: {
      type: String,
      required: true,
      trim: true,
    },
    matriculeValidated: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // Legacy fields kept for backward compatibility while migrating to donation-only model.
    isPaid: {
      type: Boolean,
      default: false,
    },
    subscriptionExpiryDate: {
      type: Date,
      optional: true,
    },
    refreshTokenHash: {
      type: String,
      optional: true,
      select: false,
    },
    refreshTokenExpiresAt: {
      type: Date,
      optional: true,
      select: false,
    },
  },
  { timestamps: true }
);

// Hard guard at DB level: only one document can have role='admin'.
userSchema.index(
  { role: 1 },
  {
    unique: true,
    partialFilterExpression: { role: 'admin' },
    name: 'unique_single_admin_role',
  }
);

// Additional app-level guard for save() operations.
userSchema.pre('save', async function enforceSingleAdminOnSave(next) {
  if (this.role !== 'admin') {
    next();
    return;
  }

  const existingAdmin = await mongoose.model('User').exists({
    role: 'admin',
    _id: { $ne: this._id },
  });

  if (existingAdmin) {
    next(new Error('Un seul compte administrateur est autorise'));
    return;
  }

  next();
});

// Additional app-level guard for findOneAndUpdate() role elevation.
userSchema.pre('findOneAndUpdate', async function enforceSingleAdminOnUpdate(next) {
  const update = this.getUpdate() as Record<string, any> | undefined;
  const nextRole = update?.role ?? update?.$set?.role;
  if (nextRole !== 'admin') {
    next();
    return;
  }

  const query = this.getQuery() as Record<string, any>;
  const target = await mongoose.model('User').findOne(query).select('_id role').lean();
  const targetId = (target as any)?._id;

  const existingAdmin = await mongoose.model('User').exists({
    role: 'admin',
    ...(targetId ? { _id: { $ne: targetId } } : {}),
  });

  if (existingAdmin) {
    next(new Error('Un seul compte administrateur est autorise'));
    return;
  }

  next();
});

export const User = mongoose.model<IUser>('User', userSchema);
