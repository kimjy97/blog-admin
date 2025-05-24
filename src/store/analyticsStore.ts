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

const initialFromDate = addDays(new Date(), -30);
const initialToDate = new Date();

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  dateRange: { from: initialFromDate, to: initialToDate },
  dataType: "전체 방문자",
  includeLocal: false,
  setDateRange: (newDateRange) => set({ dateRange: newDateRange }),
  setDataType: (newDataType) => set({ dataType: newDataType }),
  setIncludeLocal: (newIncludeLocal) => set({ includeLocal: newIncludeLocal }),
}));
