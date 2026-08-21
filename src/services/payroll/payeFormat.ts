import { formatGbp, type PayePayrollLine, type PayrollWorkerLine } from "@/types/payroll";
import type { MainpayValidationIssue } from "@/types/payroll";

/**
 * PAYE bureau CSV column mapping.
 *
 * PLACEHOLDER NAMES — Keep Education does not yet have a locked PAYE file spec
 * (IRIS / Sage / BrightPay / in-house). When the spec arrives, change only the
 * `header` strings here. Preview, validation, and the downloaded file all read
 * from this object.
 */
export const PAYE_COLUMN_MAP = [
  { key: "workerName", header: "PLACEHOLDER_Employee_Name" },
  { key: "niNumber", header: "PLACEHOLDER_NI_Number" },
  { key: "payrollNumber", header: "PLACEHOLDER_Payroll_Number" },
  { key: "weekEnding", header: "PLACEHOLDER_Week_Ending" },
  { key: "daysWorked", header: "PLACEHOLDER_Days_Worked" },
  { key: "hoursWorked", header: "PLACEHOLDER_Hours_Worked" },
  { key: "payRate", header: "PLACEHOLDER_Pay_Rate" },
  { key: "grossPay", header: "PLACEHOLDER_Gross_Pay" },
  { key: "employerNi", header: "PLACEHOLDER_Employer_NI" },
  { key: "holidayAccrual", header: "PLACEHOLDER_Holiday_Accrual" },
  { key: "pensionCost", header: "PLACEHOLDER_Pension" },
  { key: "schools", header: "PLACEHOLDER_Schools" },
] as const;

export type PayeColumnKey = (typeof PAYE_COLUMN_MAP)[number]["key"];

export type PayeCsvRow = Record<PayeColumnKey, string>;

export function isPayeLine(line: PayrollWorkerLine): line is PayePayrollLine {
  return line.payrollType === "paye";
}

function moneyOrEmpty(value: number | null | undefined): string {
  if (value == null) return "";
  return formatGbp(value);
}

export function toPayeRow(line: PayePayrollLine, weekEnding: string): PayeCsvRow {
  return {
    workerName: line.worker.name,
    niNumber: line.niNumber ?? "",
    payrollNumber: line.payrollNumber ?? "",
    weekEnding,
    daysWorked: String(line.daysWorked),
    hoursWorked: String(line.hoursWorked),
    payRate: moneyOrEmpty(line.cost.payRate),
    grossPay: formatGbp(line.grossPay),
    employerNi: moneyOrEmpty(line.cost.employerNi),
    holidayAccrual: moneyOrEmpty(line.cost.holidayAccrual),
    pensionCost: moneyOrEmpty(line.cost.pensionCost),
    schools: line.schools.map((school) => school.name).join("; "),
  };
}

export function payeHeaders(): string[] {
  return PAYE_COLUMN_MAP.map((column) => column.header);
}

export function payeRowValues(row: PayeCsvRow): string[] {
  return PAYE_COLUMN_MAP.map((column) => row[column.key]);
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generatePayeCsv(rows: PayeCsvRow[]): string {
  const headerLine = payeHeaders().map(csvEscape).join(",");
  const body = rows.map((row) => payeRowValues(row).map(csvEscape).join(","));
  return [headerLine, ...body].join("\r\n") + "\r\n";
}

export function validatePayeLines(lines: PayePayrollLine[]): MainpayValidationIssue[] {
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
        message: "Missing or zero pay rate",
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
