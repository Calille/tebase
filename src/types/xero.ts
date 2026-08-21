import type { BillTo, InvoiceGrouping } from "./billing";
import type { PartyRef } from "./party";
import type { TeacherRole, WorkedUnitType } from "./timesheet";

/**
 * Tebase does not own invoices. These types describe the handoff to Xero
 * and the status we pull back. VAT, numbering, PDFs, and payment live in Xero.
 */

export type XeroConnectionStatus = "connected" | "expiring" | "disconnected";

export interface XeroConnectionHealth {
  status: XeroConnectionStatus;
  tenantName: string | null;
  tenantId: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  lastError: string | null;
}

/**
 * Xero ACCREC invoice statuses we sync back. Not a Tebase lifecycle.
 */
export type XeroInvoiceStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "AUTHORISED"
  | "PAID"
  | "VOIDED";

/**
 * Tax type for standard-rated supply of staff (20% on the full charge,
 * including the pay element). Xero applies this; Tebase must not calculate VAT.
 *
 * CONFIRM the exact code for Keep Education's UK Xero org before go-live.
 */
export const XERO_TAX_TYPE_SUPPLY_OF_STAFF = "OUTPUT2";

/**
 * Sales account code to post supply-of-staff lines to.
 * PLACEHOLDER — confirm with Keep Education which code to use.
 */
export const XERO_ACCOUNT_CODE_SUPPLY = "PLACEHOLDER_CONFIRM_WITH_KEEP";

/**
 * Whether new invoices land as DRAFT (finance reviews in Xero) or AUTHORISED.
 * Default DRAFT. Confirm before go-live.
 */
export type XeroPushStatus = "DRAFT" | "AUTHORISED";
export const XERO_PUSH_INVOICE_STATUS: XeroPushStatus = "DRAFT";

export interface XeroPushLine {
  id: string;
  timesheetId: string;
  school: PartyRef;
  teacher: PartyRef;
  consultant: PartyRef;
  role: TeacherRole;
  dateWorked: string;
  units: number;
  unitType: WorkedUnitType;
  /** Charge rate in force on `dateWorked`. Null if it cannot be resolved. */
  unitAmount: number | null;
  rateProblem?: string;
}

export interface XeroCandidateGroup {
  key: string;
  billTo: BillTo;
  school: PartyRef | null;
  grouping: InvoiceGrouping;
  lines: XeroPushLine[];
}

export type XeroPushIssueCode =
  | "disconnected"
  | "unmapped_bill_to"
  | "missing_po"
  | "unresolvable_rate"
  | "zero_value"
  | "zero_units"
  | "already_invoiced"
  | "not_approved"
  | "no_lines";

export interface XeroPushValidationIssue {
  code: XeroPushIssueCode;
  message: string;
  lineId?: string;
  timesheetId?: string;
  billToId?: string;
}

export interface XeroPushRecord {
  id: string;
  requestKey: string;
  billTo: PartyRef;
  xeroInvoiceId: string | null;
  xeroInvoiceNumber: string | null;
  xeroDeepLink: string | null;
  status: "pending" | "pushed" | "failed";
  xeroStatus: XeroInvoiceStatus | null;
  amountDue: number | null;
  periodId: string;
  pushedAt: string;
  error: string | null;
}

export type AgeBucket = "0-30" | "31-60" | "61-90" | "90+";

export const AGE_BUCKETS: readonly AgeBucket[] = [
  "0-30",
  "31-60",
  "61-90",
  "90+",
] as const;

export interface AgedDebtBucket {
  bucket: AgeBucket;
  count: number;
  outstanding: number;
}

export interface AgedDebtBillToRollup {
  billTo: PartyRef;
  invoiceCount: number;
  outstanding: number;
  overdue: number;
  habituallyLate: boolean;
}

/** Outstanding Xero invoices — sourced from Xero, not a local invoice store. */
export interface XeroAgedInvoice {
  xeroInvoiceId: string;
  xeroInvoiceNumber: string | null;
  xeroDeepLink: string | null;
  billTo: PartyRef;
  status: XeroInvoiceStatus;
  amountDue: number;
  issueDate: string | null;
  dueDate: string | null;
}

export interface XeroAgedDebtSummary {
  totalOutstanding: number;
  totalOverdue: number;
  buckets: AgedDebtBucket[];
  byBillTo: AgedDebtBillToRollup[];
  invoices: XeroAgedInvoice[];
  source: "xero" | "unavailable";
}

export interface WeekChargeReconciliation {
  periodId: string;
  weeklyReportCharge: number;
  invoicedNet: number;
  delta: number;
  matches: boolean;
}

export function xeroInvoiceDeepLink(invoiceId: string): string {
  return `https://go.xero.com/AccountsReceivable/View.aspx?InvoiceID=${invoiceId}`;
}
