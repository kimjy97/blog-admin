import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Visit from '@/models/Visit';

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
        const startDate = new Date(startDateParam);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(endDateParam);
        endDate.setHours(23, 59, 59, 999);

        query.date = {
          $gte: startDate,
          $lte: endDate,
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
        const startDate = new Date(startDateParam);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(endDateParam);
        endDate.setHours(23, 59, 59, 999);
        matchConditions.date = {
          $gte: startDate,
          $lte: endDate,
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

      let isTotalQuery = false;
      let days = 7;

      if (daysParam) {
        const parsedDays = parseInt(daysParam, 10);
        if (parsedDays <= 0) {
          isTotalQuery = true;
        } else {
          days = parsedDays;
        }
      } else {
        isTotalQuery = true;
      }

      if (!isTotalQuery) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days + 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        matchConditions.date = {
          $gte: startDate,
          $lte: endDate,
        };
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

      let resultData = dailyVisits;

      if (!isTotalQuery && daysParam) {
        const kstReferenceDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));

        const filledResult = [];
        for (let i = 0; i < days; i++) {
          const targetDate = new Date(kstReferenceDate);
          targetDate.setDate(kstReferenceDate.getDate() - (days - 1) + i);
          targetDate.setHours(0, 0, 0, 0);

          const year = targetDate.getFullYear();
          const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
          const day = targetDate.getDate().toString().padStart(2, '0');
          const formattedKstDate = `${year}-${month}-${day}`;

          const foundVisit = dailyVisits.find(
            (visit) => {
              const visitDate = new Date(visit.date);
              const visitYear = visitDate.getFullYear();
              const visitMonth = (visitDate.getMonth() + 1).toString().padStart(2, '0');
              const visitDay = visitDate.getDate().toString().padStart(2, '0');
              return `${visitYear}-${visitMonth}-${visitDay}` === formattedKstDate;
            }
          );

          filledResult.push({
            date: formattedKstDate,
            views: foundVisit ? foundVisit.views : 0,
            uniqueVisitors: foundVisit ? foundVisit.uniqueVisitors : 0,
          });
        }
        resultData = filledResult;
      } else if (isTotalQuery) {
        resultData = dailyVisits.map(visit => {
          const visitDate = new Date(visit.date);
          const year = visitDate.getFullYear();
          const month = (visitDate.getMonth() + 1).toString().padStart(2, '0');
          const day = visitDate.getDate().toString().padStart(2, '0');
          return {
            date: `${year}-${month}-${day}`,
            views: visit.views,
            uniqueVisitors: visit.uniqueVisitors,
          };
        });
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
