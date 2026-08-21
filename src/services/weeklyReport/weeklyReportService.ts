import { addWeeks } from "date-fns";
import { AWRService } from "@/services/awrService";
import { settingsService } from "@/services/settings/settingsService";
import { timesheetService } from "@/services/timesheets/timesheetService";
import { listPayWeeks, parseIsoDate, payWeekContaining } from "@/lib/payWeek";
import { sameWeekLastTerm } from "@/lib/terms";
import type { PartyRef } from "@/types/party";
import type { PayWeek } from "@/types/payroll";
import type { TeacherWithAWR } from "@/types/awr";
import type { MarginThresholdSettings } from "@/types/settings";
import {
  deltaBetween,
  type AwrWeek12Warning,
  type LowMarginBooking,
  type LowMarginSchoolGroup,
  type WeeklyHeadline,
  type WeeklyReport,
  type WeeklyReportScope,
  type WeekStats,
} from "@/types/weeklyReport";
import {
  currentRateForTeacher,
  mockDormantSchools,
  mockFillRate,
  mockForecast,
  mockInterruptions,
  mockLowMarginBookings,
  mockStatsForWeek,
  mockTrend,
} from "./mockData";
import { consultantById, consultantByName } from "./mockRefs";

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

export function isLowMarginBooking(
  booking: LowMarginBooking,
  thresholds: MarginThresholdSettings,
): boolean {
  return (
    booking.marginPerDay < thresholds.poundsPerDayFloor ||
    booking.marginPercent < thresholds.percentFloor
  );
}

export function groupLowMarginBySchool(
  bookings: LowMarginBooking[],
): LowMarginSchoolGroup[] {
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

function weeksUntilParity(teacher: TeacherWithAWR): number {
  return Math.max(0, 12 - teacher.awrWeeks);
}

async function awrWarnings(): Promise<AwrWeek12Warning[]> {
  const teachers = await AWRService.getAllTeachersWithAWR();
  return teachers
    .filter((teacher) => {
      if (
        teacher.awrStatus === "qualified" ||
        teacher.awrStatus === "not-applicable" ||
        teacher.awrStatus === "paused"
      ) {
        return false;
      }
      const remaining = weeksUntilParity(teacher);
      return remaining > 0 && remaining <= 3;
    })
    .map((teacher) => {
      const projected = AWRService.getProjectedQualificationDate(teacher);
      const rates = currentRateForTeacher(teacher.name);
      const currentMargin =
        rates != null ? rates.chargeRate - rates.payRate : null;
      return {
        teacher: { id: teacher.id, name: teacher.name },
        school: {
          id: teacher.currentSchoolId ?? "unknown",
          name: teacher.currentSchool ?? "Unknown school",
        },
        awrWeeks: teacher.awrWeeks,
        awrDays: teacher.awrDays,
        weeksUntilParity: weeksUntilParity(teacher),
        projectedQualificationDate: projected
          ? projected.toISOString()
          : teacher.awrQualificationDate ?? null,
        currentPayRate: rates?.payRate ?? null,
        currentChargeRate: rates?.chargeRate ?? null,
        currentMarginPerDay: currentMargin,
        parityPayRate: null,
        projectedMarginPerDay: null,
        marginImpactPerDay: null,
      };
    })
    .sort((a, b) => a.weeksUntilParity - b.weeksUntilParity);
}

export function resolveConsultant(
  user: { id: string; name?: string } | null,
): PartyRef | null {
  if (!user) return null;
  return consultantById(user.id) ?? consultantByName(user.name ?? "") ?? null;
}

/**
 * Weekly report domain service.
 *
 * Components must call this module only. AWR warnings are read from
 * AWRService; unapproved timesheet value is read from timesheetService;
 * thresholds come from settingsService.
 */
export const weeklyReportService = {
  async getPayWeeks(): Promise<PayWeek[]> {
    return listPayWeeks(new Date(), 12);
  },

  async getCurrentPayWeek(): Promise<PayWeek> {
    const weeks = await this.getPayWeeks();
    return weeks[0] ?? payWeekContaining(new Date());
  },

  async getReport(input: {
    periodId: string;
    scope: WeeklyReportScope;
    consultantId?: string | null;
  }): Promise<WeeklyReport> {
    const period = payWeekContaining(parseIsoDate(input.periodId));
    const consultantId =
      input.scope === "self" ? input.consultantId ?? undefined : undefined;
    const consultant = consultantId ? consultantById(consultantId) ?? null : null;

    const [thresholds, unapproved, awr] = await Promise.all([
      settingsService.getMarginThresholds(),
      timesheetService.getUnapprovedSummary(period.id, consultantId),
      awrWarnings(),
    ]);

    const lastWeek = payWeekContaining(
      addWeeks(parseIsoDate(period.weekEnding), -1),
    );
    const seasonal = sameWeekLastTerm(period);

    const currentStats = mockStatsForWeek(period, consultantId);
    const lastWeekStats = mockStatsForWeek(lastWeek, consultantId);
    const lastTermStats = mockStatsForWeek(seasonal.week, consultantId);

    const lowMargin = groupLowMarginBySchool(
      mockLowMarginBookings(period, consultantId).filter((booking) =>
        isLowMarginBooking(booking, thresholds),
      ),
    );

    const interruptions = mockInterruptions(period, consultantId);
    const forecast = mockForecast(period, consultantId);

    return {
      period,
      scope: input.scope,
      consultant,
      headlines: compared(
        currentStats,
        lastWeekStats,
        lastTermStats,
        seasonal.label,
        seasonal.isProxy,
      ),
      lowMargin,
      thresholds,
      awrWarnings: awr,
      unapprovedTimesheets: unapproved,
      interruptions,
      interruptionMarginLost: interruptions.reduce(
        (sum, item) => sum + item.marginLost,
        0,
      ),
      fillRate: mockFillRate(period, consultantId),
      dormantSchools: mockDormantSchools(period),
      forecast,
      marginTrend: mockTrend(period, consultantId),
    };
  },
};
