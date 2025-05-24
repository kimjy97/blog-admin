import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  content: string;
  name: string;
  tags?: string[];
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
  view: number;
  cmtnum: number;
  like: number;
  postId: number;
}

const PostSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    name: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    status: { type: Boolean, required: true, default: false },
    view: { type: Number, default: 0 },
    cmtnum: { type: Number, default: 0 },
    like: { type: Number, default: 0 },
    postId: { type: Number, required: true, unique: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

PostSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'postId'
});


if (mongoose.models.Post) {
  mongoose.deleteModel('Post');
}
export default mongoose.model<IPost>('Post', PostSchema);
