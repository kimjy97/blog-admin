import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Comment, { IComment } from '@/models/Comment';
import Post from '@/models/Post';

function extractIdFromRequest(request: NextRequest): string | null {
  const id = request.nextUrl.pathname.split('/').pop();
  return id ?? null;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const id = extractIdFromRequest(request);

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ success: false, error: '유효하지 않은 ID 형식입니다.' }, { status: 400 });
    }

    const comment = await Comment.findById(id)
      .populate('postId', 'title')
      .populate({ path: 'parent' })
      .lean();

    if (!comment) {
      return NextResponse.json({ success: false, error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: comment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const id = extractIdFromRequest(request);
    const body = await request.json();
    const { content, nickname, isEdited, isShow } = body as Partial<Omit<IComment, 'password' | 'userIp' | 'postId'>>;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ success: false, error: '유효하지 않은 ID 형식입니다.' }, { status: 400 });
    }

    const originalComment = await Comment.findById(id).lean();

    if (!originalComment) {
      return NextResponse.json({ success: false, error: '수정할 댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    const updateData: Partial<IComment> = {};
    if (content !== undefined) updateData.content = content;
    if (nickname !== undefined) updateData.nickname = nickname;
    if (isEdited !== undefined) updateData.isEdited = isEdited;
    if (isShow !== undefined) updateData.isShow = isShow;

    if (content !== undefined) {
      updateData.isEdited = true;
    }
    if (body.isEdited !== undefined) {
      updateData.isEdited = body.isEdited;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: '업데이트할 내용이 없습니다.' }, { status: 400 });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedComment) {
      return NextResponse.json({ success: false, error: '수정할 댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    const originalIsShow = (originalComment as any).isShow;
    const updatedIsShow = (updatedComment as any).isShow;

    if (originalIsShow !== updatedIsShow && (updatedComment as any)?.postId) {
      const postId = (updatedComment as any).postId;
      if (updatedIsShow === true) {
        await Post.findOneAndUpdate({ postId: postId }, { $inc: { cmtnum: 1 } });
      } else {
        await Post.findOneAndUpdate({ postId: postId }, { $inc: { cmtnum: -1 } });
      }
    }

    return NextResponse.json({ success: true, data: updatedComment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const id = extractIdFromRequest(request);

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ success: false, error: '유효하지 않은 ID 형식입니다.' }, { status: 400 });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { $set: { isShow: false } },
      { new: true }
    ).lean();

    if (!updatedComment) {
      return NextResponse.json({ success: false, error: '삭제할 댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: '댓글이 성공적으로 삭제(비활성화)되었습니다.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
