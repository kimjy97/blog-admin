export const getBrowserName = (userAgent: string | undefined): string => {
  if (!userAgent) {
    return '알 수 없음';
  }
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    return 'Chrome';
  }
  if (userAgent.includes('Firefox')) {
    return 'Firefox';
  }
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return 'Safari';
  }
  if (userAgent.includes('Edg')) {
    return 'Edge';
  }
  if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
    return 'IE';
  }
  return '알 수 없음';
}