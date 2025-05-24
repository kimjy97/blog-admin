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

const initialFromDate = addDays(new Date(), -30);
const initialToDate = new Date();

export const useVisitorsLogStore = create<VisitorsLogState>((set) => ({
  dateRange: { from: initialFromDate, to: initialToDate },
  includeLocal: false,
  ipSearch: '',
  setDateRange: (newDateRange) => set({ dateRange: newDateRange }),
  setIncludeLocal: (newIncludeLocal) => set({ includeLocal: newIncludeLocal }),
  setIpSearch: (newIpSearch) => set({ ipSearch: newIpSearch }),
}));
