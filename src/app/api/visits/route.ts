import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Visit from '@/models/Visit';

function formatDateToKST_YYYYMMDD(dateObj: Date): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(dateObj);
}

function getDateAtKSTMIdnight(dateString: string): Date {
  return new Date(`${dateString}T00:00:00+09:00`);
}


export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'stats';
    const daysParam = searchParams.get('days');
    const pathnamePattern = searchParams.get('pathname');
    const limit = parseInt(searchParams.get('limit') || '1000', 10);
    const sort = searchParams.get('sort') || '-date';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const includeLocalIpsParam = searchParams.get('includeLocalIps') || 'false';

    const includeLocalIps = includeLocalIpsParam !== 'false';

    if (type === 'logs') {
      const query: any = {};
      if (pathnamePattern) query.pathname = { $regex: pathnamePattern, $options: 'i' };

      if (startDateParam && endDateParam) {
        const startDateKST = getDateAtKSTMIdnight(startDateParam);

        const endDateKST = getDateAtKSTMIdnight(endDateParam);
        endDateKST.setHours(23, 59, 59, 999);

        query.date = {
          $gte: startDateKST,
          $lte: endDateKST,
        };
      }

      const logs = await Visit.find(query)
        .sort(sort)
        .limit(limit)
        .lean();

      return NextResponse.json({
        success: true,
        data: logs,
      });

    } else if (type === 'pathname-stats') {
      const matchConditions: any = {
        pathname: { $in: ['/', '/post', '/chat', 'other'] },
      };

      if (!includeLocalIps) {
        matchConditions.ip = {
          $nin: ['127.0.0.1', 'localhost', '::1'],
        };
      }

      if (startDateParam && endDateParam) {
        const startDateKST = getDateAtKSTMIdnight(startDateParam);

        const endDateKST = getDateAtKSTMIdnight(endDateParam);
        endDateKST.setHours(23, 59, 59, 999);

        matchConditions.date = {
          $gte: startDateKST,
          $lte: endDateKST,
        };
      }

      const pathnameStats = await Visit.aggregate([
        {
          $match: matchConditions,
        },
        {
          $group: {
            _id: "$pathname",
            count: { $sum: 1 },
            uniqueIps: { $addToSet: "$ip" }
          },
        },
        {
          $project: {
            _id: 0,
            pathname: "$_id",
            count: 1,
            uniqueCount: { $size: "$uniqueIps" }
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      const predefinedPathnames = ['/', '/post', '/chat', 'other'];
      const resultData = predefinedPathnames.map(pathname => {
        const foundStat = pathnameStats.find(stat => stat.pathname === pathname);
        return {
          pathname: pathname,
          count: foundStat ? foundStat.count : 0,
          uniqueCount: foundStat ? foundStat.uniqueCount : 0,
        };
      });

      return NextResponse.json({
        success: true,
        data: resultData,
      });

    } else {
      const matchConditions: any = {};

      if (!includeLocalIps) {
        matchConditions.ip = {
          $nin: ['127.0.0.1', 'localhost', '::1'],
        };
      }

      let useDateRangeFilter = false;
      let isTotalQueryForFallback = false;
      let daysForFallback = 7;

      if (startDateParam && endDateParam) {
        const startDateKST = getDateAtKSTMIdnight(startDateParam);
        const endDateKST = getDateAtKSTMIdnight(endDateParam);
        endDateKST.setHours(23, 59, 59, 999);

        matchConditions.date = {
          $gte: startDateKST,
          $lte: endDateKST,
        };
        useDateRangeFilter = true;
      } else {
        if (daysParam) {
          const parsedDays = parseInt(daysParam, 10);
          if (parsedDays <= 0) {
            isTotalQueryForFallback = true;
          } else {
            daysForFallback = parsedDays;
          }
        } else {
          isTotalQueryForFallback = true;
        }

        if (!isTotalQueryForFallback) {
          const todayKSTString = formatDateToKST_YYYYMMDD(new Date());
          const nowKST = getDateAtKSTMIdnight(todayKSTString);

          const endDate = new Date(nowKST);
          endDate.setHours(23, 59, 59, 999);

          const startDate = new Date(nowKST);
          startDate.setDate(nowKST.getDate() - daysForFallback + 1);
          startDate.setHours(0, 0, 0, 0);

          matchConditions.date = {
            $gte: startDate,
            $lte: endDate,
          };
        }
      }

      if (pathnamePattern) {
        matchConditions.pathname = pathnamePattern;
      }

      const aggregationPipeline: any[] = [
        {
          $match: matchConditions,
        },
        {
          $group: {
            _id: {
              year: { $year: { date: '$date', timezone: 'Asia/Seoul' } },
              month: { $month: { date: '$date', timezone: 'Asia/Seoul' } },
              day: { $dayOfMonth: { date: '$date', timezone: 'Asia/Seoul' } },
            },
            count: { $sum: 1 },
            uniqueIps: { $addToSet: "$ip" }
          },
        },
        {
          $project: {
            _id: 0,
            date: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: '$_id.day',
                timezone: 'Asia/Seoul',
              },
            },
            views: "$count",
            uniqueVisitors: { $size: "$uniqueIps" },
          },
        },
        {
          $sort: { date: 1 },
        },
      ];

      const dailyVisits = await Visit.aggregate(aggregationPipeline);
      let resultData;

      if (useDateRangeFilter) {
        const startDateKST = getDateAtKSTMIdnight(startDateParam!);
        const endDateKST = getDateAtKSTMIdnight(endDateParam!);
        const filledResult = [];
        const currentDate = new Date(startDateKST);

        while (currentDate <= endDateKST) {
          const formattedCurrentDate = formatDateToKST_YYYYMMDD(currentDate);
          const foundVisit = dailyVisits.find(
            (visit) => formatDateToKST_YYYYMMDD(visit.date) === formattedCurrentDate
          );
          filledResult.push({
            date: formattedCurrentDate,
            views: foundVisit ? foundVisit.views : 0,
            uniqueVisitors: foundVisit ? foundVisit.uniqueVisitors : 0,
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        resultData = filledResult;
      } else if (!isTotalQueryForFallback && daysParam && parseInt(daysParam, 10) > 0) {
        const numDaysToFill = parseInt(daysParam, 10);
        const todayKSTString = formatDateToKST_YYYYMMDD(new Date());
        const kstCurrentDay = getDateAtKSTMIdnight(todayKSTString);
        const filledResult = [];

        for (let i = 0; i < numDaysToFill; i++) {
          const targetKstDate = new Date(kstCurrentDay);
          targetKstDate.setDate(kstCurrentDay.getDate() - (numDaysToFill - 1) + i);
          const formattedTargetKstDate = formatDateToKST_YYYYMMDD(targetKstDate);

          const foundVisit = dailyVisits.find(
            (visit) => formatDateToKST_YYYYMMDD(visit.date) === formattedTargetKstDate
          );
          filledResult.push({
            date: formattedTargetKstDate,
            views: foundVisit ? foundVisit.views : 0,
            uniqueVisitors: foundVisit ? foundVisit.uniqueVisitors : 0,
          });
        }
        resultData = filledResult;
      } else {
        resultData = dailyVisits.map(visit => ({
          date: formatDateToKST_YYYYMMDD(visit.date),
          views: visit.views,
          uniqueVisitors: visit.uniqueVisitors,
        }));
      }

      return NextResponse.json({
        success: true,
        data: resultData,
      });
    }
  } catch (error: any) {
    console.error('Error fetching visits:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
