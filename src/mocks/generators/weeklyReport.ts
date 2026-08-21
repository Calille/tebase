import { addWeeks } from "date-fns";
import { lastCompletedHalfTerm, payWeeksOverlapping, sameWeekLastTerm } from "@/lib/terms";
import { parseIsoDate, payWeekContaining } from "@/lib/payWeek";
import type { PayWeek } from "@/types/payroll";
import type { Timesheet } from "@/types/timesheet";
import { isUnapprovedTimesheetStatus } from "@/types/timesheet";
import type { TeacherWithAWR } from "@/types/awr";
import { DEFAULT_MARGIN_THRESHOLDS } from "@/types/settings";
import {
  deltaBetween,
  statsFromTotals,
  type BookingInterruption,
  type DormantSchool,
  type FillRate,
  type ForecastBooking,
  type LowMarginBooking,
  type LowMarginSchoolGroup,
  type MarginTrendPoint,
  type NextWeekForecast,
  type WeeklyHeadline,
  type WeeklyReport,
  type WeekStats,
  marginPercentOfCharge,
} from "@/types/weeklyReport";
import type { SeedBooking, SeedConsultant, SeedSchool, SeedTeacher } from "../types";

function isLow(booking: LowMarginBooking): boolean {
  return (
    booking.marginPerDay < DEFAULT_MARGIN_THRESHOLDS.poundsPerDayFloor ||
    booking.marginPercent < DEFAULT_MARGIN_THRESHOLDS.percentFloor
  );
}

function groupLow(bookings: LowMarginBooking[]): LowMarginSchoolGroup[] {
  const bySchool = new Map<string, LowMarginSchoolGroup>();
  const sorted = [...bookings].sort(
    (a, b) => a.marginPerDay - b.marginPerDay || a.marginPercent - b.marginPercent,
  );
  for (const booking of sorted) {
    const existing = bySchool.get(booking.school.id);
    if (!existing) {
      bySchool.set(booking.school.id, {
        school: booking.school,
        bookingCount: 1,
        days: booking.days,
        worstMarginPerDay: booking.marginPerDay,
        worstMarginPercent: booking.marginPercent,
        teachers: [booking.teacher],
        bookings: [booking],
      });
      continue;
    }
    existing.bookingCount += 1;
    existing.days += booking.days;
    existing.bookings.push(booking);
    if (!existing.teachers.some((teacher) => teacher.id === booking.teacher.id)) {
      existing.teachers.push(booking.teacher);
    }
  }
  return [...bySchool.values()].sort(
    (a, b) => a.worstMarginPerDay - b.worstMarginPerDay,
  );
}

function compared(
  current: WeekStats,
  lastWeek: WeekStats,
  lastTerm: WeekStats,
  lastTermLabel: string,
  lastTermIsProxy: boolean,
): WeeklyHeadline {
  const field = (
    key: keyof Pick<
      WeekStats,
      "chargeTotal" | "payCost" | "marginGbp" | "marginPercent" | "daysFilled"
    >,
  ) => ({
    current: current[key],
    lastWeek: deltaBetween(current[key], lastWeek[key]),
    lastTerm: deltaBetween(current[key], lastTerm[key]),
  });
  return {
    charge: field("chargeTotal"),
    payCost: field("payCost"),
    marginGbp: field("marginGbp"),
    marginPercent: field("marginPercent"),
    daysFilled: field("daysFilled"),
    current,
    lastWeek,
    lastTerm,
    lastTermLabel,
    lastTermIsProxy,
  };
}

export function statsFromBookings(
  bookings: SeedBooking[],
  week: PayWeek,
  consultantId?: string,
): WeekStats {
  let charge = 0;
  let pay = 0;
  let days = 0;
  for (const booking of bookings) {
    if (consultantId && booking.consultantId !== consultantId) continue;
    for (const day of booking.days) {
      if (day.cancelled) continue;
      if (day.date < week.startsOn || day.date > week.weekEnding) continue;
      charge += booking.chargeRate * day.units;
      pay += booking.payRate * day.units;
      days += day.units;
    }
  }
  return statsFromTotals(
    Math.round(charge * 100) / 100,
    Math.round(pay * 100) / 100,
    Math.round(days * 10) / 10,
  );
}

