import { roundGbp } from "@/types/payroll";
import { resolveChargeRate, type Timesheet, type WorkedDay } from "@/types/timesheet";
import type { BillTo } from "@/types/billing";
import type { XeroCandidateGroup, XeroPushLine } from "@/types/xero";
import { TEACHER_ROLE_LABELS } from "@/types/timesheet";

export function pushLineId(timesheetId: string, date: string): string {
  return `${timesheetId}:${date}`;
}

export function buildPushLine(sheet: Timesheet, day: WorkedDay): XeroPushLine {
  const unitAmount = resolveChargeRate(
    sheet.rateSchedule,
    day.date,
    day.unitType,
  );
  const rateProblem =
    unitAmount == null
      ? `No ${day.unitType} rate in force on ${day.date} for ${sheet.teacher.name} at ${sheet.school.name}.`
      : undefined;

  return {
    id: pushLineId(sheet.id, day.date),
    timesheetId: sheet.id,
    school: { ...sheet.school },
    teacher: { ...sheet.teacher },
    consultant: { ...sheet.consultant },
    role: day.role,
    dateWorked: day.date,
    units: day.units,
    unitType: day.unitType,
    unitAmount,
    rateProblem,
  };
}

export function linesFromSheet(sheet: Timesheet): XeroPushLine[] {
  return sheet.workedDays.map((day) => buildPushLine(sheet, day));
}

export function lineCharge(line: XeroPushLine): number | null {
  if (line.unitAmount == null) return null;
  return roundGbp(line.unitAmount * line.units);
}

export function lineDescription(line: XeroPushLine): string {
  return [
    line.teacher.name,
    TEACHER_ROLE_LABELS[line.role],
    line.school.name,
    line.dateWorked,
  ].join(" · ");
}

export function splitGroups(
  billTo: BillTo,
  lines: XeroPushLine[],
): XeroCandidateGroup[] {
  if (lines.length === 0) return [];
  if (billTo.grouping === "consolidated") {
    return [
      {
        key: `${billTo.id}:all`,
        billTo,
        school: null,
        grouping: billTo.grouping,
        lines,
      },
    ];
  }
  const bySchool = new Map<string, XeroPushLine[]>();
  for (const line of lines) {
    const list = bySchool.get(line.school.id) ?? [];
    list.push(line);
    bySchool.set(line.school.id, list);
  }
  return [...bySchool.values()].map((schoolLines) => ({
    key: `${billTo.id}:${schoolLines[0].school.id}`,
    billTo,
    school: schoolLines[0].school,
    grouping: billTo.grouping,
    lines: schoolLines,
  }));
}
