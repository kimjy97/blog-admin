import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Post, { IPost } from '@/models/Post';
import mongoose from 'mongoose';
import { revalidateCache } from '@/lib/utils';

function extractIdFromRequest(request: NextRequest): string | null {
  const id = request.nextUrl.pathname.split('/').pop();
  return id ?? null;
}

// GET: 특정 ID의 게시글 조회
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const id = extractIdFromRequest(request);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: '유효하지 않은 게시글 ID입니다.' }, { status: 400 });
    }

    const post = await Post.findById(id).lean();

    if (!post) {
      return NextResponse.json({ success: false, error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ success: false, error: error.message || '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// PUT: 특정 ID의 게시글 수정
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const id = extractIdFromRequest(request);
    const body = await request.json();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: '유효하지 않은 게시글 ID입니다.' }, { status: 400 });
    }

    const updateData = body as Partial<IPost>;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: '수정할 내용이 없습니다.' }, { status: 400 });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedPost) {
      return NextResponse.json({ success: false, error: '게시글을 찾을 수 없거나 업데이트에 실패했습니다.' }, { status: 404 });
    }

    // 게시물 수정 후 캐시 무효화
    await revalidateCache();

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error: any) {
    console.error('Error updating post:', error);
    if (error.code === 11000 && error.keyPattern?.slug) {
      return NextResponse.json(
        { success: false, error: '이미 사용 중인 슬러그입니다. 다른 슬러그를 사용해주세요.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: error.message || '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// DELETE: 특정 ID의 게시글 삭제
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const id = extractIdFromRequest(request);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: '유효하지 않은 게시글 ID입니다.' }, { status: 400 });
    }

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return NextResponse.json({ success: false, error: '게시글을 찾을 수 없거나 삭제에 실패했습니다.' }, { status: 404 });
    }

    // 게시물 삭제 후 캐시 무효화
    await revalidateCache();

    return NextResponse.json({ success: true, message: '게시글이 성공적으로 삭제되었습니다.' });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ success: false, error: error.message || '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
