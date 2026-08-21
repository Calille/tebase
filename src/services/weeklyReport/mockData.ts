import { addWeeks } from "date-fns";
import { parseIsoDate, payWeekContaining, toIsoDate } from "@/lib/payWeek";
import { lastCompletedHalfTerm, payWeeksOverlapping } from "@/lib/terms";
import type { PartyRef } from "@/types/party";
import type { PayWeek } from "@/types/payroll";
import {
  marginPercentOfCharge,
  statsFromTotals,
  type BookingInterruption,
  type DormantSchool,
  type FillRate,
  type ForecastBooking,
  type LowMarginBooking,
  type MarginTrendPoint,
  type NextWeekForecast,
  type WeekStats,
} from "@/types/weeklyReport";
import { CONSULTANTS, SCHOOLS, TEACHERS } from "./mockRefs";

function hash(input: string): number {
  let value = 0;
  for (let i = 0; i < input.length; i += 1) {
    value = (value * 31 + input.charCodeAt(i)) % 1000;
  }
  return value;
}

function scoped(
  consultantId: string | undefined,
  owner: PartyRef,
): boolean {
  if (!consultantId) return true;
  return owner.id === consultantId;
}

/**
 * Deterministic week stats so last-week / last-term / 8-week trend have
 * numbers without a giant fixture table.
 */
export function mockStatsForWeek(
  week: PayWeek,
  consultantId?: string,
): WeekStats {
  const seed = hash(week.id + (consultantId ?? "team"));
  const scale = consultantId ? 0.38 : 1;
  const charge = Math.round((9200 + (seed % 1800) + week.id.length * 40) * scale);
  const pay = Math.round(charge * (0.72 + (seed % 7) / 100));
  const days = Math.round((38 + (seed % 10)) * scale);
  return statsFromTotals(charge, pay, Math.max(days, 1));
}

export function mockLowMarginBookings(
  week: PayWeek,
  consultantId?: string,
): LowMarginBooking[] {
  const rows: LowMarginBooking[] = [
    {
      id: `lm-${week.id}-oak-sarah`,
      school: SCHOOLS.oakridge,
      teacher: TEACHERS.sarah,
      consultant: CONSULTANTS[0],
      payRate: 175,
      chargeRate: 195,
      marginPerDay: 20,
      marginPercent: marginPercentOfCharge(195, 175),
      days: 4,
    },
    {
      id: `lm-${week.id}-oak-tom`,
      school: SCHOOLS.oakridge,
      teacher: TEACHERS.tom,
      consultant: CONSULTANTS[2],
      payRate: 180,
      chargeRate: 200,
      marginPerDay: 20,
      marginPercent: marginPercentOfCharge(200, 180),
      days: 5,
    },
    {
      id: `lm-${week.id}-north-david`,
      school: SCHOOLS.harbour,
      teacher: TEACHERS.david,
      consultant: CONSULTANTS[1],
      payRate: 165,
      chargeRate: 190,
      marginPerDay: 25,
      marginPercent: marginPercentOfCharge(190, 165),
      days: 3,
    },
    {
      id: `lm-${week.id}-green-emily`,
      school: SCHOOLS.greenfield,
      teacher: TEACHERS.emily,
      consultant: CONSULTANTS[2],
      payRate: 150,
      chargeRate: 175,
      marginPerDay: 25,
      marginPercent: marginPercentOfCharge(175, 150),
      days: 2,
    },
  ];
  return rows.filter((row) => scoped(consultantId, row.consultant));
}

export function mockInterruptions(
  week: PayWeek,
  consultantId?: string,
): BookingInterruption[] {
  const rows: BookingInterruption[] = [
    {
      id: `int-${week.id}-1`,
      type: "cancellation",
      school: SCHOOLS.stmarys,
      teacher: TEACHERS.priya,
      consultant: CONSULTANTS[0],
      date: week.startsOn,
      daysLost: 2,
      marginLost: 90,
      note: "School closed the booking on Monday morning",
    },
    {
      id: `int-${week.id}-2`,
      type: "early_finish",
      school: SCHOOLS.westfield,
      teacher: TEACHERS.john,
      consultant: CONSULTANTS[0],
      date: week.weekEnding,
      daysLost: 1,
      marginLost: 50,
      note: "Cover ended Thursday after the class teacher returned",
    },
    {
      id: `int-${week.id}-3`,
      type: "cancellation",
      school: SCHOOLS.harbour,
      teacher: TEACHERS.aisha,
      consultant: CONSULTANTS[1],
      date: toIsoDate(addWeeks(parseIsoDate(week.startsOn), 0)),
      daysLost: 3,
      marginLost: 150,
      note: "Vacancy withdrawn — filled internally",
    },
  ];
  return rows.filter((row) => scoped(consultantId, row.consultant));
}

