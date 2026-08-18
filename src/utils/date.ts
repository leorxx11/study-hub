export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getWeekKey(date = new Date()): string {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  return `${utcDate.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function isInWeek(isoDate: string | undefined, week: string): boolean {
  if (!isoDate) return false;
  const date = new Date(isoDate);
  return !Number.isNaN(date.getTime()) && getWeekKey(date) === week;
}

export function formatDate(isoDate: string | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("zh-CN", options ?? { month: "2-digit", day: "2-digit" }).format(date);
}

export function formatTime(isoDate: string): string {
  return formatDate(isoDate, { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function getActivityDayLabel(isoDate: string): string {
  const key = getLocalDateKey(new Date(isoDate));
  const today = getLocalDateKey();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  if (key === today) return "Today";
  if (key === getLocalDateKey(yesterdayDate)) return "Yesterday";
  return formatDate(isoDate, { month: "short", day: "numeric" });
}
