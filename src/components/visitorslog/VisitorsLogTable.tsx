"use client"

import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchRecentVisitLogs, VisitLogData } from "@/lib/api"
import { formatDate, getISODateString } from "@/utils/formatDate"
import { isLocalIp } from "@/utils/isLocalIp"
import { getBrowserName } from "@/utils/getBrowserName"
import { useMemo, useState } from "react";
import { useVisitorsLogStore } from "@/store/visitorsLogStore";
import useSearchIPModalStore from "@/store/searchIPModalStore";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import SearchIPModal from "@/components/modals/SearchIPModal";
import { Button } from "@/components/ui/button";
import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/solid"

export function VisitorsLogTable({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const { dateRange, includeLocal, ipSearch, setIpSearch } = useVisitorsLogStore();
  const { setIsSearchIPModalOpen, setSearchIP } = useSearchIPModalStore();
  const [hideIp, setHideIp] = useState(false);
  const startDate = dateRange?.from;
  const endDate = dateRange?.to;

  const {
    data: visitLogsResponse,
    isLoading,
    isError,
    error,
  } = useQuery<any, Error, { success: boolean; data: VisitLogData[] }>({
    queryKey: ["visitLogs", getISODateString(startDate)?.split('T')[0], getISODateString(endDate)?.split('T')[0]],
    queryFn: () => {
      if (!dateRange?.from || !dateRange?.to) {
        return Promise.resolve({ success: true, data: [] });
      }
      return fetchRecentVisitLogs(
        1000,
        getISODateString(dateRange.from),
        getISODateString(dateRange.to)
      );
    },
    enabled: !!startDate && !!endDate,
  });

  const displayedLogs = useMemo(() => {
    let logs = visitLogsResponse?.data ?? []
    if (ipSearch) {
      logs = logs.filter((log) =>
        log.ip.toLowerCase().includes(ipSearch.toLowerCase())
      )
    }
    if (!includeLocal) {
      logs = logs.filter((log) => !isLocalIp(log.ip))
    }
    return logs
  }, [visitLogsResponse, ipSearch, includeLocal])

  return (
    <div className={cn("w-full space-y-4 mb-20", className)}>
      {isLoading ? (
        <div className="text-center text-sm text-muted-foreground py-12" />
      ) : isError ? (
        <div className="text-center text-sm text-destructive py-12">
          데이터를 불러오지 못했습니다: {error?.message}
        </div>
      ) : displayedLogs.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-12">
          {ipSearch || !includeLocal
            ? "조건에 맞는 방문 로그가 없습니다."
            : "선택된 기간에 표시할 방문 로그가 없습니다."}
        </div>
      ) : (
        <div>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[280px] font-bold px-2">날짜</TableHead>
                <TableHead className="w-[280px] font-bold px-2 flex items-center gap-1">
                  IP 주소
                  <button
                    type="button"
                    onClick={() => setHideIp(prev => !prev)}
                    className="ml-1 p-1 rounded-md hover:bg-foreground/10 cursor-pointer"
                    title={hideIp ? "IP 주소 보이기" : "IP 주소 가리기"}
                  >
                    {hideIp ? (
                      <EyeSlashIcon className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <EyeIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="w-[150px] font-bold px-2">경로</TableHead>
                <TableHead className="font-bold px-2">브라우저</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedLogs.map((log) => (
                <TableRow
                  key={log._id}
                  className={cn(
                    isLocalIp(log.ip) && "text-muted-foreground",
                    "group"
                  )}
                >
                  <TableCell className="px-2">{formatDate(log.date)}</TableCell>
                  <TableCell className="px-2 flex items-center">
                    <p className="mr-2">{hideIp ? '***.***.***.***' : log.ip}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 invisible group-hover:visible text-muted-foreground/40 hover:text-muted-foreground"
                      onClick={() => {
                        setIpSearch(log.ip);
                      }}
                    >
                      <MagnifyingGlassIcon className="size-4" />
                    </Button>
                    {!isLocalIp(log.ip) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 invisible group-hover:visible text-muted-foreground/40 hover:text-muted-foreground"
                        onClick={() => {
                          setIsSearchIPModalOpen(true);
                          setSearchIP(log.ip);
                        }}
                      >
                        <MapPinIcon className="size-4" />
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="truncate max-w-[200px] sm:max-w-none px-2">{log.pathname}</TableCell>
                  <TableCell className="truncate max-w-[200px] sm:max-w-none px-2">
                    {getBrowserName(log.userAgent)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <SearchIPModal />
    </div>
  )
}
