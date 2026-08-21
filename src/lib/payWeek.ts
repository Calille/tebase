import { addDays, endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import { enGB } from "date-fns/locale";
import type { PayWeek } from "@/types/payroll";

/**
 * Pay week convention (ASSUMPTION — confirm with Keep Education):
 * weeks run Monday–Sunday; the week-ending date shown on payroll is Sunday.
 *
 * date-fns `weekStartsOn: 1` is Monday, so `endOfWeek` is Sunday.
 */
export const PAY_WEEK_STARTS_ON = 1 as const;

const WEEK_OPTS = { weekStartsOn: PAY_WEEK_STARTS_ON } as const;

export function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function payWeekContaining(date: Date): PayWeek {
  const startsOn = startOfWeek(date, WEEK_OPTS);
  const weekEnding = endOfWeek(date, WEEK_OPTS);
  const weekEndingIso = toIsoDate(weekEnding);

  return {
    id: weekEndingIso,
    startsOn: toIsoDate(startsOn),
    weekEnding: weekEndingIso,
    label: formatPayWeekLabel(startsOn, weekEnding),
  };
}

export function formatPayWeekLabel(startsOn: Date, weekEnding: Date): string {
  const endingLong = format(weekEnding, "EEEE d MMMM yyyy", { locale: enGB });
  const range = `${format(startsOn, "d MMM", { locale: enGB })} – ${format(weekEnding, "d MMM yyyy", { locale: enGB })}`;
  return `${range} · week ending ${endingLong}`;
}

export function formatWeekEnding(weekEndingIso: string): string {
  const [year, month, day] = weekEndingIso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return format(date, "EEEE d MMMM yyyy", { locale: enGB });
}

export function listPayWeeks(from: Date, count = 12): PayWeek[] {
  const current = payWeekContaining(from);
  const currentEnd = parseIsoDate(current.weekEnding);
  const weeks: PayWeek[] = [];

  for (let i = 0; i < count; i += 1) {
    weeks.push(payWeekContaining(subWeeks(currentEnd, i)));
  }

  return weeks;
}

export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function shiftPayWeek(week: PayWeek, weekDelta: number): PayWeek {
  return payWeekContaining(addDays(parseIsoDate(week.weekEnding), weekDelta * 7));
}