function lowMarginRows(
  bookings: SeedBooking[],
  week: PayWeek,
  teachers: SeedTeacher[],
  schools: SeedSchool[],
  consultants: SeedConsultant[],
  consultantId?: string,
): LowMarginBooking[] {
  const teacherById = new Map(teachers.map((t) => [t.id, t]));
  const schoolById = new Map(schools.map((s) => [s.id, s]));
  const consultantById = new Map(consultants.map((c) => [c.id, c]));
  const rows: LowMarginBooking[] = [];
  for (const booking of bookings) {
    if (consultantId && booking.consultantId !== consultantId) continue;
    const units = booking.days
      .filter((d) => !d.cancelled && d.date >= week.startsOn && d.date <= week.weekEnding)
      .reduce((sum, d) => sum + d.units, 0);
    if (units <= 0) continue;
    const marginPerDay = booking.chargeRate - booking.payRate;
    const teacher = teacherById.get(booking.teacherId);
    const school = schoolById.get(booking.schoolId);
    const consultant = consultantById.get(booking.consultantId);
    if (!teacher || !school || !consultant) continue;
    rows.push({
      id: `lm-${week.id}-${booking.id}`,
      school: { id: school.id, name: school.name },
      teacher: { id: teacher.id, name: teacher.name },
      consultant: { id: consultant.id, name: consultant.name },
      payRate: booking.payRate,
      chargeRate: booking.chargeRate,
      marginPerDay,
      marginPercent: marginPercentOfCharge(booking.chargeRate, booking.payRate),
      days: units,
    });
  }
  return rows;
}

function interruptionsFor(
  bookings: SeedBooking[],
  week: PayWeek,
  teachers: SeedTeacher[],
  schools: SeedSchool[],
  consultants: SeedConsultant[],
  consultantId?: string,
): BookingInterruption[] {
  const teacherById = new Map(teachers.map((t) => [t.id, t]));
  const schoolById = new Map(schools.map((s) => [s.id, s]));
  const consultantById = new Map(consultants.map((c) => [c.id, c]));
  const rows: BookingInterruption[] = [];
  for (const booking of bookings) {
    if (consultantId && booking.consultantId !== consultantId) continue;
    for (const day of booking.days) {
      if (day.date < week.startsOn || day.date > week.weekEnding) continue;
      const teacher = teacherById.get(booking.teacherId);
      const school = schoolById.get(booking.schoolId);
      const consultant = consultantById.get(booking.consultantId);
      if (!teacher || !school || !consultant) continue;
      if (day.cancelled) {
        rows.push({
          id: `int-${booking.id}-${day.date}`,
          type: "cancellation",
          school: { id: school.id, name: school.name },
          teacher: { id: teacher.id, name: teacher.name },
          consultant: { id: consultant.id, name: consultant.name },
          date: day.date,
          daysLost: day.units,
          marginLost: Math.round((booking.chargeRate - booking.payRate) * day.units * 100) / 100,
          note: day.cancelReason ?? "Cancelled",
        });
      } else if (day.earlyFinish) {
        rows.push({
          id: `int-early-${booking.id}-${day.date}`,
          type: "early_finish",
          school: { id: school.id, name: school.name },
          teacher: { id: teacher.id, name: teacher.name },
          consultant: { id: consultant.id, name: consultant.name },
          date: day.date,
          daysLost: 0.5,
          marginLost: Math.round((booking.chargeRate - booking.payRate) * 0.5 * 100) / 100,
          note: "Finished at lunch",
        });
      }
    }
  }
  return rows;
}

function fillRateFor(bookings: SeedBooking[], week: PayWeek, consultantId?: string): FillRate {
  let filled = 0;
  let lost = 0;
  const reasons = new Map<string, number>();
  for (const booking of bookings) {
    if (consultantId && booking.consultantId !== consultantId) continue;
    for (const day of booking.days) {
      if (day.date < week.startsOn || day.date > week.weekEnding) continue;
      if (day.cancelled) {
        lost += 1;
        const reason = day.sameMorningCancel ? "Same-morning cancellation" : "School cancelled";
        reasons.set(reason, (reasons.get(reason) ?? 0) + 1);
      } else {
        filled += 1;
      }
    }
  }
  const received = filled + lost;
  return {
    received,
    filled,
    lost,
    fillPercent: received === 0 ? 0 : Math.round((filled / received) * 1000) / 10,
    lossReasons: [...reasons.entries()].map(([reason, count]) => ({ reason, count })),
  };
}

