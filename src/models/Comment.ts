import mongoose, { Schema, Document } from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  postId: number;
  userIp: string;
  nickname: string;
  password?: string;
  content: string;
  parent?: mongoose.Types.ObjectId;
  commentId: number;
  isEdited: boolean;
  isShow: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    postId: {
      type: Number,
      ref: 'Post',
      required: true,
    },
    commentId: {
      type: Number,
      required: true,
      unique: true,
    },
    userIp: { type: String, required: true },
    nickname: { type: String, required: true },
    password: { type: String },
    content: { type: String, required: true },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isShow: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CommentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent',
});

// 댓글 저장 후 게시물의 댓글 수 업데이트
CommentSchema.post<IComment>('save', async function (doc) {
  const PostModel = mongoose.model('Post');
  await PostModel.findOneAndUpdate({ postId: doc.postId }, { $inc: { cmtnum: 1 } });
});

// 댓글 삭제 시 게시물의 댓글 수 업데이트
CommentSchema.post<IComment>('findOneAndDelete', async function (doc: IComment | null) {
  if (doc && doc.postId !== undefined) {
    const PostModel = mongoose.model('Post');
    await PostModel.findOneAndUpdate({ postId: doc.postId }, { $inc: { cmtnum: -1 } });
  }
});

const AutoIncrement = AutoIncrementFactory(mongoose as any);
CommentSchema.plugin(AutoIncrement as any, { inc_field: 'commentId' });

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
