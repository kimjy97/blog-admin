"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
} from "recharts"
import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchChartVisits } from "@/lib/api"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { format, eachDayOfInterval, getDay } from 'date-fns';
import { useMemo, useState } from "react"
import { useAnalyticsStore } from "@/store/analyticsStore"
import { formatDate, getISODateString } from "@/utils/formatDate";

const DAY_ABBREVIATIONS = ['일', '월', '화', '수', '목', '금', '토'];

const chartConfig = {
  views: {
    label: "전체 방문",
    color: "hsl(var(--chart-1))",
  },
  uniqueVisitors: {
    label: "순 방문자",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function AnalyticsChart() {
  const { dateRange, dataType, includeLocal, setDataType } = useAnalyticsStore();
  const startDate = dateRange?.from;
  const endDate = dateRange?.to;

  const [chartType, setChartType] = useState<"area" | "bar">("bar")

  const { data: visitStatsResponse, isLoading, isError } = useQuery({
    queryKey: ["visits", getISODateString(startDate)?.split('T')[0], getISODateString(endDate)?.split('T')[0], includeLocal],
    queryFn: () => fetchChartVisits(getISODateString(startDate!), getISODateString(endDate!), includeLocal),
    enabled: !!startDate && !!endDate,
  })

  const visitStats = visitStatsResponse?.data || [];

  const chartData = useMemo(() => {
    if (isError || isLoading || !startDate || !endDate) return [];

    const dailyAggregatedData = new Map<string, { views: number, uniqueVisitors: number }>();

    visitStats.forEach(item => {
      const localDate = new Date(item.date);
      const dateKey = format(localDate, "yyyy-MM-dd");

      const existingData = dailyAggregatedData.get(dateKey) || { views: 0, uniqueVisitors: 0 };
      dailyAggregatedData.set(dateKey, {
        views: existingData.views + 1,
        uniqueVisitors: existingData.uniqueVisitors + (item.isUnique ? 1 : 0),
      });
    });

    const allDatesInRange = eachDayOfInterval({ start: startDate, end: endDate });

    const processedChartData: { date: string, views: number, uniqueVisitors: number }[] = [];

    allDatesInRange.forEach(currentDate => {
      const dateKey = format(currentDate, "yyyy-MM-dd");
      const foundData = dailyAggregatedData.get(dateKey);

      let formattedDateLabel: string;
      const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays <= 7) {
        formattedDateLabel = DAY_ABBREVIATIONS[getDay(currentDate)];
      } else {
        formattedDateLabel = format(currentDate, "MM.dd");
      }

      processedChartData.push({
        date: formattedDateLabel,
        views: foundData?.views || 0,
        uniqueVisitors: foundData?.uniqueVisitors || 0,
      });
    });

    return processedChartData;
  }, [visitStats, startDate, endDate, isLoading, isError])

  return (
    <Card className="w-full pt-0">
      <CardHeader className="flex flex-wrap items-center justify-between sm:gap-2 gap-6 border-b sm:py-6 py-3 sm:!h-auto h-16">
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <CardTitle>
            {dataType} 통계
          </CardTitle>
          <CardDescription className="sm:block hidden ml-auto">
            {startDate && endDate
              ? `${formatDate(startDate)} - ${formatDate(endDate)}`
              : `날짜 범위를 선택해주세요.`}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Select value={dataType} onValueChange={(v) => setDataType(v as "전체 + 순 방문자" | "전체 방문자" | "순 방문자")}>
            <SelectTrigger className="rounded-lg h-8 w-auto">
              <SelectValue placeholder="방문자 타입" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전체 + 순 방문자">전체 + 순 방문자</SelectItem>
              <SelectItem value="전체 방문자">전체 방문자</SelectItem>
              <SelectItem value="순 방문자">순 방문자</SelectItem>
            </SelectContent>
          </Select>
          <Select value={chartType} onValueChange={(v) => setChartType(v as "area" | "bar")}>
            <SelectTrigger className="w-[7.5rem] rounded-lg">
              <SelectValue placeholder="차트 타입" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="area">영역 차트</SelectItem>
              <SelectItem value="bar">막대 차트</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-0 sm:px-6">
        {isLoading ? (
          <div className="text-center h-[18rem] text-sm text-muted-foreground py-12">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <div className="text-center text-sm text-destructive py-12">
            데이터를 불러오지 못했습니다.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[18rem] w-full"
          >
            {chartType === "area" ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.1} />
                  </linearGradient>

                  <linearGradient id="filluniqueVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => value}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => value}
                      indicator="dot"
                    />
                  }
                />
                {(dataType === '전체 + 순 방문자' || dataType === '전체 방문자') &&
                  <Area
                    dataKey="views"
                    type="natural"
                    fill="url(#fillViews)"
                    stroke="var(--color-primary)"
                  />
                }
                {(dataType === '전체 + 순 방문자' || dataType === '순 방문자') &&
                  <Area
                    dataKey="uniqueVisitors"
                    type="natural"
                    fill="url(#filluniqueVisitors)"
                    stroke="var(--color-accent)"
                  />
                }
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  minTickGap={32}
                  tickFormatter={(value) => value}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => value}
                      indicator="dot"
                    />
                  }
                />
                {(dataType === '전체 + 순 방문자' || dataType === '순 방문자') &&
                  <Bar
                    dataKey="uniqueVisitors"
                    fill="var(--color-accent)"
                    name="순 방문자"
                    radius={[1, 1, 0, 0]}
                  />
                }
                {(dataType === '전체 + 순 방문자' || dataType === '전체 방문자') &&
                  <Bar
                    dataKey="views"
                    fill="var(--color-primary)"
                    name="전체 방문"
                    radius={[1, 1, 0, 0]}
                  />
                }
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            )}
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
