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
    if (newDateRange?.from) {
      newDateRange.from.setHours(0, 0, 0, 0);
    }
    if (newDateRange?.to) {
      newDateRange.to.setHours(23, 59, 59, 999);
    }
    set({ dateRange: newDateRange });
  },
  setIncludeLocal: (newIncludeLocal) => set({ includeLocal: newIncludeLocal }),
  setIpSearch: (newIpSearch) => set({ ipSearch: newIpSearch }),
}));
