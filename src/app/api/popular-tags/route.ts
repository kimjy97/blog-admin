import { NextRequest, NextResponse } from 'next/server';
import Post from '@/models/Post';
import { connectDB } from '@/lib/db';
import { getDateAtMidnightUTC } from '@/utils/formatDate';

export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  const matchQuery: any = {
    status: true,
    tags: { $exists: true, $not: { $size: 0 } },
  };

  if (startDateParam && endDateParam) {
    try {
      const cleanStartDateParam = startDateParam.split('T')[0];
      const cleanEndDateParam = endDateParam.split('T')[0];

      const startDate = getDateAtMidnightUTC(cleanStartDateParam);
      const endDate = getDateAtMidnightUTC(cleanEndDateParam);

      if (!startDate || !endDate) {
        return NextResponse.json(
          { success: false, message: 'Invalid startDate or endDate provided. Please use a valid date string (e.g., YYYY-MM-DD).' },
          { status: 400 }
        );
      }

      const endOfDayUTC = new Date(endDate);
      endOfDayUTC.setUTCHours(23, 59, 59, 999);

      matchQuery.createdAt = {
        $gte: startDate,
        $lte: endOfDayUTC,
      };
    } catch (error) {
      console.error('Error processing date parameters for UTC conversion:', error);
      return NextResponse.json({ success: false, message: 'Error processing date parameters. Please ensure they are valid date strings.' }, { status: 400 });
    }
  } else if (startDateParam || endDateParam) {
    return NextResponse.json({ success: false, message: 'Both startDate and endDate are required for date filtering, or neither to get all tags.' }, { status: 400 });
  }

  try {
    const weightViews = 1;
    const weightLikes = 2;
    const weightComments = 3;

    const popularTags = await Post.aggregate([
      {
        $match: matchQuery,
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
                { $ifNull: [{ $multiply: ['$view', weightViews] }, 0] },
                { $ifNull: [{ $multiply: ['$like', weightLikes] }, 0] },
                { $ifNull: [{ $multiply: ['$cmtnum', weightComments] }, 0] },
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

  } catch (error: any) {
    console.error('Error fetching popular tags:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
