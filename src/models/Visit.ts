import mongoose, { Schema, Document } from 'mongoose';

export interface IVisit extends Document {
  ip: string;
  pathname: string;
  date: Date;
  userAgent?: string;
  referrer?: string;
}

const VisitSchema: Schema = new Schema(
  {
    ip: {
      type: String,
      required: true,
    },
    pathname: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    userAgent: String,
    referrer: String,
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    versionKey: false,
    collection: 'visits',
  }
);

VisitSchema.index({ date: -1 });
VisitSchema.index({ pathname: 1, date: -1 });

export default mongoose.models.Visit || mongoose.model<IVisit>('Visit', VisitSchema);
