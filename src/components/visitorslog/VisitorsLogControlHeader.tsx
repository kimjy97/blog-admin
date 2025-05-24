'use client'

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { useVisitorsLogStore } from "@/store/visitorsLogStore";
import { CalendarIcon, MinusCircleIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const VisitorsLogControlHeader = () => {
  const { dateRange, ipSearch, includeLocal, setIpSearch, setDateRange, setIncludeLocal } = useVisitorsLogStore();

  return (
    <div className="flex justify-between flex-wrap gap-4">
      <Input
        placeholder="IP 주소로 검색..."
        value={ipSearch}
        onChange={(e) => setIpSearch(e.target.value)}
        className="h-9 w-[12rem]"
      />
      <div className="flex items-center gap-3">
        <Toggle
          aria-label="Toggle local IP exclusion"
          pressed={includeLocal}
          onPressedChange={setIncludeLocal}
          variant="outline"
          className="px-3"
        >
          <MinusCircleIcon className="text-foreground size-4" />
          로컬 IP 포함
        </Toggle>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[15rem] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "y. MM. dd", { locale: ko })} -{" "}
                    {format(dateRange.to, "y. MM. dd", { locale: ko })}
                  </>
                ) : (
                  format(dateRange.from, "y. MM. dd", { locale: ko })
                )
              ) : (
                <span>날짜 선택</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              locale={ko}
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export default VisitorsLogControlHeader;