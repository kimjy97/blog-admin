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

/**
 * 블로그 캐시를 무효화합니다.
 * REVALIDATE_SECRET을 사용하여 NEXT_PUBLIC_BLOG_URL/api/revalidate로 POST 요청을 보냅니다.
 */
export const revalidateCache = async (): Promise<void> => {
  const revalidateSecret = process.env.REVALIDATE_SECRET;
  const blogUrl = process.env.NEXT_PUBLIC_BLOG_URL;

  if (!revalidateSecret) {
    console.warn('REVALIDATE_SECRET 환경변수가 설정되지 않았습니다.');
    return;
  }

  if (!blogUrl) {
    console.warn('NEXT_PUBLIC_BLOG_URL 환경변수가 설정되지 않았습니다.');
    return;
  }

  try {
    const response = await fetch(`${blogUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ secret: revalidateSecret }),
    });

    if (!response.ok) {
      throw new Error(`캐시 무효화 실패: ${response.status} ${response.statusText}`);
    }

  } catch (error) {
    console.error('캐시 무효화 중 오류 발생:', error);
    // 캐시 무효화 실패는 치명적이지 않으므로 에러를 던지지 않습니다.
  }
};