function dormantFor(
  bookings: SeedBooking[],
  week: PayWeek,
  schools: SeedSchool[],
): DormantSchool[] {
  const half = lastCompletedHalfTerm(week.weekEnding);
  if (!half) return [];
  const halfWeeks = payWeeksOverlapping(half.startsOn, half.endsOn);
  const rows: DormantSchool[] = [];
  for (const school of schools.filter((s) => s.dormant)) {
    let weeksActive = 0;
    let charge = 0;
    for (const slot of halfWeeks) {
      let weekCharge = 0;
      for (const booking of bookings) {
        if (booking.schoolId !== school.id) continue;
        for (const day of booking.days) {
          if (day.cancelled) continue;
          if (day.date < slot.startsOn || day.date > slot.weekEnding) continue;
          weekCharge += booking.chargeRate * day.units;
        }
      }
      if (weekCharge > 0) {
        weeksActive += 1;
        charge += weekCharge;
      }
    }
    rows.push({
      school: { id: school.id, name: school.name },
      weeksActiveLastHalfTerm: weeksActive,
      lastHalfTermCharge: Math.round(charge * 100) / 100,
      lastHalfTermLabel: half.label,
    });
  }
  return rows;
}

function forecastFor(
  bookings: SeedBooking[],
  week: PayWeek,
  teachers: SeedTeacher[],
  schools: SeedSchool[],
  consultants: SeedConsultant[],
  consultantId?: string,
): NextWeekForecast {
  const next = payWeekContaining(addWeeks(parseIsoDate(week.weekEnding), 1));
  const teacherById = new Map(teachers.map((t) => [t.id, t]));
  const schoolById = new Map(schools.map((s) => [s.id, s]));
  const consultantById = new Map(consultants.map((c) => [c.id, c]));
  const items: ForecastBooking[] = [];
  for (const booking of bookings) {
    if (consultantId && booking.consultantId !== consultantId) continue;
    const units = booking.days
      .filter((d) => !d.cancelled && d.date >= next.startsOn && d.date <= next.weekEnding)
      .reduce((sum, d) => sum + d.units, 0);
    if (units <= 0) continue;
    const teacher = teacherById.get(booking.teacherId);
    const school = schoolById.get(booking.schoolId);
    const consultant = consultantById.get(booking.consultantId);
    if (!teacher || !school || !consultant) continue;
    items.push({
      id: `fc-${booking.id}`,
      school: { id: school.id, name: school.name },
      teacher: { id: teacher.id, name: teacher.name },
      consultant: { id: consultant.id, name: consultant.name },
      days: units,
      chargeTotal: Math.round(booking.chargeRate * units * 100) / 100,
      marginGbp: Math.round((booking.chargeRate - booking.payRate) * units * 100) / 100,
    });
  }
  return {
    period: next,
    bookings: items,
    projectedCharge: items.reduce((sum, item) => sum + item.chargeTotal, 0),
    projectedMargin: items.reduce((sum, item) => sum + item.marginGbp, 0),
    bookingCount: items.length,
  };
}

function trendFor(
  bookings: SeedBooking[],
  week: PayWeek,
  consultantId?: string,
): MarginTrendPoint[] {
  const points: MarginTrendPoint[] = [];
  for (let i = 7; i >= 0; i -= 1) {
    const slot = payWeekContaining(addWeeks(parseIsoDate(week.weekEnding), -i));
    const stats = statsFromBookings(bookings, slot, consultantId);
    points.push({
      periodId: slot.id,
      weekEnding: slot.weekEnding,
      label: slot.weekEnding.slice(5),
      chargeTotal: stats.chargeTotal,
      payCost: stats.payCost,
      marginGbp: stats.marginGbp,
    });
  }
  return points;
}

