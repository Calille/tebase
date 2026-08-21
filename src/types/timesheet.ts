import type { PartyRef } from "./party";
import type { PayrollCostModel } from "./payroll";

/**
 * Timesheet status is an explicit union, not a free string.
 *
 * Typical paths:
 *   draft → sent → viewed → approved
 *                 ↘ queried → resolved → approved
 * plus: overdue, void
 *
 * Expanded on the Timesheets page. Weekly Report only needs the
 * unapproved (not yet invoiceable) subset.
 */
export type TimesheetStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "approved"
  | "queried"
  | "resolved"
  | "overdue"
  | "void";

export const UNAPPROVED_TIMESHEET_STATUSES: readonly TimesheetStatus[] = [
  "draft",
  "sent",
  "viewed",
  "queried",
  "resolved",
  "overdue",
] as const;

export function isUnapprovedTimesheetStatus(
  status: TimesheetStatus,
): boolean {
  return (UNAPPROVED_TIMESHEET_STATUSES as readonly string[]).includes(status);
}

export type TimesheetQueryReason =
  | "wrong_hours"
  | "wrong_days"
  | "teacher_did_not_attend"
  | "wrong_rate"
  | "assignment_changed"
  | "other";

export interface Timesheet {
  id: string;
  periodId: string;
  bookingId: string;
  school: PartyRef;
  teacher: PartyRef;
  consultant: PartyRef;
  status: TimesheetStatus;
  /** Pre-filled from the booking before Friday is worked. */
  expectedHours: number;
  expectedDays: number;
  /** School-confirmed (or proposed) hours. Null until the school responds. */
  confirmedHours: number | null;
  confirmedDays: number | null;
  cost: PayrollCostModel;
  /**
   * Charge value of the sheet. Uses confirmed hours when present,
   * otherwise expected hours.
   */
  chargeValue: number;
}

export interface UnapprovedTimesheetSummary {
  periodId: string;
  count: number;
  chargeValue: number;
  timesheetIds: string[];
}
