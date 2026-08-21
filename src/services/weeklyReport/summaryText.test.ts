import { describe, expect, it } from "vitest";
import { buildWeeklyReportSummary } from "@/services/weeklyReport/summaryText";
import { payWeekContaining } from "@/lib/payWeek";
import { emptyWeekStats } from "@/types/weeklyReport";
import { DEFAULT_MARGIN_THRESHOLDS } from "@/types/settings";
import type { WeeklyReport } from "@/types/weeklyReport";

describe("buildWeeklyReportSummary", () => {
  it("includes the headline numbers and low-margin block", () => {
    const period = payWeekContaining(new Date(2026, 7, 21, 12));
    const report: WeeklyReport = {
      period,
      scope: "team",
      consultant: null,
      headlines: {
        charge: {
          current: 1000,
          lastWeek: { absolute: 50, percent: 5 },
          lastTerm: { absolute: -20, percent: -2 },
        },
        payCost: {
          current: 700,
          lastWeek: { absolute: 0, percent: 0 },
          lastTerm: { absolute: 0, percent: 0 },
        },
        marginGbp: {
          current: 300,
          lastWeek: { absolute: 0, percent: 0 },
          lastTerm: { absolute: 0, percent: 0 },
        },
        marginPercent: {
          current: 30,
          lastWeek: { absolute: 0, percent: 0 },
          lastTerm: { absolute: 0, percent: 0 },
        },
        daysFilled: {
          current: 10,
          lastWeek: { absolute: 0, percent: 0 },
          lastTerm: { absolute: 0, percent: 0 },
        },
        current: {
          chargeTotal: 1000,
          payCost: 700,
          marginGbp: 300,
          marginPercent: 30,
          daysFilled: 10,
        },
        lastWeek: emptyWeekStats(),
        lastTerm: emptyWeekStats(),
        lastTermLabel: "Spring 2026, week 1",
        lastTermIsProxy: false,
      },
      lowMargin: [],
      thresholds: DEFAULT_MARGIN_THRESHOLDS,
      awrWarnings: [],
      unapprovedTimesheets: {
        periodId: period.id,
        count: 2,
        chargeValue: 400,
        timesheetIds: ["a", "b"],
      },
      interruptions: [],
      interruptionMarginLost: 0,
      fillRate: {
        received: 10,
        filled: 8,
        lost: 2,
        fillPercent: 80,
        lossReasons: [{ reason: "Teacher unavailable", count: 2 }],
      },
      dormantSchools: [],
      forecast: {
        period,
        bookings: [],
        projectedCharge: 0,
        projectedMargin: 0,
        bookingCount: 0,
      },
      marginTrend: [],
    };

    const text = buildWeeklyReportSummary(report);
    expect(text).toContain("Team roll-up");
    expect(text).toContain("UNAPPROVED TIMESHEETS");
    expect(text).toContain("£400.00");
    expect(text).toContain("LOW MARGIN ALERTS");
  });
});
