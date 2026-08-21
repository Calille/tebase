import type { PartyRef } from "./party";
import type { PayWeek } from "./payroll";
import type { MarginThresholdSettings } from "./settings";
import type { UnapprovedTimesheetSummary } from "./timesheet";

export type WeeklyReportScope = "self" | "team";

export interface WeekStats {
  chargeTotal: number;
  payCost: number;
  marginGbp: number;
  /** Margin as a percentage of charge. 0 when charge is 0. */
  marginPercent: number;
  daysFilled: number;
}

export interface StatDelta {
  absolute: number;
  percent: number | null;
}

export interface ComparedStat {
  current: number;
  lastWeek: StatDelta;
  lastTerm: StatDelta;
}

export interface WeeklyHeadline {
  charge: ComparedStat;
  payCost: ComparedStat;
  marginGbp: ComparedStat;
  marginPercent: ComparedStat;
  daysFilled: ComparedStat;
  current: WeekStats;
  lastWeek: WeekStats;
  lastTerm: WeekStats;
  lastTermLabel: string;
  lastTermIsProxy: boolean;
}

export interface LowMarginBooking {
  id: string;
  school: PartyRef;
  teacher: PartyRef;
  consultant: PartyRef;
  payRate: number;
  chargeRate: number;
  marginPerDay: number;
  marginPercent: number;
  days: number;
}

export interface LowMarginSchoolGroup {
  school: PartyRef;
  bookingCount: number;
  days: number;
  worstMarginPerDay: number;
  worstMarginPercent: number;
  teachers: PartyRef[];
  bookings: LowMarginBooking[];
}

export interface AwrWeek12Warning {
  teacher: PartyRef;
  school: PartyRef;
  awrWeeks: number;
  awrDays: number;
  weeksUntilParity: number;
  projectedQualificationDate: string | null;
  currentPayRate: number | null;
  currentChargeRate: number | null;
  currentMarginPerDay: number | null;
  /**
   * Null until we have the comparable permanent / parity rate.
   * Do not invent a post-AWR pay figure.
   */
  parityPayRate: number | null;
  projectedMarginPerDay: number | null;
  marginImpactPerDay: number | null;
}

export type BookingInterruptionType = "cancellation" | "early_finish";

export interface BookingInterruption {
  id: string;
  type: BookingInterruptionType;
  school: PartyRef;
  teacher: PartyRef;
  consultant: PartyRef;
  date: string;
  daysLost: number;
  marginLost: number;
  note: string;
}

export interface FillLossReason {
  reason: string;
  count: number;
}

export interface FillRate {
  received: number;
  filled: number;
  lost: number;
  fillPercent: number;
  lossReasons: FillLossReason[];
}

export interface DormantSchool {
  school: PartyRef;
  weeksActiveLastHalfTerm: number;
  lastHalfTermCharge: number;
  lastHalfTermLabel: string;
}

export interface ForecastBooking {
  id: string;
  school: PartyRef;
  teacher: PartyRef;
  consultant: PartyRef;
  days: number;
  chargeTotal: number;
  marginGbp: number;
}

export interface NextWeekForecast {
  period: PayWeek;
  bookings: ForecastBooking[];
  projectedCharge: number;
  projectedMargin: number;
  bookingCount: number;
}

export interface MarginTrendPoint {
  periodId: string;
  weekEnding: string;
  label: string;
  chargeTotal: number;
  payCost: number;
  marginGbp: number;
}

export interface WeeklyReport {
  period: PayWeek;
  scope: WeeklyReportScope;
  consultant: PartyRef | null;
  headlines: WeeklyHeadline;
  lowMargin: LowMarginSchoolGroup[];
  thresholds: MarginThresholdSettings;
  awrWarnings: AwrWeek12Warning[];
  unapprovedTimesheets: UnapprovedTimesheetSummary;
  interruptions: BookingInterruption[];
  interruptionMarginLost: number;
  fillRate: FillRate;
  dormantSchools: DormantSchool[];
  forecast: NextWeekForecast;
  marginTrend: MarginTrendPoint[];
}

export function marginPercentOfCharge(charge: number, pay: number): number {
  if (charge <= 0) return 0;
  return Math.round(((charge - pay) / charge) * 1000) / 10;
}

export function emptyWeekStats(): WeekStats {
  return {
    chargeTotal: 0,
    payCost: 0,
    marginGbp: 0,
    marginPercent: 0,
    daysFilled: 0,
  };
}

export function statsFromTotals(
  chargeTotal: number,
  payCost: number,
  daysFilled: number,
): WeekStats {
  const marginGbp = Math.round((chargeTotal - payCost) * 100) / 100;
  return {
    chargeTotal,
    payCost,
    marginGbp,
    marginPercent: marginPercentOfCharge(chargeTotal, payCost),
    daysFilled,
  };
}

export function deltaBetween(current: number, previous: number): StatDelta {
  const absolute = Math.round((current - previous) * 100) / 100;
  if (previous === 0) {
    return { absolute, percent: current === 0 ? 0 : null };
  }
  return {
    absolute,
    percent: Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10,
  };
}
