import { addDays, format } from "date-fns";

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

function iso(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function atNoon(year: number, monthIndex: number, day: number): Date {
  return new Date(year, monthIndex, day, 12, 0, 0, 0);
}

function firstWeekdayOfMonth(year: number, monthIndex: number): Date {
  const date = atNoon(year, monthIndex, 1);
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

function lastFridayBefore(year: number, monthIndex: number, day: number): Date {
  const date = atNoon(year, monthIndex, day);
  while (date.getDay() !== 5) {
    date.setDate(date.getDate() - 1);
  }
  return date;
}

function nthMonday(year: number, monthIndex: number, n: number): Date {
  const date = atNoon(year, monthIndex, 1);
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() + 1);
  }
  date.setDate(date.getDate() + (n - 1) * 7);
  return date;
}

function lastMonday(year: number, monthIndex: number): Date {
  const date = atNoon(year, monthIndex + 1, 0);
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() - 1);
  }
  return date;
}

function thirdFridayOfJuly(year: number): Date {
  const date = atNoon(year, 6, 1);
  while (date.getDay() !== 5) {
    date.setDate(date.getDate() + 1);
  }
  date.setDate(date.getDate() + 14);
  return date;
}

/** Anonymous Gregorian algorithm. */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 16);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return atNoon(year, month - 1, day);
}

export interface ClosedRange {
  name: string;
  startsOn: string;
  endsOn: string;
}

export interface AcademicCalendar {
  terms: AcademicTerm[];
  halfTerms: HalfTermWindow[];
  insetDays: string[];
  closedRanges: ClosedRange[];
}

function academicYearForStartYear(startYear: number): {
  terms: AcademicTerm[];
  halfTerms: HalfTermWindow[];
  insetDays: string[];
  closedRanges: ClosedRange[];
} {
  const endYear = startYear + 1;
  const autumnStart = firstWeekdayOfMonth(startYear, 8);
  const autumnEnd = lastFridayBefore(startYear, 11, 20);
  const octHalfMonday = lastMonday(startYear, 9);
  const octHalfFriday = addDays(octHalfMonday, 4);
  const autumnFirstEnd = addDays(octHalfMonday, -3);
  const autumnSecondStart = addDays(octHalfFriday, 3);

  const springStart = firstWeekdayOfMonth(endYear, 0);
  if (springStart.getDate() < 5 && springStart.getMonth() === 0) {
    const shifted = atNoon(endYear, 0, 5);
    while (shifted.getDay() === 0 || shifted.getDay() === 6) {
      shifted.setDate(shifted.getDate() + 1);
    }
    springStart.setTime(shifted.getTime());
  }

  const easter = easterSunday(endYear);
  const goodFriday = addDays(easter, -2);
  const easterHolidayEnd = addDays(easter, 5);
  const springEnd = addDays(goodFriday, -1);
  while (springEnd.getDay() !== 5) {
    springEnd.setDate(springEnd.getDate() - 1);
  }

  const febHalfMonday = nthMonday(endYear, 1, 3);
  const febHalfFriday = addDays(febHalfMonday, 4);
  const springFirstEnd = addDays(febHalfMonday, -3);
  const springSecondStart = addDays(febHalfFriday, 3);

  const summerStart = addDays(easterHolidayEnd, 3);
  const summerEnd = thirdFridayOfJuly(endYear);
  const mayHalfMonday = lastMonday(endYear, 4);
  const mayHalfFriday = addDays(mayHalfMonday, 4);
  const summerFirstEnd = addDays(mayHalfMonday, -3);
  const summerSecondStart = addDays(mayHalfFriday, 3);

  const inset1 = iso(autumnStart);
  const inset2 = iso(addDays(autumnStart, 1));
  const inset3 = iso(springStart);

  const terms: AcademicTerm[] = [
    {
      id: `autumn-${startYear}`,
      name: `Autumn ${startYear}`,
      startsOn: iso(autumnStart),
      endsOn: iso(autumnEnd),
    },
    {
      id: `spring-${endYear}`,
      name: `Spring ${endYear}`,
      startsOn: iso(springStart),
      endsOn: iso(springEnd),
    },
    {
      id: `summer-${endYear}`,
      name: `Summer ${endYear}`,
      startsOn: iso(summerStart),
      endsOn: iso(summerEnd),
    },
  ];

  const halfTerms: HalfTermWindow[] = [
    {
      id: `autumn-${startYear}-1`,
      label: `Autumn ${startYear} (first half)`,
      startsOn: iso(autumnStart),
      endsOn: iso(autumnFirstEnd),
    },
    {
      id: `autumn-${startYear}-2`,
      label: `Autumn ${startYear} (second half)`,
      startsOn: iso(autumnSecondStart),
      endsOn: iso(autumnEnd),
    },
    {
      id: `spring-${endYear}-1`,
      label: `Spring ${endYear} (first half)`,
      startsOn: iso(springStart),
      endsOn: iso(springFirstEnd),
    },
    {
      id: `spring-${endYear}-2`,
      label: `Spring ${endYear} (second half)`,
      startsOn: iso(springSecondStart),
      endsOn: iso(springEnd),
    },
    {
      id: `summer-${endYear}-1`,
      label: `Summer ${endYear} (first half)`,
      startsOn: iso(summerStart),
      endsOn: iso(summerFirstEnd),
    },
    {
      id: `summer-${endYear}-2`,
      label: `Summer ${endYear} (second half)`,
      startsOn: iso(summerSecondStart),
      endsOn: iso(summerEnd),
    },
  ];

  const easterEnds = addDays(easter, 5);
  const closedRanges: ClosedRange[] = [
    {
      name: `Christmas ${startYear}`,
      startsOn: iso(addDays(autumnEnd, 1)),
      endsOn: iso(addDays(springStart, -1)),
    },
    {
      name: `October half-term ${startYear}`,
      startsOn: iso(octHalfMonday),
      endsOn: iso(octHalfFriday),
    },
    {
      name: `February half-term ${endYear}`,
      startsOn: iso(febHalfMonday),
      endsOn: iso(febHalfFriday),
    },
    {
      name: `Easter ${endYear}`,
      startsOn: iso(goodFriday),
      endsOn: iso(easterEnds),
    },
    {
      name: `May half-term ${endYear}`,
      startsOn: iso(mayHalfMonday),
      endsOn: iso(mayHalfFriday),
    },
  ];

  return {
    terms,
    halfTerms,
    insetDays: [inset1, inset2, inset3],
    closedRanges,
  };
}