export function mockFillRate(
  week: PayWeek,
  consultantId?: string,
): FillRate {
  const seed = hash(week.id + (consultantId ?? "team"));
  const scale = consultantId ? 0.4 : 1;
  const received = Math.max(4, Math.round((18 + (seed % 6)) * scale));
  const filled = Math.max(2, Math.round(received * 0.72));
  const lost = Math.max(0, received - filled);
  const reasons =
    lost === 0
      ? []
      : [
          { reason: "Teacher unavailable", count: Math.max(1, Math.round(lost * 0.4)) },
          { reason: "School cancelled", count: Math.round(lost * 0.3) },
          { reason: "Rate not agreed", count: Math.round(lost * 0.2) },
          { reason: "Filled by another agency", count: 0 },
        ];
  const assigned = reasons.reduce((sum, item) => sum + item.count, 0);
  if (lost > assigned && reasons[3]) {
    reasons[3].count = lost - assigned;
  }
  return {
    received,
    filled,
    lost,
    fillPercent: received === 0 ? 0 : Math.round((filled / received) * 1000) / 10,
    lossReasons: reasons.filter((item) => item.count > 0),
  };
}

export function mockDormantSchools(week: PayWeek): DormantSchool[] {
  const half = lastCompletedHalfTerm(week.startsOn);
  if (!half) return [];

  const halfWeeks = payWeeksOverlapping(half.startsOn, half.endsOn);
  const weeksActive = Math.min(6, Math.max(4, halfWeeks.length));

  return [
    {
      school: SCHOOLS.meadowbank,
      weeksActiveLastHalfTerm: weeksActive,
      lastHalfTermCharge: 12480,
      lastHalfTermLabel: half.label,
    },
  ];
}

export function mockForecast(
  current: PayWeek,
  consultantId?: string,
): NextWeekForecast {
  const next = payWeekContaining(addWeeks(parseIsoDate(current.weekEnding), 1));
  const bookings: ForecastBooking[] = [
    {
      id: `fc-${next.id}-1`,
      school: SCHOOLS.westfield,
      teacher: TEACHERS.john,
      consultant: CONSULTANTS[0],
      days: 5,
      chargeTotal: 1050,
      marginGbp: 250,
    },
    {
      id: `fc-${next.id}-2`,
      school: SCHOOLS.stmarys,
      teacher: TEACHERS.sarah,
      consultant: CONSULTANTS[0],
      days: 4,
      chargeTotal: 820,
      marginGbp: 200,
    },
    {
      id: `fc-${next.id}-3`,
      school: SCHOOLS.harbour,
      teacher: TEACHERS.aisha,
      consultant: CONSULTANTS[1],
      days: 5,
      chargeTotal: 1200,
      marginGbp: 250,
    },
    {
      id: `fc-${next.id}-4`,
      school: SCHOOLS.oakridge,
      teacher: TEACHERS.michael,
      consultant: CONSULTANTS[1],
      days: 5,
      chargeTotal: 1150,
      marginGbp: 300,
    },
  ].filter((row) => scoped(consultantId, row.consultant));

  return {
    period: next,
    bookings,
    projectedCharge: bookings.reduce((sum, row) => sum + row.chargeTotal, 0),
    projectedMargin: bookings.reduce((sum, row) => sum + row.marginGbp, 0),
    bookingCount: bookings.length,
  };
}

export function mockTrend(
  current: PayWeek,
  consultantId?: string,
): MarginTrendPoint[] {
  const points: MarginTrendPoint[] = [];
  for (let i = 7; i >= 0; i -= 1) {
    const week = payWeekContaining(addWeeks(parseIsoDate(current.weekEnding), -i));
    const stats = mockStatsForWeek(week, consultantId);
    points.push({
      periodId: week.id,
      weekEnding: week.weekEnding,
      label: week.weekEnding.slice(5),
      chargeTotal: stats.chargeTotal,
      payCost: stats.payCost,
      marginGbp: stats.marginGbp,
    });
  }
  return points;
}

export function currentRateForTeacher(name: string): {
  payRate: number;
  chargeRate: number;
} | null {
  const rates: Record<string, { payRate: number; chargeRate: number }> = {
    "John Smith": { payRate: 160, chargeRate: 210 },
    "Sarah Johnson": { payRate: 155, chargeRate: 205 },
    "Michael Chen": { payRate: 170, chargeRate: 230 },
    "Emily Rodriguez": { payRate: 150, chargeRate: 195 },
    "David Wilson": { payRate: 165, chargeRate: 215 },
  };
  return rates[name] ?? null;
}
