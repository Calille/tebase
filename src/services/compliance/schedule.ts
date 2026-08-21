import { addDays, startOfDay } from "date-fns";
import { toIsoDate } from "@/lib/payWeek";

function isoWeekday(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

/**
 * Next ISO date on `weekday` (1=Mon … 7=Sun) on or after `now`,
 * skipping a day already used as `lastSentAt`.
 */
export function nextWeeklySendOn(
  now: Date,
  weekday: number,
  lastSentAt: string | null,
): string {
  let cursor = startOfDay(now);
  if (lastSentAt) {
    const sent = startOfDay(new Date(lastSentAt));
    if (!Number.isNaN(sent.getTime()) && sent >= cursor) {
      cursor = addDays(sent, 1);
    }
  }
  const delta = (weekday - isoWeekday(cursor) + 7) % 7;
  return toIsoDate(addDays(cursor, delta));
}
