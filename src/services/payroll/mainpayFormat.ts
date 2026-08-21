import { formatGbp, type PayrollWorkerLine, type UmbrellaPayrollLine } from "@/types/payroll";
import type { MainpayValidationIssue } from "@/types/payroll";

/**
 * Mainpay CSV column mapping.
 *
 * PLACEHOLDER NAMES — Keep Education does not yet have Mainpay's file spec.
 * When the spec arrives, change only the `header` strings here (and add or
 * remove entries). Preview, validation messaging, and the downloaded file
 * all read from this object. Do not scatter Mainpay column names through the UI.
 *
 * `key` is our internal field. `header` is the CSV column title Mainpay expects.
 */
export const MAINPAY_COLUMN_MAP = [
  { key: "workerName", header: "PLACEHOLDER_Employee_Name" },
  { key: "niNumber", header: "PLACEHOLDER_NI_Number" },
  { key: "payrollNumber", header: "PLACEHOLDER_Payroll_Number" },
  { key: "weekEnding", header: "PLACEHOLDER_Week_Ending" },
  { key: "daysWorked", header: "PLACEHOLDER_Days_Worked" },
  { key: "hoursWorked", header: "PLACEHOLDER_Hours_Worked" },
  { key: "assignmentRate", header: "PLACEHOLDER_Assignment_Rate" },
  { key: "assignmentTotal", header: "PLACEHOLDER_Assignment_Total" },
  { key: "schools", header: "PLACEHOLDER_Schools" },
  { key: "umbrellaProvider", header: "PLACEHOLDER_Umbrella_Provider" },
] as const;

export type MainpayColumnKey = (typeof MAINPAY_COLUMN_MAP)[number]["key"];

export type MainpayCsvRow = Record<MainpayColumnKey, string>;

export function isUmbrellaLine(line: PayrollWorkerLine): line is UmbrellaPayrollLine {
  return line.payrollType === "umbrella";
}

export function toMainpayRow(
  line: UmbrellaPayrollLine,
  weekEnding: string,
): MainpayCsvRow {
  return {
    workerName: line.worker.name,
    niNumber: line.niNumber ?? "",
    payrollNumber: line.payrollNumber ?? "",
    weekEnding,
    daysWorked: String(line.daysWorked),
    hoursWorked: String(line.hoursWorked),
    assignmentRate:
      line.cost.payRate == null ? "" : formatGbp(line.cost.payRate),
    assignmentTotal: formatGbp(line.grossPay),
    schools: line.schools.map((school) => school.name).join("; "),
    umbrellaProvider: line.umbrellaProvider,
  };
}

export function mainpayHeaders(): string[] {
  return MAINPAY_COLUMN_MAP.map((column) => column.header);
}

export function mainpayRowValues(row: MainpayCsvRow): string[] {
  return MAINPAY_COLUMN_MAP.map((column) => row[column.key]);
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateMainpayCsv(rows: MainpayCsvRow[]): string {
  const headerLine = mainpayHeaders().map(csvEscape).join(",");
  const body = rows.map((row) => mainpayRowValues(row).map(csvEscape).join(","));
  return [headerLine, ...body].join("\r\n") + "\r\n";
}

export function validateMainpayLines(
  lines: UmbrellaPayrollLine[],
): MainpayValidationIssue[] {
  const issues: MainpayValidationIssue[] = [];

  for (const line of lines) {
    if (!line.niNumber || line.niNumber.trim() === "") {
      issues.push({
        lineId: line.id,
        workerName: line.worker.name,
        code: "missing_ni",
        message: "Missing NI number",
      });
    }

    if (line.cost.payRate == null || line.cost.payRate <= 0) {
      issues.push({
        lineId: line.id,
        workerName: line.worker.name,
        code: "missing_rate",
        message: "Missing or zero assignment rate",
      });
    }

    if (line.daysWorked <= 0 && line.hoursWorked <= 0) {
      issues.push({
        lineId: line.id,
        workerName: line.worker.name,
        code: "zero_hours",
        message: "Zero days and hours — nothing to pay",
      });
    }
  }

  return issues;
}
