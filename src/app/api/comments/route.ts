import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Comment, { IComment } from '@/models/Comment';
import Post from '@/models/Post';
import mongoose from 'mongoose';
import { buildCommonMatchConditions } from '@/lib/utils';

const POST_TYPES = {
  DASHBOARD: 'dashboard',
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const postId = searchParams.get('postId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sort = searchParams.get('sort') || '-createdAt';
    const populatePost = searchParams.get('populatePost') === 'true';

    const query: any = {
      ...buildCommonMatchConditions(searchParams)
    };
    if (postId) {
      query.postId = parseInt(postId, 10);
    } else if (populatePost) {
      query.postId = { $type: 'number' };
    }

    if (type === POST_TYPES.DASHBOARD) {
      const totalCommentsCount = await Comment.countDocuments({});
      const todayCommentsCount = await Comment.countDocuments(query);

      return NextResponse.json({
        success: true,
        totalCommentsCount,
        todayCommentsCount,
      });
    }

    const initialComments = await Comment.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    let populatedComments = initialComments;

    if (populatePost && initialComments.length > 0) {
      const commentPostIds = initialComments.map(comment => comment.postId).filter(id => typeof id === 'number');

      if (commentPostIds.length > 0) {
        const posts = await Post.find({ postId: { $in: commentPostIds } }).lean();
        const postsMap = new Map(posts.map(post => [post.postId, post]));

        populatedComments = initialComments.map(comment => {
          const postInfo = postsMap.get(comment.postId as number);
          return {
            ...comment,
            post: postInfo ? postInfo : comment.postId,
          };
        });
      }
    }

    const totalCommentsInQuery = await Comment.countDocuments(query);
    const totalAllComments = await Comment.countDocuments(postId ? { postId: parseInt(postId, 10) } : {});

    return NextResponse.json({
      success: true,
      data: populatedComments,
      totalPages: Math.ceil(totalCommentsInQuery / limit),
      currentPage: page,
      totalCommentsInQuery,
      totalAllComments,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      postId: postIdString,
      userIp,
      nickname,
      password,
      content,
      parent
    } = body as Partial<Omit<IComment, 'commentId'>> & { postId: string };

    const postId: number = parseInt(postIdString, 10);

    if (isNaN(postId) || !content || !nickname || !userIp) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 입력값입니다. 내용, 게시물 ID, 닉네임, IP 주소는 필수이며 게시물 ID는 숫자여야 합니다.' },
        { status: 400 }
      );
    }

    if (parent && !parent.toString().match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ success: false, error: '유효하지 않은 부모 댓글 ID 형식입니다.' }, { status: 400 });
    }

    const existingPost = await Post.findOne({ postId: postId });
    if (!existingPost) {
      return NextResponse.json({ success: false, error: '존재하지 않는 게시물입니다.' }, { status: 404 });
    }

    if (parent) {
      const existingParentComment = await Comment.findById(parent);
      if (!existingParentComment) {
        return NextResponse.json({ success: false, error: '존재하지 않는 부모 댓글입니다.' }, { status: 404 });
      }
      if ((existingParentComment.postId as any) !== (postId as any)) {
        return NextResponse.json({ success: false, error: '부모 댓글이 현재 게시물의 댓글이 아닙니다.' }, { status: 400 });
      }
    }

    const hashedPassword = password;

    const newCommentData: Partial<IComment> = {
      postId: postId,
      userIp,
      nickname,
      content,
      parent: parent ? new mongoose.Types.ObjectId(parent) : undefined,
    };

    if (hashedPassword) {
      newCommentData.password = hashedPassword;
    }

    const newComment = new Comment(newCommentData);

    await newComment.save();
    return NextResponse.json({ success: true, data: newComment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
