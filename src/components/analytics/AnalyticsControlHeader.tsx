'use client'

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { CalendarIcon, MinusCircleIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const AnalyticsControlHeader = () => {
  const { dateRange, includeLocal, setDateRange, setIncludeLocal } = useAnalyticsStore();

  return (
    <div className="flex justify-between gap-4">
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
                  {format(dateRange.from, "y. MM. dd")} -{" "}
                  {format(dateRange.to, "y. MM. dd")}
                </>
              ) : (
                format(dateRange.from, "y. MM. dd")
              )
            ) : (
              <span>날짜 선택</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
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
  )
}

export default AnalyticsControlHeader;