import { create } from 'zustand';
import { addDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface VisitorsLogState {
  dateRange: DateRange | undefined;
  includeLocal: boolean;
  ipSearch: string;
  setDateRange: (dateRange: DateRange | undefined) => void;
  setIncludeLocal: (includeLocal: boolean) => void;
  setIpSearch: (ipSearch: string) => void;
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

export const useVisitorsLogStore = create<VisitorsLogState>((set) => ({
  dateRange: { from: initialFromDate, to: initialToDate },
  includeLocal: false,
  ipSearch: '',
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
  setIncludeLocal: (newIncludeLocal) => set({ includeLocal: newIncludeLocal }),
  setIpSearch: (newIpSearch) => set({ ipSearch: newIpSearch }),
}));
