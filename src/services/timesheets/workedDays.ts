import { addDays } from "date-fns";
import { parseIsoDate, payWeekContaining, toIsoDate } from "@/lib/payWeek";
import { roundGbp } from "@/types/payroll";
import {
  resolveChargeRate,
  type RatePeriod,
  type TeacherRole,
  type WorkedDay,
} from "@/types/timesheet";

export function generateWorkedDays(
  weekEnding: string,
  days: number,
  role: TeacherRole,
): WorkedDay[] {
  const week = payWeekContaining(parseIsoDate(weekEnding));
  const monday = parseIsoDate(week.startsOn);
  const result: WorkedDay[] = [];
  let remaining = days;
  for (let i = 0; i < 5 && remaining > 0; i += 1) {
    const units = remaining >= 1 ? 1 : remaining;
    result.push({
      date: toIsoDate(addDays(monday, i)),
      units,
      unitType: "day",
      role,
    });
    remaining = Math.round((remaining - units) * 10) / 10;
  }
  return result;
}

export function defaultRateSchedule(
  weekEnding: string,
  dayRate: number | null,
): RatePeriod[] {
  const week = payWeekContaining(parseIsoDate(weekEnding));
  return [
    {
      from: week.startsOn,
      to: week.weekEnding,
      dayRate: dayRate ?? undefined,
    },
  ];
}

export function chargeFromWorkedDays(
  workedDays: WorkedDay[],
  schedule: RatePeriod[],
  fallbackDayRate: number | null,
): number {
  let total = 0;
  for (const day of workedDays) {
    const resolved = resolveChargeRate(schedule, day.date, day.unitType);
    const rate = resolved ?? (day.unitType === "day" ? fallbackDayRate : null);
    if (rate != null) total += rate * day.units;
  }
  return roundGbp(total);
}

export function sumWorkedUnits(workedDays: WorkedDay[]): number {
  return Math.round(workedDays.reduce((sum, day) => sum + day.units, 0) * 10) / 10;
}