/**
 * English-style academic calendar generated from `now`, not a frozen year.
 * Used by term comparisons and by the mock seed (skip holidays / INSET).
 */
export function buildAcademicCalendar(now: Date): AcademicCalendar {
  const year = now.getFullYear();
  const terms: AcademicTerm[] = [];
  const halfTerms: HalfTermWindow[] = [];
  const insetDays: string[] = [];
  const closedRanges: ClosedRange[] = [];

  for (let startYear = year - 2; startYear <= year; startYear += 1) {
    const slice = academicYearForStartYear(startYear);
    terms.push(...slice.terms);
    halfTerms.push(...slice.halfTerms);
    insetDays.push(...slice.insetDays);
    closedRanges.push(...slice.closedRanges);
  }

  terms.sort((a, b) => a.startsOn.localeCompare(b.startsOn));
  halfTerms.sort((a, b) => a.startsOn.localeCompare(b.startsOn));
  closedRanges.sort((a, b) => a.startsOn.localeCompare(b.startsOn));

  return {
    terms,
    halfTerms,
    insetDays: [...new Set(insetDays)].sort(),
    closedRanges,
  };
}

export function isoInClosedRange(isoDate: string, range: ClosedRange): boolean {
  return isoDate >= range.startsOn && isoDate <= range.endsOn;
}

export function isInsetDay(isoDate: string, calendar: AcademicCalendar): boolean {
  return calendar.insetDays.includes(isoDate);
}

export function isHolidayOrHalfTerm(
  isoDate: string,
  calendar: AcademicCalendar,
): boolean {
  return calendar.closedRanges.some((range) => isoInClosedRange(isoDate, range));
}

/**
 * Weekday that is not Christmas/Easter/half-term/INSET.
 * The long summer holiday is NOT skipped — demo volume needs a current week
 * in August, and weekly/payroll views would otherwise be permanently empty.
 */
export function isBookableDay(date: Date, calendar: AcademicCalendar): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  const key = iso(date);
  if (isInsetDay(key, calendar)) return false;
  if (isHolidayOrHalfTerm(key, calendar)) return false;
  return true;
}
