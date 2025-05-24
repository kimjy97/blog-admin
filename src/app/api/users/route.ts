import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User, { IUser } from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sort = searchParams.get('sort') || '-createdAt';
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    const q = searchParams.get('q');

    const query: any = {};
    if (role) query.role = role;
    if (isActive !== null) query.isActive = isActive === 'true';
    if (q) {
      query.$or = [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
        { role: { $regex: q, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password')
      .lean();

    const totalUsers = await User.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: users,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      totalUsers,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { username, email, password, name, role, profileImage, bio, isActive } = body as Partial<IUser>;

    if (!username || !email || !password || !name) {
      return NextResponse.json(
        { success: false, error: '사용자명, 이메일, 비밀번호, 이름은 필수입니다.' },
        { status: 400 }
      );
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return NextResponse.json({ success: false, error: '이미 사용 중인 이메일입니다.' }, { status: 400 });
    }
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return NextResponse.json({ success: false, error: '이미 사용 중인 사용자명입니다.' }, { status: 400 });
    }

    const newUser = new User({
      username,
      email,
      password,
      name,
      role: role || 'subscriber',
      profileImage,
      bio,
      isActive: isActive === undefined ? true : isActive,
    });

    await newUser.save();
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json({ success: true, data: userResponse }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      let field = Object.keys(error.keyPattern)[0];
      field = field === 'email' ? '이메일' : '사용자명';
      return NextResponse.json({ success: false, error: `이미 사용 중인 ${field}입니다.` }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
