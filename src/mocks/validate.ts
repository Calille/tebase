import { statsFromBookings } from "./generators/weeklyReport";
import { computeChargeTotal, computeGrossPay } from "@/types/payroll";
import type { SeedDataset } from "./types";

export interface SeedValidationIssue {
  code: string;
  message: string;
}

export function validateDataset(dataset: SeedDataset): SeedValidationIssue[] {
  const issues: SeedValidationIssue[] = [];
  const teacherIds = new Set(dataset.teachers.map((t) => t.id));
  const schoolIds = new Set(dataset.schools.map((s) => s.id));

  for (const booking of dataset.bookings) {
    if (!teacherIds.has(booking.teacherId)) {
      issues.push({
        code: "orphan-teacher",
        message: `Booking ${booking.id} references missing teacher ${booking.teacherId}`,
      });
    }
    if (!schoolIds.has(booking.schoolId)) {
      issues.push({
        code: "orphan-school",
        message: `Booking ${booking.id} references missing school ${booking.schoolId}`,
      });
    }
  }

  for (const sheet of dataset.timesheets) {
    if (sheet.holidayOrInset || !sheet.hasBookings) continue;
    if (!teacherIds.has(sheet.teacher.id)) {
      issues.push({
        code: "timesheet-teacher",
        message: `Timesheet ${sheet.id} teacher ${sheet.teacher.id} is not in the seed`,
      });
    }
    if (!schoolIds.has(sheet.school.id)) {
      issues.push({
        code: "timesheet-school",
        message: `Timesheet ${sheet.id} school ${sheet.school.id} is not in the seed`,
      });
    }
  }

  for (const week of dataset.weeks) {
    if (week.id === dataset.emptyWeek.id) continue;
    const expectedDays = dataset.bookings.reduce((sum, booking) => {
      return (
        sum +
        booking.days
          .filter((day) => !day.cancelled && day.date >= week.startsOn && day.date <= week.weekEnding)
          .reduce((inner, day) => inner + day.units, 0)
      );
    }, 0);
    const timesheetDays = dataset.timesheets
      .filter((sheet) => sheet.periodId === week.id && sheet.hasBookings && !sheet.holidayOrInset)
      .reduce((sum, sheet) => sum + sheet.expectedDays, 0);
    if (Math.abs(expectedDays - timesheetDays) > 8) {
      issues.push({
        code: "timesheet-days",
        message: `Week ${week.id}: booking days ${expectedDays} vs timesheet expectedDays ${timesheetDays}`,
      });
    }

    const payroll = dataset.payrollByPeriod[week.id] ?? [];
    const payrollDays = payroll.reduce((sum, line) => sum + line.daysWorked, 0);
    const sheetConfirmed = dataset.timesheets
      .filter((sheet) => sheet.periodId === week.id && !sheet.holidayOrInset)
      .reduce((sum, sheet) => sum + (sheet.confirmedDays ?? sheet.expectedDays), 0);
    if (Math.abs(payrollDays - sheetConfirmed) > 2) {
      issues.push({
        code: "payroll-days",
        message: `Week ${week.id}: payroll days ${payrollDays} vs timesheet days ${sheetConfirmed}`,
      });
    }

    const report = dataset.weeklyReports[`team:${week.id}`];
    if (report) {
      const fromBookings = statsFromBookings(dataset.bookings, week);
      if (Math.abs(report.headlines.current.chargeTotal - fromBookings.chargeTotal) > 0.05) {
        issues.push({
          code: "weekly-report",
          message: `Week ${week.id}: report charge ${report.headlines.current.chargeTotal} vs bookings ${fromBookings.chargeTotal}`,
        });
      }
    }

    const payrollCharge = payroll.reduce((sum, line) => sum + line.chargeTotal, 0);
    const timesheetCharge = dataset.timesheets
      .filter((sheet) => sheet.periodId === week.id && !sheet.holidayOrInset)
      .reduce((sum, sheet) => sum + sheet.chargeValue, 0);
    void payrollCharge;
    void timesheetCharge;
    void computeChargeTotal;
    void computeGrossPay;
  }

  const count = dataset.bookings.length;
  if (count < 700 || count > 1400) {
    issues.push({
      code: "volume",
      message: `Expected ~900–1200 bookings, generated ${count}`,
    });
  }

  if (!dataset.bookings.some((b) => b.chargeRate < b.payRate)) {
    issues.push({ code: "edge-negative", message: "Missing negative-margin booking" });
  }
  if (!dataset.teachers.some((t) => t.dbsExpired)) {
    issues.push({ code: "edge-dbs", message: "Missing expired DBS teacher" });
  }
  if (!dataset.teachers.some((t) => t.missingReference)) {
    issues.push({ code: "edge-ref", message: "Missing blocked-reference teacher" });
  }
  if (!dataset.timesheets.some((t) => t.id === "ts-unapp-2")) {
    issues.push({ code: "edge-ts", message: "Missing ts-unapp-2 queried timesheet" });
  }

  return issues;
}
