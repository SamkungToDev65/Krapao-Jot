export function formatCurrency(amount: number, currency = "THB"): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  
  const isToday = 
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
    
  if (isToday) return "วันนี้";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = 
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
    
  if (isYesterday) return "เมื่อวาน";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  }).format(date);
}

export function getDaysUntil(dayOfMonth: number): { days: number; isOverdue: boolean; label: string } {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let targetDate = new Date(currentYear, currentMonth, dayOfMonth);
  
  if (currentDay > dayOfMonth) {
    // Target day has passed for this month -> Next month
    targetDate = new Date(currentYear, currentMonth + 1, dayOfMonth);
  }

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { days: 0, isOverdue: false, label: "ครบกำหนดวันนี้!" };
  } else if (diffDays === 1) {
    return { days: 1, isOverdue: false, label: "พรุ่งนี้" };
  } else if (diffDays <= 5) {
    return { days: diffDays, isOverdue: false, label: `อีก ${diffDays} วัน` };
  } else {
    return { days: diffDays, isOverdue: false, label: `อีก ${diffDays} วัน` };
  }
}
