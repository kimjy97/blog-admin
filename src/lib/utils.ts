import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const buildCommonMatchConditions = (searchParams: URLSearchParams): any => {
  const matchConditions: any = {};
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  if (startDateParam && endDateParam) {
    const cleanStartDateParam = new Date(startDateParam);
    const cleanEndDateParam = new Date(endDateParam);

    matchConditions.createdAt = {
      $gte: cleanStartDateParam,
      $lte: cleanEndDateParam,
    };
  }
  return matchConditions;
}
