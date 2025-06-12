import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Visit, { IVisit } from '@/models/Visit';

interface LeanVisit extends IVisit {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const VISIT_TYPES = {
  DASHBOARD: 'dashboard',
  STATS: 'stats',
  LOGS: 'logs',
  PATHNAME_STATS: 'pathname-stats',
  CHART_STATS: 'chart-stats',
};

const LOCAL_IPS = ['127.0.0.1', 'localhost', '::1'];

const formatDateToYYYYMMDD = (dateObj: Date): string => {
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const buildCommonMatchConditions = (searchParams: URLSearchParams): any => {
  const matchConditions: any = {};
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');
  const includeLocalIpsParam = searchParams.get('includeLocalIps') || 'false';
  const includeLocalIps = includeLocalIpsParam !== 'false';

  if (!includeLocalIps) {
    matchConditions.ip = {
      $nin: LOCAL_IPS,
    };
  }

  if (startDateParam && endDateParam) {
    const cleanStartDateParam = new Date(startDateParam);
    const cleanEndDateParam = new Date(endDateParam);

    matchConditions.date = {
      $gte: cleanStartDateParam,
      $lte: cleanEndDateParam,
    };
  }
  return matchConditions;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type');
    const pathnamePattern = searchParams.get('pathname');
    const limit = parseInt(searchParams.get('limit') || '1000', 10);
    const sort = searchParams.get('sort') || '-date';

    const commonMatchConditions = buildCommonMatchConditions(searchParams);

    if (type === VISIT_TYPES.DASHBOARD) {
      const totalViews = await Visit.countDocuments({});
      const todayViews = await Visit.countDocuments(commonMatchConditions)
        .sort({ date: 1 })
        .lean() as unknown as LeanVisit[];

      return NextResponse.json({
        success: true,
        data: {
          totalViews: totalViews,
          todayViews: todayViews,
        }
      });
    }

    if (type === VISIT_TYPES.LOGS) {
      const query: any = { ...commonMatchConditions };
      if (pathnamePattern) query.pathname = { $regex: pathnamePattern, $options: 'i' };

      const logs = await Visit.find(query)
        .sort(sort)
        .limit(limit)
        .lean();

      const formattedLogs = logs.map(log => ({
        ...log,
        date: log.date ? log.date.toISOString() : null,
        createdAt: log.createdAt ? log.createdAt.toISOString() : null,
        updatedAt: log.updatedAt ? log.updatedAt.toISOString() : null,
      }));

      return NextResponse.json({
        success: true,
        data: formattedLogs,
      });

    } else if (type === VISIT_TYPES.PATHNAME_STATS) {
      const matchConditions: any = {
        ...commonMatchConditions,
        ...(pathnamePattern ? { pathname: pathnamePattern } : { pathname: { $in: ['/', '/post', '/chat', 'other'] } }),
      };

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

    } else if (type === VISIT_TYPES.CHART_STATS) {
      const visits = await Visit.find(commonMatchConditions)
        .sort({ date: 1 })
        .lean() as unknown as LeanVisit[];

      const dailyUniqueIps: { [key: string]: Set<string> } = {};
      const formattedVisits = visits.map(visit => {
        const visitDate = visit.date ? new Date(visit.date) : null;
        const dateKey = visitDate ? formatDateToYYYYMMDD(visitDate) : 'unknown';

        if (!dailyUniqueIps[dateKey]) {
          dailyUniqueIps[dateKey] = new Set();
        }

        const isUnique = !dailyUniqueIps[dateKey].has(visit.ip);
        dailyUniqueIps[dateKey].add(visit.ip);

        return {
          date: visitDate ? visitDate.toISOString() : null,
          isUnique: isUnique,
        };
      });

      return NextResponse.json({
        success: true,
        data: formattedVisits,
      });

    } else {
      const query: any = { ...commonMatchConditions };
      if (pathnamePattern) query.pathname = pathnamePattern;

      const visits = await Visit.find(query)
        .sort(sort)
        .lean() as unknown as LeanVisit[];

      const formattedVisits = visits.map(visit => ({
        _id: visit._id.toString(),
        date: visit.date ? visit.date.toISOString() : null,
        ip: visit.ip,
        pathname: visit.pathname,
        referrer: visit.referrer,
        userAgent: visit.userAgent,
        createdAt: visit.createdAt ? visit.createdAt.toISOString() : null,
        updatedAt: visit.updatedAt ? visit.updatedAt.toISOString() : null,
      }));

      return NextResponse.json({
        success: true,
        data: formattedVisits,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}