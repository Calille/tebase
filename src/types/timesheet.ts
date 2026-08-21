import type { PartyRef } from "./party";
import type { PayrollCostModel } from "./payroll";

export type TeacherRole =
  | "supply_teacher"
  | "teaching_assistant"
  | "cover_supervisor"
  | "hlta"
  | "nursery_nurse"
  | "instructor";

export const TEACHER_ROLE_LABELS: Record<TeacherRole, string> = {
  supply_teacher: "Supply teacher",
  teaching_assistant: "Teaching assistant",
  cover_supervisor: "Cover supervisor",
  hlta: "HLTA",
  nursery_nurse: "Nursery nurse",
  instructor: "Instructor",
};

export type WorkedUnitType = "day" | "hour";

export interface WorkedDay {
  date: string;
  units: number;
  unitType: WorkedUnitType;
  role: TeacherRole;
}

/**
 * Charge rates in force over a date range (inclusive). Long-term bookings and
 * AWR parity change the rate mid-assignment — invoice lines must use the
 * rate on the date worked, not the current rate.
 */
export interface RatePeriod {
  from: string;
  to: string;
  dayRate?: number;
  hourRate?: number;
}

export type TimesheetBillingState = "not_ready" | "ready_to_invoice" | "invoiced";

export function resolveChargeRate(
  schedule: RatePeriod[],
  date: string,
  unitType: WorkedUnitType,
): number | null {
  const match = schedule.find(
    (period) => period.from <= date && period.to >= date,
  );
  if (!match) return null;
  const rate = unitType === "hour" ? match.hourRate : match.dayRate;
  return rate == null ? null : rate;
}

export function billingStateFor(sheet: Timesheet): TimesheetBillingState {
  if (sheet.invoiced || sheet.invoiceId) return "invoiced";
  if (sheet.status === "approved") return "ready_to_invoice";
  return "not_ready";
}

/**
 * Timesheet status is an explicit union, not a free string.
 *
 * Typical paths:
 *   draft → sent → viewed → approved
 *                 ↘ queried → resolved → approved
 * plus: overdue, void
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

/** Sent to the school, not yet approved, and not an open query. */
export const OUTSTANDING_STATUSES: readonly TimesheetStatus[] = [
  "sent",
  "viewed",
  "overdue",
  "resolved",
] as const;

export function isOutstandingStatus(status: TimesheetStatus): boolean {
  return (OUTSTANDING_STATUSES as readonly string[]).includes(status);
}

export type TimesheetQueryReason =
  | "wrong_hours"
  | "wrong_days"
  | "teacher_did_not_attend"
  | "wrong_rate"
  | "assignment_changed"
  | "other";

export const TIMESHEET_QUERY_REASON_LABELS: Record<TimesheetQueryReason, string> =
  {
    wrong_hours: "Wrong hours",
    wrong_days: "Wrong days",
    teacher_did_not_attend: "Teacher didn’t attend",
    wrong_rate: "Wrong rate",
    assignment_changed: "Assignment changed",
    other: "Other",
  };

export type TimesheetAuthorRole = "school" | "consultant" | "system";

export interface TimesheetTransition {
  id: string;
  from: TimesheetStatus | null;
  to: TimesheetStatus;
  at: string;
  actor: PartyRef;
  /** Required when `to` is approved — invoice evidence. */
  approverName?: string;
  note?: string;
}

export interface TimesheetMessage {
  id: string;
  author: PartyRef;
  authorRole: TimesheetAuthorRole;
  body: string;
  at: string;
}

export type HoursAmendmentStatus = "pending" | "accepted" | "rejected";

export interface HoursAmendment {
  originalHours: number;
  originalDays: number;
  proposedHours: number;
  proposedDays: number;
  status: HoursAmendmentStatus;
  decidedBy?: PartyRef;
  decidedAt?: string;
}

export interface TimesheetQuery {
  id: string;
  reason: TimesheetQueryReason;
  freeText: string;
  openedAt: string;
  openedBy: PartyRef;
  resolvedAt?: string;
  resolvedBy?: PartyRef;
  resolutionNote?: string;
  whatChanged?: string;
  amendment?: HoursAmendment;
  messages: TimesheetMessage[];
}

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
  /** School-confirmed hours. Null until the school responds. */
  confirmedHours: number | null;
  confirmedDays: number | null;
  cost: PayrollCostModel;
  /**
   * Charge value. Uses confirmed days/hours when present, otherwise expected.
   */
  chargeValue: number;
  sentAt: string | null;
  viewedAt: string | null;
  approvedAt: string | null;
  approverName: string | null;
  lastChasedAt: string | null;
  chaseCount: number;
  /** True when this school has a holiday or INSET covering the week. */
  holidayOrInset: boolean;
  holidayLabel?: string;
  hasBookings: boolean;
  query: TimesheetQuery | null;
  history: TimesheetTransition[];
  /**
   * Per-date attendance used to build invoice lines. Half days are `0.5`.
   * Invoice rates are resolved from `rateSchedule` per date, not `cost.chargeRate`.
   */
  workedDays: WorkedDay[];
  rateSchedule: RatePeriod[];
  /** True once this sheet is on an issued invoice. */
  invoiced: boolean;
  invoiceId: string | null;
}

export interface UnapprovedTimesheetSummary {
  periodId: string;
  count: number;
  chargeValue: number;
  timesheetIds: string[];
}

export type TimesheetBoardColumn = "outstanding" | "confirmed" | "queried";

export interface TimesheetBoardSummary {
  outstanding: { count: number; chargeValue: number };
  confirmed: { count: number; chargeValue: number };
  queried: { count: number; chargeValue: number };
  /** Outstanding + queried — cannot invoice. */
  cannotInvoice: { count: number; chargeValue: number };
}

export interface TimesheetFilters {
  periodId: string;
  schoolId?: string;
  consultantId?: string;
  teacherId?: string;
  status?: TimesheetStatus | "unapproved" | "all";
  search?: string;
}

export interface SlowSchool {
  school: PartyRef;
  outstandingCount: number;
  averageDaysToApprove: number | null;
  longestOutstandingDays: number;
}

export interface TimesheetEscalation {
  longestOutstanding: Timesheet[];
  slowSchools: SlowSchool[];
}

export function hoursDelta(sheet: Timesheet): number | null {
  if (sheet.confirmedHours == null) return null;
  return Math.round((sheet.confirmedHours - sheet.expectedHours) * 10) / 10;
}

export function boardColumnFor(
  status: TimesheetStatus,
): TimesheetBoardColumn | null {
  if (status === "queried") return "queried";
  if (status === "approved") return "confirmed";
  if (isOutstandingStatus(status)) return "outstanding";
  return null;
}
