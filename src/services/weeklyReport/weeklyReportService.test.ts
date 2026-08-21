import { beforeEach, describe, expect, it } from "vitest";
import { resetSettingsStoreForTests } from "@/services/settings/settingsService";
import { resetTimesheetStoreForTests } from "@/services/timesheets/timesheetService";
import { timesheetService } from "@/services/timesheets/timesheetService";
import {
  groupLowMarginBySchool,
  isLowMarginBooking,
  weeklyReportService,
} from "@/services/weeklyReport/weeklyReportService";
import { DEFAULT_MARGIN_THRESHOLDS } from "@/types/settings";
import type { LowMarginBooking } from "@/types/weeklyReport";

const PERIOD = "2026-08-23";

function booking(
  overrides: Partial<LowMarginBooking> & Pick<LowMarginBooking, "id" | "school">,
): LowMarginBooking {
  return {
    teacher: { id: "t", name: "T" },
    consultant: { id: "c", name: "C" },
    payRate: 180,
    chargeRate: 200,
    marginPerDay: 20,
    marginPercent: 10,
    days: 3,
    ...overrides,
  };
}

describe("low margin grouping", () => {
  it("alerts when either the £ floor or the % floor is missed", () => {
    const thresholds = { poundsPerDayFloor: 40, percentFloor: 20 };
    expect(
      isLowMarginBooking(
        booking({
          id: "a",
          school: { id: "s", name: "S" },
          marginPerDay: 50,
          marginPercent: 10,
        }),
        thresholds,
      ),
    ).toBe(true);
    expect(
      isLowMarginBooking(
        booking({
          id: "b",
          school: { id: "s", name: "S" },
          marginPerDay: 20,
          marginPercent: 30,
        }),
        thresholds,
      ),
    ).toBe(true);
    expect(
      isLowMarginBooking(
        booking({
          id: "c",
          school: { id: "s", name: "S" },
          marginPerDay: 50,
          marginPercent: 30,
        }),
        thresholds,
      ),
    ).toBe(false);
  });

  it("groups repeat offenders by school, worst first", () => {
    const groups = groupLowMarginBySchool([
      booking({
        id: "1",
        school: { id: "oak", name: "Oakridge" },
        marginPerDay: 25,
        teacher: { id: "a", name: "A" },
      }),
      booking({
        id: "2",
        school: { id: "oak", name: "Oakridge" },
        marginPerDay: 15,
        teacher: { id: "b", name: "B" },
      }),
      booking({
        id: "3",
        school: { id: "h", name: "Harbour" },
        marginPerDay: 30,
        teacher: { id: "c", name: "C" },
      }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].school.id).toBe("oak");
    expect(groups[0].bookingCount).toBe(2);
    expect(groups[0].worstMarginPerDay).toBe(15);
    expect(groups[0].teachers.map((t) => t.name).sort()).toEqual(["A", "B"]);
  });
});

describe("weeklyReportService", () => {
  beforeEach(() => {
    resetSettingsStoreForTests();
    resetTimesheetStoreForTests();
  });

  it("loads a team report with seasonal comparisons and 8-week trend", async () => {
    const report = await weeklyReportService.getReport({
      periodId: PERIOD,
      scope: "team",
    });

    expect(report.period.weekEnding).toBe(PERIOD);
    expect(report.headlines.current.chargeTotal).toBeGreaterThan(0);
    expect(report.headlines.lastTermLabel.length).toBeGreaterThan(0);
    expect(report.marginTrend).toHaveLength(8);
    expect(report.lowMargin.some((group) => group.bookingCount > 1)).toBe(true);
    expect(report.awrWarnings.some((item) => item.teacher.name === "Sarah Johnson")).toBe(
      true,
    );
    expect(report.awrWarnings.every((item) => item.parityPayRate === null)).toBe(
      true,
    );
    expect(report.unapprovedTimesheets.count).toBeGreaterThan(0);
    expect(report.unapprovedTimesheets.chargeValue).toBeGreaterThan(0);
    expect(report.dormantSchools[0]?.school.name).toBe("Meadowbank Primary");
    expect(report.forecast.bookingCount).toBeGreaterThan(0);
    expect(report.thresholds).toEqual(DEFAULT_MARGIN_THRESHOLDS);
  });

  it("scopes self view to one consultant", async () => {
    const report = await weeklyReportService.getReport({
      periodId: PERIOD,
      scope: "self",
      consultantId: "cons-alex",
    });
    expect(report.consultant?.name).toBe("Alex Patel");
    expect(
      report.lowMargin
        .flatMap((group) => group.bookings)
        .every((row) => row.consultant.id === "cons-alex"),
    ).toBe(true);
  });
});

describe("timesheetService unapproved summary", () => {
  beforeEach(() => {
    resetTimesheetStoreForTests();
  });

  it("excludes approved sheets from the uninvoiceable total", async () => {
    const all = await timesheetService.getUnapprovedSummary(PERIOD);
    const alex = await timesheetService.getUnapprovedSummary(PERIOD, "cons-alex");
    expect(all.count).toBeGreaterThan(alex.count);
    expect(alex.count).toBeGreaterThan(0);
  });
});
