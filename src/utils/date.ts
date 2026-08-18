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

export function getWeekDateRange(week = getWeekKey()): { start: Date; end: Date; startKey: string; endKey: string } {
  const match = /^(\d{4})-W(\d{2})$/.exec(week);
  if (!match) {
    const today = new Date();
    return { start: today, end: today, startKey: getLocalDateKey(today), endKey: getLocalDateKey(today) };
  }
  const year = Number(match[1]);
  const weekNumber = Number(match[2]);
  const januaryFourth = new Date(year, 0, 4, 12);
  const day = januaryFourth.getDay() || 7;
  const start = new Date(januaryFourth);
  start.setDate(januaryFourth.getDate() - day + 1 + (weekNumber - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end, startKey: getLocalDateKey(start), endKey: getLocalDateKey(end) };
}

export function getInternshipWeek(startDate: string, date = new Date()): number {
  const start = new Date(`${startDate}T12:00:00`);
  if (Number.isNaN(start.getTime())) return 1;
  const target = new Date(date);
  target.setHours(12, 0, 0, 0);
  const elapsed = Math.max(0, target.getTime() - start.getTime());
  return Math.floor(elapsed / 604_800_000) + 1;
}

export function formatLongDay(date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(date);
}

export function shiftWeekKey(week: string, offset: number): string {
  const { start } = getWeekDateRange(week);
  const shifted = new Date(start);
  shifted.setDate(start.getDate() + offset * 7);
  return getWeekKey(shifted);
}
