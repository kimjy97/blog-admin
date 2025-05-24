import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User, { IUser } from '@/models/User';
import mongoose from 'mongoose';

function extractIdFromRequest(request: NextRequest): string | null {
  return request.nextUrl.pathname.split('/').pop() ?? null;
}

// GET: 특정 ID의 사용자 조회
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const id = extractIdFromRequest(request);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: '유효하지 않은 ID 형식입니다.' }, { status: 400 });
    }

    const user = await User.findById(id)
      .select('-password')
      .populate('posts', 'title slug status publishedAt')
      .populate({
        path: 'comments',
        select: 'content post isApproved createdAt',
        populate: {
          path: 'post',
          select: 'title slug'
        }
      })
      .lean();

    if (!user) {
      return NextResponse.json({ success: false, error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: 특정 ID의 사용자 수정
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const id = extractIdFromRequest(request);
    const body = await request.json();
    const { username, email, password, name, role, profileImage, bio, isActive } = body as Partial<IUser>;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: '유효하지 않은 ID 형식입니다.' }, { status: 400 });
    }

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return NextResponse.json({ success: false, error: '수정할 사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (email && userToUpdate.email !== email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json({ success: false, error: '이미 사용 중인 이메일입니다.' }, { status: 400 });
      }
      userToUpdate.email = email;
    }

    if (username && userToUpdate.username !== username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return NextResponse.json({ success: false, error: '이미 사용 중인 사용자명입니다.' }, { status: 400 });
      }
      userToUpdate.username = username;
    }

    if (password) userToUpdate.password = password;
    if (name) userToUpdate.name = name;
    if (role) userToUpdate.role = role;
    if (profileImage !== undefined) userToUpdate.profileImage = profileImage;
    if (bio !== undefined) userToUpdate.bio = bio;
    if (isActive !== undefined) userToUpdate.isActive = isActive;

    await userToUpdate.save();

    const updatedUserResponse = userToUpdate.toObject();
    delete updatedUserResponse.password;

    return NextResponse.json({ success: true, data: updatedUserResponse });
  } catch (error: any) {
    if (error.code === 11000) {
      let field = Object.keys(error.keyPattern)[0];
      field = field === 'email' ? '이메일' : '사용자명';
      return NextResponse.json({ success: false, error: `이미 사용 중인 ${field}입니다.` }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: 특정 ID의 사용자 삭제
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const id = extractIdFromRequest(request);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: '유효하지 않은 ID 형식입니다.' }, { status: 400 });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ success: false, error: '삭제할 사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: '사용자가 성공적으로 삭제되었습니다.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
