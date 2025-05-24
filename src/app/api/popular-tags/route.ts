import { NextRequest, NextResponse } from 'next/server';
import Post from '@/models/Post';
import { connectDB } from '@/lib/db';

export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  if (!startDateParam || !endDateParam) {
    return NextResponse.json({ error: 'startDate and endDate parameters are required' }, { status: 400 });
  }

  try {
    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format for startDate or endDate' }, { status: 400 });
    }

    endDate.setHours(23, 59, 59, 999);

    // 지표에 대한 가중치 정의
    const weightViews = 1;
    const weightLikes = 2;
    const weightComments = 3;

    const popularTags = await Post.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
          tags: { $exists: true, $not: { $size: 0 } },
          status: true,
        },
      },
      {
        $unwind: '$tags',
      },
      {
        $group: {
          _id: '$tags',
          totalScore: {
            $sum: {
              $add: [
                { $multiply: ['$view', weightViews] },
                { $multiply: ['$like', weightLikes] },
                { $multiply: ['$cmtnum', weightComments] },
              ],
            },
          },
        },
      },
      {
        $sort: { totalScore: -1 },
      },
    ]);

    const formattedTags = popularTags.map(tag => ({
      name: tag._id,
      count: tag.totalScore,
    }));

    return NextResponse.json({ success: true, data: formattedTags });

  } catch (error) {
    console.error('Error fetching popular tags:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
