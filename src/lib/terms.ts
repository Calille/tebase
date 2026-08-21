import { addWeeks, differenceInCalendarWeeks, startOfWeek } from "date-fns";
import {
  buildAcademicCalendar,
  type AcademicTerm,
  type HalfTermWindow,
} from "@/lib/academicCalendar";
import { PAY_WEEK_STARTS_ON, parseIsoDate, payWeekContaining, toIsoDate } from "@/lib/payWeek";
import type { PayWeek } from "@/types/payroll";

export type { AcademicTerm, HalfTermWindow };

const GENERATED = buildAcademicCalendar(new Date());

export const STUB_TERMS: AcademicTerm[] = GENERATED.terms;
export const STUB_HALF_TERMS: HalfTermWindow[] = GENERATED.halfTerms;

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
