import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import GuestbookComment, { IGuestbookComment } from '@/models/GuestbookComment';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sort = searchParams.get('sort') || '-createdAt';

    const query: any = {};

    const comments = await GuestbookComment.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalComments = await GuestbookComment.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: comments,
      totalPages: Math.ceil(totalComments / limit),
      currentPage: page,
      totalComments,
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
      userIp,
      nickname,
      password,
      content,
      role,
    } = body as Partial<Omit<IGuestbookComment, 'guestbookCommentId' | 'createdAt' | 'updatedAt' | '_id' | 'isEdited'>>;

    if (!content || !nickname || !userIp) {
      return NextResponse.json(
        { success: false, error: '내용, 닉네임, IP 주소는 필수입니다.' },
        { status: 400 }
      );
    }

    const newCommentData: Partial<IGuestbookComment> = {
      userIp,
      nickname,
      content,
      role: role || 'user',
    };
    if (password) {
      newCommentData.password = password;
    }

    const newComment = new GuestbookComment(newCommentData);
    await newComment.save();
    return NextResponse.json({ success: true, data: newComment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
