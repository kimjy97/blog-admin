export const formatDate = (dateString?: string | Date | null): string => {
  if (!dateString) return "날짜 없음";
  const date = new Date(dateString);
  const kstDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const year = kstDate.getFullYear();
  const month = (kstDate.getMonth() + 1).toString().padStart(2, '0');
  const day = kstDate.getDate().toString().padStart(2, '0');
  let hours = kstDate.getHours();
  const minutes = kstDate.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? '오후' : '오전';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = hours.toString().padStart(2, '0');
  return `${year}. ${month}. ${day} ${ampm} ${hoursStr}:${minutes}`;
};

export const getISODateString = (date: Date | undefined): string | undefined => {
  return date ? date.toISOString() : undefined;
};

export const getDateAtMidnightUTC = (dateString: string): Date | null => {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const midnight = new Date(Date.UTC(year, month - 1, day));

    if (isNaN(midnight.getTime())) {
      console.warn(`Invalid Date for "${dateString}" in getDateAtMidnightUTC.`);
      return null;
    }
    return midnight;
  } catch (error) {
    console.warn(`An error occurred in getDateAtMidnightUTC for "${dateString}".`, error);
    return null;
  }
}