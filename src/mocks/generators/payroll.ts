import {
  computeChargeTotal,
  computeGrossPay,
  computeMarginContribution,
  type PayWeek,
  type PayrollWorkerLine,
} from "@/types/payroll";
import type { Timesheet } from "@/types/timesheet";
import type { SeedConsultant, SeedSchool, SeedTeacher } from "../types";

export function generatePayroll(input: {
  weeks: PayWeek[];
  timesheets: Timesheet[];
  teachers: SeedTeacher[];
  schools: SeedSchool[];
  consultants: SeedConsultant[];
}): Record<string, PayrollWorkerLine[]> {
  const { weeks, timesheets, teachers, consultants } = input;
  const teacherById = new Map(teachers.map((t) => [t.id, t]));
  const consultantById = new Map(consultants.map((c) => [c.id, c]));
  const byPeriod: Record<string, PayrollWorkerLine[]> = {};

  for (const week of weeks) {
    const sheets = timesheets.filter(
      (sheet) => sheet.periodId === week.id && !sheet.holidayOrInset,
    );
    const grouped = new Map<string, Timesheet[]>();
    for (const sheet of sheets) {
      const list = grouped.get(sheet.teacher.id) ?? [];
      list.push(sheet);
      grouped.set(sheet.teacher.id, list);
    }

    const lines: PayrollWorkerLine[] = [];
    for (const [teacherId, group] of grouped) {
      const teacher = teacherById.get(teacherId);
      if (!teacher) continue;
      const daysWorked = Math.round(
        group.reduce((sum, sheet) => sum + (sheet.confirmedDays ?? sheet.expectedDays), 0) * 10,
      ) / 10;
      const payRate = teacher.payRate ?? group[0]?.cost.payRate ?? null;
      const chargeRate = teacher.chargeRate ?? group[0]?.cost.chargeRate ?? null;
      const cost = {
        payRate,
        chargeRate,
        employerNi: teacher.payrollType === "paye" && payRate != null ? Math.round(payRate * 0.138 * 100) / 100 : undefined,
        holidayAccrual: payRate != null ? Math.round(payRate * 0.1207 * 100) / 100 : undefined,
        pensionCost: teacher.payrollType === "paye" && payRate != null ? Math.round(payRate * 0.03 * 100) / 100 : undefined,
      };
      const units = daysWorked;
      const consultant =
        consultantById.get(group[0]!.consultant.id) ?? group[0]!.consultant;
      const schools = uniqueSchools(group);
      const base = {
        id: `pay-${week.id}-${teacher.id}`,
        periodId: week.id,
        worker: { id: teacher.id, name: teacher.name },
        niNumber: teacher.niNumber,
        payrollNumber: teacher.payrollNumber,
        consultant: { id: consultant.id, name: consultant.name },
        schools,
        daysWorked,
        hoursWorked: Math.round(daysWorked * 6.5 * 10) / 10,
        rateUnit: "daily" as const,
        cost,
        grossPay: computeGrossPay(cost, units),
        chargeTotal: computeChargeTotal(cost, units),
        marginContribution: computeMarginContribution(cost, units),
      };
      if (teacher.payrollType === "umbrella") {
        lines.push({
          ...base,
          payrollType: "umbrella",
          umbrellaProvider: teacher.umbrellaProvider ?? "Mainpay",
        });
      } else {
        lines.push({ ...base, payrollType: "paye" });
      }
    }
    byPeriod[week.id] = lines;
  }

  return byPeriod;
}

function uniqueSchools(sheets: Timesheet[]) {
  const map = new Map<string, { id: string; name: string }>();
  for (const sheet of sheets) map.set(sheet.school.id, sheet.school);
  return [...map.values()];
}
