"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserGroupIcon, ArrowRightIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRecentVisitLogs, VisitLogData } from "@/lib/api";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import { getBrowserName } from "@/utils/getBrowserName";
import { useRouter } from "next/navigation";

const LOCAL_IPS = ['127.0.0.1', '::1', 'localhost'];

function isLocalIp(ip: string): boolean {
  return LOCAL_IPS.includes(ip);
}

export default function RecentLogTable() {
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);
  const [timeFormat, setTimeFormat] = useState<'absolute' | 'relative'>('absolute');

  const {
    data: logsResponse,
    isLoading,
    error,
  } = useQuery<Awaited<ReturnType<typeof fetchRecentVisitLogs>>, Error, VisitLogData[]>({
    queryKey: ['dashboard', 'recentVisitLogs'],
    queryFn: () => fetchRecentVisitLogs(10),
    select: (data) => {
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || 'Failed to fetch recent logs');
    }
  });

  const logs = logsResponse || [];

  const toggleTimeFormat = () => {
    setTimeFormat(prev => prev === 'absolute' ? 'relative' : 'absolute');
  };

  useEffect(() => {
    if (isLoading) {
      setShowContent(false);
    } else {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const formatToKST = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  };

  const renderCardHeader = () => (
    <CardHeader className={cn("transition-opacity duration-300 ease-in-out w-full", showContent ? "opacity-100" : "opacity-0")}>
      <div className="flex items-center justify-between h-full">
        <CardTitle className="flex items-center">
          <UserGroupIcon className="w-5 h-5 mr-2 inline-block align-text-bottom text-muted-foreground" />
          최근 접속자 로그
        </CardTitle>
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 cursor-pointer"
          onClick={() => router.push('/dashboard/visitorslog')}
        >
          전체보기
          <ArrowRightIcon className="w-4 h-4 ml-1" aria-hidden="true" />
        </button>
      </div>
    </CardHeader>
  );

  return (
    <Card className={cn("py-3 gap-4 flex flex-col group h-[25rem]", isLoading && !showContent ? "items-center justify-center" : "")}>
      {isLoading && !showContent ? (
        <LoadingSpinner />
      ) : (
        <>
          {renderCardHeader()}
          <CardContent className={cn("flex-1 overflow-hidden flex flex-col w-full transition-opacity duration-300 ease-in-out", showContent ? "opacity-100" : "opacity-0")}>
            {error ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-destructive">오류: {error.message}</p>
              </div>
            ) : logs.length === 0 && !isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">최근 접속 기록이 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-auto flex-1 hover-scrollbar">
                <table className="min-w-full w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-card">
                    <tr className="text-muted-foreground text-sm text-left">
                      <th className="px-2 py-1 font-semibold">IP</th>
                      <th className="px-2 py-1 font-semibold">브라우저</th>
                      <th className="px-2 py-1 font-semibold">경로</th>
                      <th
                        className="px-2 py-1 font-semibold cursor-pointer hover:text-foreground transition-colors flex items-center gap-1"
                        onClick={toggleTimeFormat}
                        title="클릭하여 시간 표시 형식 변경"
                      >
                        {timeFormat === 'absolute' ? '접속시각 (KST)' : '접속시각 (상대)'}
                        <ArrowsRightLeftIcon className="w-3 h-3 opacity-70" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log._id}
                        className={`hover:bg-foreground/5 border-b border-border last:border-b-0 rounded-lg ${isLocalIp(log.ip) ? 'text-muted-foreground' : ''}`}
                      >
                        <td className='px-2 py-2 font-mono text-xs whitespace-nowrap'>
                          {log.ip}
                        </td>
                        <td className="px-2 py-2 text-xs whitespace-nowrap">{getBrowserName(log.userAgent)}</td>
                        <td className="px-2 py-2 text-xs whitespace-nowrap">{log.pathname}</td>
                        <td className="px-2 py-2 text-xs whitespace-nowrap">
                          {timeFormat === 'absolute'
                            ? formatToKST(log.date)
                            : formatDistanceToNow(parseISO(log.date), { addSuffix: true, locale: ko })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}
