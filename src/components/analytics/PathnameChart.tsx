"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Rectangle,
  XAxis,
  YAxis,
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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { fetchPathnameStats } from "@/lib/api"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { useAnalyticsStore } from "@/store/analyticsStore"
import { format } from 'date-fns';
import { ko } from "date-fns/locale"
import { useMemo, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getISODateString } from "@/utils/formatDate"

interface BarShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  payload?: { color: string };
}

const chartConfig = {
  "/": {
    label: "Home (/)",
    color: "var(--chart-1)",
  },
  "/post": {
    label: "Post (/post)",
    color: "var(--chart-2)",
  },
  "/chat": {
    label: "Chat (/chat)",
    color: "var(--chart-3)",
  },
  "other": {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

interface PathnameStat {
  pathname: string;
  count: number;
  uniqueCount: number;
}

interface PathnameApiResponse {
  success: boolean;
  data: PathnameStat[];
}

const PathnameChart = () => {
  const { dateRange, includeLocal } = useAnalyticsStore();
  const [dataType, setDataType] = useState<'전체 방문자' | '순 방문자'>('전체 방문자');
  const startDate = dateRange?.from;
  const endDate = dateRange?.to;

  const { data, isLoading, isError } = useQuery<PathnameApiResponse, Error, PathnameStat[]>({
    queryKey: ["pathnameStats", getISODateString(startDate)?.split('T')[0], getISODateString(endDate)?.split('T')[0], includeLocal],
    queryFn: () => fetchPathnameStats(getISODateString(startDate!), getISODateString(endDate!), includeLocal),
    enabled: !!startDate && !!endDate,
    select: (response) => response.data,
  });

  const chartData = useMemo(() => {
    if (!data) return []
    return data.map(item => ({
      ...item,
      color: chartConfig[item.pathname as keyof typeof chartConfig]?.color || chartConfig.other.color
    }));
  }, [data])

  const dataKey = dataType === '순 방문자' ? 'uniqueCount' : 'count';

  return (
    <Card className="flex-1 pt-0 gap-0">
      <CardHeader className="flex flex-wrap items-center justify-between sm:gap-2 gap-6 border-b sm:py-6 py-3 sm:!h-auto h-16">
        <div className="grid gap-1 text-center sm:text-left">
          <CardTitle>경로별 {dataType === '전체 방문자' ? '방문' : '순 방문'} 통계</CardTitle>
          <CardDescription className="sm:block hidden">
            {startDate && endDate
              ? `${format(startDate, "y. MM. dd", { locale: ko })} - ${format(endDate, "y. MM. dd", { locale: ko })}`
              : `날짜 범위를 선택해주세요.`}
          </CardDescription>
        </div>
        <Select value={dataType} onValueChange={(v) => setDataType(v as "전체 방문자" | "순 방문자")}>
          <SelectTrigger className="rounded-lg h-8 w-auto">
            <SelectValue placeholder="방문자 타입" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="전체 방문자">전체 방문자</SelectItem>
            <SelectItem value="순 방문자">순 방문자</SelectItem>
          </SelectContent>
        </Select>
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
        ) : !chartData || chartData.length === 0 ? (
          <div className="text-center h-[15rem] text-sm text-muted-foreground py-12 flex items-center justify-center">
            선택된 기간에 대한 데이터가 없습니다.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[15rem] w-full"
          >
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid horizontal={false} />
              <XAxis type="number" dataKey={dataKey} hide domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]} />
              <YAxis
                dataKey="pathname"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={60}
                tickFormatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label || value}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideIndicator />}
              />
              <Bar
                dataKey={dataKey}
                radius={[0, 4, 4, 0]}
                barSize={30}
                shape={(props: BarShapeProps) => {
                  const { x, y, width, height, payload } = props;
                  const color = payload?.color || props.fill;
                  return <Rectangle x={x} y={y} width={width} height={height} fill={color} radius={[0, 12, 12, 0]} />;
                }}
              >
                <LabelList
                  dataKey={dataKey}
                  position="right"
                  offset={10}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default PathnameChart;
