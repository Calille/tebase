/**
 * Payroll domain types. Shared so services and UI do not redeclare them.
 *
 * Margin is currently charge rate − pay rate (simple). Optional true-cost
 * fields exist on the cost model but are unused until product says otherwise.
 */

import type { PartyRef } from "./party";

export type PayrollPartyRef = PartyRef;

export type PayrollType = "paye" | "umbrella";

export type PayrollRateUnit = "daily" | "hourly";

/**
 * Cost model for a payroll line.
 *
 * `employerNi`, `holidayAccrual` and `pensionCost` are unused in margin
 * today. They are here so a true-cost switch does not reshape every type.
 */
export interface PayrollCostModel {
  payRate: number | null;
  chargeRate: number | null;
  employerNi?: number;
  holidayAccrual?: number;
  pensionCost?: number;
}

/**
 * Pay weeks run Monday–Sunday. The week-ending date is Sunday.
 *
 * This weekday is an assumption pending confirmation from Keep Education.
 */
export interface PayWeek {
  /** Week-ending date, ISO `yyyy-MM-dd`. Also used as the period id. */
  id: string;
  startsOn: string;
  weekEnding: string;
  label: string;
}

export interface PayrollLineBase {
  id: string;
  periodId: string;
  worker: PayrollPartyRef;
  niNumber: string | null;
  payrollNumber: string | null;
  consultant: PayrollPartyRef;
  schools: PayrollPartyRef[];
  daysWorked: number;
  hoursWorked: number;
  rateUnit: PayrollRateUnit;
  cost: PayrollCostModel;
  /** Units × pay rate. For PAYE this is teacher gross; for umbrella, the assignment total remitted to the provider. */
  grossPay: number;
  chargeTotal: number;
  /** (charge rate − pay rate) × units. Does not include employer on-costs. */
  marginContribution: number;
}

export interface PayePayrollLine extends PayrollLineBase {
  payrollType: "paye";
}

export interface UmbrellaPayrollLine extends PayrollLineBase {
  payrollType: "umbrella";
  /** Provider name, not a boolean. Mainpay is the only value in mock data. */
  umbrellaProvider: string;
}

export type PayrollWorkerLine = PayePayrollLine | UmbrellaPayrollLine;

export interface PayrollGroupSummary {
  payrollType: PayrollType;
  workerCount: number;
  daysWorked: number;
  hoursWorked: number;
  grossPay: number;
  chargeTotal: number;
  marginContribution: number;
}

export interface PayrollRun {
  period: PayWeek;
  lines: PayrollWorkerLine[];
  totalGrossPay: number;
  paye: PayrollGroupSummary;
  umbrella: PayrollGroupSummary;
}

export interface PayrollFilters {
  consultantId?: string;
  schoolId?: string;
  payrollType?: PayrollType | "all";
  search?: string;
}

export interface MainpayExportRecord {
  id: string;
  exportedAt: string;
  periodId: string;
  weekEnding: string;
  rowCount: number;
  exportedBy: PayrollPartyRef;
}

export type MainpayValidationIssueCode =
  | "missing_ni"
  | "missing_rate"
  | "zero_hours";

export interface MainpayValidationIssue {
  lineId: string;
  workerName: string;
  code: MainpayValidationIssueCode;
  message: string;
}

export function unitsWorked(line: Pick<PayrollLineBase, "rateUnit" | "daysWorked" | "hoursWorked">): number {
  return line.rateUnit === "hourly" ? line.hoursWorked : line.daysWorked;
}

/**
 * Simple margin: charge rate − pay rate. Employer on-costs are ignored.
 */
export function marginPerUnit(cost: PayrollCostModel): number {
  if (cost.payRate == null || cost.chargeRate == null) return 0;
  return cost.chargeRate - cost.payRate;
}

export function computeGrossPay(
  cost: PayrollCostModel,
  units: number,
): number {
  if (cost.payRate == null) return 0;
  return roundGbp(cost.payRate * units);
}

export function computeChargeTotal(
  cost: PayrollCostModel,
  units: number,
): number {
  if (cost.chargeRate == null) return 0;
  return roundGbp(cost.chargeRate * units);
}

export function computeMarginContribution(
  cost: PayrollCostModel,
  units: number,
): number {
  return roundGbp(marginPerUnit(cost) * units);
}

export function roundGbp(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatGbp(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

export function emptyGroupSummary(
  payrollType: PayrollType,
): PayrollGroupSummary {
  return {
    payrollType,
    workerCount: 0,
    daysWorked: 0,
    hoursWorked: 0,
    grossPay: 0,
    chargeTotal: 0,
    marginContribution: 0,
  };
}

export function summariseGroup(
  payrollType: PayrollType,
  lines: PayrollWorkerLine[],
): PayrollGroupSummary {
  return lines.reduce<PayrollGroupSummary>(
    (acc, line) => ({
      payrollType,
      workerCount: acc.workerCount + 1,
      daysWorked: acc.daysWorked + line.daysWorked,
      hoursWorked: acc.hoursWorked + line.hoursWorked,
      grossPay: roundGbp(acc.grossPay + line.grossPay),
      chargeTotal: roundGbp(acc.chargeTotal + line.chargeTotal),
      marginContribution: roundGbp(
        acc.marginContribution + line.marginContribution,
      ),
    }),
    emptyGroupSummary(payrollType),
  );
}
