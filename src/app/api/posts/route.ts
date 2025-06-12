import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Post, { IPost } from '@/models/Post';
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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const sort = searchParams.get('sort') || '-createdAt';
    const tag = searchParams.get('tag');
    const q = searchParams.get('q');
    const statusParam = searchParams.get('status');

    const query: any = {
      ...buildCommonMatchConditions(searchParams)
    };
    if (tag) query.tags = tag;
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    if (statusParam !== null) {
      query.status = statusParam === 'true';
    }

    if (type === POST_TYPES.DASHBOARD) {
      const totalPostsCount = await Post.countDocuments({});
      const draftPostsCount = await Post.countDocuments({ status: false });
      const todayPostsCount = await Post.countDocuments({ status: true, ...query });
      return NextResponse.json({
        success: true,
        totalPostsCount,
        todayPostsCount,
        draftPostsCount,
      });
    }

    const posts = await Post.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalPosts = await Post.countDocuments(query);

    let tagCounts = {};
    if (!tag && !q) {
      const allTagsAggregation = await Post.aggregate([
        { $match: { tags: { $exists: true, $ne: [] } } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $project: { _id: 0, tag: '$_id', count: 1 } },
        { $sort: { count: -1 } },
      ]);
      tagCounts = allTagsAggregation.reduce((acc, curr) => {
        if (curr.tag) {
          acc[curr.tag] = curr.count;
        }
        return acc;
      }, {});
    }

    return NextResponse.json({
      success: true,
      data: posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      totalPosts,
      tagCounts,
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
      title,
      content,
      description,
      tags,
      like,
      name,
      status: rawStatus,
      createdAt,
      updatedAt,
    } = body as Partial<IPost>;

    if (!title || !content || !description || !name) {
      return NextResponse.json(
        { success: false, error: '제목, 내용, 설명, 작성자 이름은 필수입니다.' },
        { status: 400 }
      );
    }

    const status = typeof rawStatus === 'boolean' ? rawStatus : Boolean(rawStatus);

    const counter = await mongoose.connection.collection('counters').findOneAndUpdate(
      { id: 'postId' },
      { $inc: { seq: 1 } },
      { returnDocument: 'after' }
    );

    if (!counter) {
      return NextResponse.json(
        { success: false, error: 'postId 카운터를 찾을 수 없습니다.' },
        { status: 500 }
      );
    }

    const newPostId = counter.seq;

    const newPost = new Post({
      title,
      content,
      description,
      tags,
      like: like || 0,
      postId: newPostId,
      name,
      status: status,
      createdAt: createdAt ? new Date(createdAt) : undefined,
      updatedAt: updatedAt ? new Date(updatedAt) : undefined,
    });

    await newPost.save();
    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
