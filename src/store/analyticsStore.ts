import { create } from 'zustand';
import { addDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface AnalyticsState {
  dateRange: DateRange | undefined;
  dataType: "전체 + 순 방문자" | "전체 방문자" | "순 방문자";
  includeLocal: boolean;
  setDateRange: (dateRange: DateRange | undefined) => void;
  setDataType: (dataType: "전체 + 순 방문자" | "전체 방문자" | "순 방문자") => void;
  setIncludeLocal: (includeLocal: boolean) => void;
}

const initialFromDate = (() => {
  const date = addDays(new Date(), -30);
  date.setHours(0, 0, 0, 0);
  return date;
})();
const initialToDate = (() => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
})();

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  dateRange: { from: initialFromDate, to: initialToDate },
  dataType: "전체 방문자",
  includeLocal: false,
  setDateRange: (newDateRange) => {
    const fromDate = newDateRange?.from ? new Date(newDateRange.from) : undefined;
    const toDate = newDateRange?.to ? new Date(newDateRange.to) : undefined;

    if (fromDate) {
      fromDate.setHours(0, 0, 0, 0);
    }
    if (toDate) {
      toDate.setHours(23, 59, 59, 999);
    }

    const result = { from: fromDate, to: toDate };
    set({ dateRange: result });
  },
  setDataType: (newDataType) => set({ dataType: newDataType }),
  setIncludeLocal: (newIncludeLocal) => set({ includeLocal: newIncludeLocal }),
}));
