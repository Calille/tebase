import { addWeeks, differenceInCalendarWeeks, startOfWeek } from "date-fns";
import { PAY_WEEK_STARTS_ON, parseIsoDate, payWeekContaining, toIsoDate } from "@/lib/payWeek";
import type { PayWeek } from "@/types/payroll";

/**
 * Stub English academic terms — not Keep Education’s calendar.
 * Used only so “same week last term” and “last half-term” have a shape
 * we can swap for a real term table later.
 */
export interface AcademicTerm {
  id: string;
  name: string;
  startsOn: string;
  endsOn: string;
}

export interface HalfTermWindow {
  id: string;
  label: string;
  startsOn: string;
  endsOn: string;
}

export const STUB_TERMS: AcademicTerm[] = [
  { id: "autumn-2025", name: "Autumn 2025", startsOn: "2025-09-02", endsOn: "2025-12-19" },
  { id: "spring-2026", name: "Spring 2026", startsOn: "2026-01-05", endsOn: "2026-03-27" },
  { id: "summer-2026", name: "Summer 2026", startsOn: "2026-04-13", endsOn: "2026-07-17" },
  { id: "autumn-2026", name: "Autumn 2026", startsOn: "2026-09-01", endsOn: "2026-12-18" },
];

export const STUB_HALF_TERMS: HalfTermWindow[] = [
  { id: "autumn-2025-1", label: "Autumn 2025 (first half)", startsOn: "2025-09-02", endsOn: "2025-10-24" },
  { id: "autumn-2025-2", label: "Autumn 2025 (second half)", startsOn: "2025-11-03", endsOn: "2025-12-19" },
  { id: "spring-2026-1", label: "Spring 2026 (first half)", startsOn: "2026-01-05", endsOn: "2026-02-13" },
  { id: "spring-2026-2", label: "Spring 2026 (second half)", startsOn: "2026-02-23", endsOn: "2026-03-27" },
  { id: "summer-2026-1", label: "Summer 2026 (first half)", startsOn: "2026-04-13", endsOn: "2026-05-22" },
  { id: "summer-2026-2", label: "Summer 2026 (second half)", startsOn: "2026-06-02", endsOn: "2026-07-17" },
  { id: "autumn-2026-1", label: "Autumn 2026 (first half)", startsOn: "2026-09-01", endsOn: "2026-10-23" },
  { id: "autumn-2026-2", label: "Autumn 2026 (second half)", startsOn: "2026-11-02", endsOn: "2026-12-18" },
];

const WEEK_OPTS = { weekStartsOn: PAY_WEEK_STARTS_ON } as const;

export function termContaining(isoDate: string): AcademicTerm | null {
  return (
    STUB_TERMS.find(
      (term) => term.startsOn <= isoDate && isoDate <= term.endsOn,
    ) ?? null
  );
}

export function lastCompletedHalfTerm(isoDate: string): HalfTermWindow | null {
  const past = STUB_HALF_TERMS.filter((window) => window.endsOn < isoDate);
  return past.length > 0 ? past[past.length - 1] : null;
}

export interface SeasonalWeek {
  week: PayWeek;
  termName: string | null;
  isProxy: boolean;
  label: string;
}

/**
 * Same week index in the previous term. If the selected week sits in a
 * holiday, fall back 13 weeks (a rough term length) and mark it as a proxy.
 */
export function sameWeekLastTerm(week: PayWeek): SeasonalWeek {
  const term = termContaining(week.weekEnding);
  const ordered = [...STUB_TERMS].sort((a, b) =>
    a.startsOn.localeCompare(b.startsOn),
  );

  if (term) {
    const termIndex = ordered.findIndex((item) => item.id === term.id);
    const previous = termIndex > 0 ? ordered[termIndex - 1] : null;
    const weekStart = parseIsoDate(week.startsOn);
    const termStart = startOfWeek(parseIsoDate(term.startsOn), WEEK_OPTS);
    const index = Math.max(
      0,
      differenceInCalendarWeeks(weekStart, termStart, WEEK_OPTS),
    );

    if (previous) {
      const previousStart = startOfWeek(
        parseIsoDate(previous.startsOn),
        WEEK_OPTS,
      );
      const matched = payWeekContaining(addWeeks(previousStart, index));
      return {
        week: matched,
        termName: previous.name,
        isProxy: false,
        label: `${previous.name}, week ${index + 1}`,
      };
    }
  }

  const proxyDate = addWeeks(parseIsoDate(week.weekEnding), -13);
  const proxyWeek = payWeekContaining(proxyDate);
  const proxyTerm = termContaining(proxyWeek.weekEnding);
  return {
    week: proxyWeek,
    termName: proxyTerm?.name ?? null,
    isProxy: true,
    label: proxyTerm
      ? `${proxyTerm.name} (13-week proxy — selected week is outside term)`
      : `Week ending ${proxyWeek.weekEnding} (13-week proxy — selected week is outside term)`,
  };
}

export function isoInRange(iso: string, start: string, end: string): boolean {
  return iso >= start && iso <= end;
}

export function payWeeksOverlapping(start: string, end: string): PayWeek[] {
  const weeks: PayWeek[] = [];
  let cursor = payWeekContaining(parseIsoDate(start));
  const last = payWeekContaining(parseIsoDate(end));
  while (cursor.weekEnding <= last.weekEnding) {
    weeks.push(cursor);
    cursor = payWeekContaining(addWeeks(parseIsoDate(cursor.weekEnding), 1));
    if (weeks.length > 40) break;
  }
  return weeks.filter(
    (week) => week.weekEnding >= start && week.startsOn <= end,
  );
}

export function formatWeekShort(week: PayWeek): string {
  return toIsoDate(parseIsoDate(week.weekEnding)).slice(5);
}