function awrWarnings(awrTeachers: TeacherWithAWR[], bookings: SeedBooking[]): WeeklyReport["awrWarnings"] {
  return awrTeachers
    .filter((teacher) => {
      if (
        teacher.awrStatus === "qualified" ||
        teacher.awrStatus === "not-applicable" ||
        teacher.awrStatus === "paused"
      ) {
        return false;
      }
      const remaining = Math.max(0, 12 - teacher.awrWeeks);
      return remaining > 0 && remaining <= 3;
    })
    .map((teacher) => {
      const live = bookings.find(
        (b) => b.teacherId === teacher.id && b.schoolId === teacher.currentSchoolId && b.status !== "cancelled",
      );
      const pay = live?.payRate ?? null;
      const charge = live?.chargeRate ?? null;
      return {
        teacher: { id: teacher.id, name: teacher.name },
        school: {
          id: teacher.currentSchoolId ?? "unknown",
          name: teacher.currentSchool ?? "Unknown school",
        },
        awrWeeks: teacher.awrWeeks,
        awrDays: teacher.awrDays,
        weeksUntilParity: Math.max(0, 12 - teacher.awrWeeks),
        projectedQualificationDate: teacher.awrQualificationDate ?? null,
        currentPayRate: pay,
        currentChargeRate: charge,
        currentMarginPerDay: pay != null && charge != null ? charge - pay : null,
        parityPayRate: null,
        projectedMarginPerDay: null,
        marginImpactPerDay: null,
      };
    })
    .sort((a, b) => a.weeksUntilParity - b.weeksUntilParity);
}

export function generateWeeklyReports(input: {
  weeks: PayWeek[];
  bookings: SeedBooking[];
  timesheets: Timesheet[];
  teachers: SeedTeacher[];
  schools: SeedSchool[];
  consultants: SeedConsultant[];
  awrTeachers: TeacherWithAWR[];
}): Record<string, WeeklyReport> {
  const { weeks, bookings, timesheets, teachers, schools, consultants, awrTeachers } = input;
  const reports: Record<string, WeeklyReport> = {};
  const warnings = awrWarnings(awrTeachers, bookings);

  const build = (week: PayWeek, consultantId?: string): WeeklyReport => {
    const lastWeek = payWeekContaining(addWeeks(parseIsoDate(week.weekEnding), -1));
    const seasonal = sameWeekLastTerm(week);
    const currentStats = statsFromBookings(bookings, week, consultantId);
    const lastWeekStats = statsFromBookings(bookings, lastWeek, consultantId);
    const lastTermStats = statsFromBookings(bookings, seasonal.week, consultantId);
    const low = groupLow(
      lowMarginRows(bookings, week, teachers, schools, consultants, consultantId).filter(isLow),
    );
    const interruptions = interruptionsFor(
      bookings,
      week,
      teachers,
      schools,
      consultants,
      consultantId,
    );
    const unapprovedSheets = timesheets.filter(
      (sheet) =>
        sheet.periodId === week.id &&
        isUnapprovedTimesheetStatus(sheet.status) &&
        sheet.hasBookings &&
        !sheet.holidayOrInset &&
        (!consultantId || sheet.consultant.id === consultantId),
    );
    const consultant = consultantId
      ? consultants.find((c) => c.id === consultantId)
      : null;
    return {
      period: week,
      scope: consultantId ? "self" : "team",
      consultant: consultant ? { id: consultant.id, name: consultant.name } : null,
      headlines: compared(
        currentStats,
        lastWeekStats,
        lastTermStats,
        seasonal.label,
        seasonal.isProxy,
      ),
      lowMargin: low,
      thresholds: DEFAULT_MARGIN_THRESHOLDS,
      awrWarnings: warnings,
      unapprovedTimesheets: {
        periodId: week.id,
        count: unapprovedSheets.length,
        chargeValue: Math.round(unapprovedSheets.reduce((sum, s) => sum + s.chargeValue, 0) * 100) / 100,
        timesheetIds: unapprovedSheets.map((s) => s.id),
      },
      interruptions,
      interruptionMarginLost: interruptions.reduce((sum, item) => sum + item.marginLost, 0),
      fillRate: fillRateFor(bookings, week, consultantId),
      dormantSchools: dormantFor(bookings, week, schools),
      forecast: forecastFor(bookings, week, teachers, schools, consultants, consultantId),
      marginTrend: trendFor(bookings, week, consultantId),
    };
  };

  for (const week of weeks) {
    reports[`team:${week.id}`] = build(week);
    for (const consultant of consultants.filter((c) => c.role === "consultant")) {
      reports[`self:${week.id}:${consultant.id}`] = build(week, consultant.id);
    }
  }

  return reports;
}
