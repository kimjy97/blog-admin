import mongoose, { Schema, Document } from 'mongoose';

export interface IGuestbookComment extends Document {
  _id: mongoose.Types.ObjectId;
  userIp: string;
  role: string;
  nickname: string;
  password?: string;
  content: string;
  isEdited: boolean;
  guestbookCommentId: number;
  createdAt: Date;
  updatedAt: Date;
}

const GuestbookCommentSchema: Schema = new Schema(
  {
    guestbookCommentId: {
      type: Number,
      required: true,
    },
    userIp: { type: String, required: true },
    role: { type: String, default: 'user' },
    nickname: { type: String, required: true },
    password: { type: String },
    content: { type: String, required: true },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'guestbookcomments',
  }
);

// guestbookCommentId 자동 생성 로직 (pre-save hook)
GuestbookCommentSchema.pre<IGuestbookComment>('save', async function (next) {
  if (this.isNew) {
    const commentModel = this.constructor as mongoose.Model<IGuestbookComment>;
    const lastComment = await commentModel.findOne({})
      .sort({ guestbookCommentId: -1 })
      .select('guestbookCommentId')
      .lean();
    this.guestbookCommentId = lastComment && typeof lastComment.guestbookCommentId === 'number' ? lastComment.guestbookCommentId + 1 : 1;
  }
  next();
});

export default mongoose.models.GuestbookComment || mongoose.model<IGuestbookComment>('GuestbookComment', GuestbookCommentSchema);
