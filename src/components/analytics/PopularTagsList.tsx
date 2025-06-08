'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchPopularTags, PopularTagData, ApiResponse } from '@/lib/api';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { format } from 'date-fns';
import { ko } from "date-fns/locale";
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getISODateString } from '@/utils/formatDate';

export function PopularTagsList() {
  const { dateRange } = useAnalyticsStore();
  const startDate = dateRange?.from;
  const endDate = dateRange?.to;

  const { data: queryData, isLoading, isError } = useQuery<ApiResponse<PopularTagData[]>, Error>({
    queryKey: ['popularTags', getISODateString(startDate)?.split('T')[0], getISODateString(endDate)?.split('T')[0]],
    queryFn: () => fetchPopularTags(getISODateString(startDate!), getISODateString(endDate!)),
    enabled: !!startDate && !!endDate,
  });

  const popularTags = queryData?.success ? queryData.data : [];

  return (
    <Card className="flex-1 pt-0 gap-0">
      <CardHeader className="flex flex-wrap items-center justify-between sm:gap-2 gap-6 border-b sm:py-6 py-3 sm:!h-auto h-16">
        <div className="grid gap-1 text-center sm:text-left">
          <CardTitle>태그 순위</CardTitle>
          <CardDescription className="sm:block hidden">
            {startDate && endDate
              ? `${format(startDate, "y. MM. dd", { locale: ko })} - ${format(endDate, "y. MM. dd", { locale: ko })}`
              : `날짜 범위를 선택해주세요.`}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6">
        {isLoading ? (
          <div className="text-center h-[15rem] text-sm text-muted-foreground py-12">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <div className="text-center text-sm text-destructive py-12">
            데이터를 불러오지 못했습니다.
          </div>
        ) : !popularTags || popularTags.length === 0 ? (
          <div className="text-center h-[15rem] text-sm text-muted-foreground py-12 flex items-center justify-center">
            선택된 기간에 대한 데이터가 없습니다.
          </div>
        ) : (
          <ul className="space-y-2 h-[15rem] overflow-y-auto scrollbar">
            {popularTags.map((tag, index) => (
              <li
                key={tag.name}
                className="flex items-center p-2 py-4 pr-4 border-b last:border-b-0 mb-0"
              >
                <span className="text-sm font-medium w-8 text-left">{index + 1}.</span>
                <span className="text-sm font-medium flex-1">{tag.name}</span>
                <span className="text-sm text-muted-foreground">
                  {tag.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
