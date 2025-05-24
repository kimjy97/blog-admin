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