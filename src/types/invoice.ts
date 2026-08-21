import type { BillTo, InvoiceGrouping, PostalAddress } from "./billing";
import type { PartyRef } from "./party";
import type { TeacherRole, WorkedUnitType } from "./timesheet";
import type { VatServiceType } from "@/lib/vat";

/**
 * Invoice status is an explicit union, not a free string.
 *
 * Typical paths:
 *   draft → issued → sent → part-paid → paid
 *                    ↘ overdue
 *                    ↘ disputed → resolved
 * plus: credited, void
 *
 * Issued invoices are immutable. Corrections are credit notes.
 */
export type InvoiceStatus =
  | "draft"
  | "issued"
  | "sent"
  | "part-paid"
  | "paid"
  | "overdue"
  | "disputed"
  | "resolved"
  | "credited"
  | "void";

export const OPEN_INVOICE_STATUSES: readonly InvoiceStatus[] = [
  "issued",
  "sent",
  "part-paid",
  "overdue",
  "disputed",
  "resolved",
] as const;

export function isOpenInvoiceStatus(status: InvoiceStatus): boolean {
  return (OPEN_INVOICE_STATUSES as readonly string[]).includes(status);
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  issued: "Issued",
  sent: "Sent",
  "part-paid": "Part-paid",
  paid: "Paid",
  overdue: "Overdue",
  disputed: "Disputed",
  resolved: "Resolved",
  credited: "Credited",
  void: "Void",
};

export interface InvoiceTransition {
  id: string;
  from: InvoiceStatus | null;
  to: InvoiceStatus;
  at: string;
  actor: PartyRef;
  note?: string;
}

export type ChaseMethod = "email" | "phone" | "portal";

export const CHASE_METHOD_LABELS: Record<ChaseMethod, string> = {
  email: "Email",
  phone: "Phone",
  portal: "Portal",
};

export interface InvoiceChase {
  id: string;
  at: string;
  method: ChaseMethod;
  actor: PartyRef;
  note?: string;
}

export interface InvoiceLine {
  id: string;
  timesheetId: string;
  school: PartyRef;
  teacher: PartyRef;
  role: TeacherRole;
  dateWorked: string;
  units: number;
  unitType: WorkedUnitType;
  /** Rate in force on `dateWorked`. Null when it cannot be resolved. */
  chargeRate: number | null;
  serviceType: VatServiceType;
  vatRate: number | null;
  net: number | null;
  vat: number | null;
  gross: number | null;
  rateProblem?: string;
}

export interface InvoiceMoney {
  net: number;
  vat: number;
  gross: number;
}

export interface SchoolSubtotal extends InvoiceMoney {
  school: PartyRef;
}

export interface CreditNoteLine {
  invoiceLineId: string;
  dateWorked: string;
  teacher: PartyRef;
  school: PartyRef;
  net: number;
  vat: number;
  gross: number;
}

export interface CreditNote {
  id: string;
  number: string;
  invoiceId: string;
  createdAt: string;
  createdBy: PartyRef;
  reason: string;
  lines: CreditNoteLine[];
  totals: InvoiceMoney;
}

export interface Invoice {
  id: string;
  /** Null until issue. Drafts must not consume a number. */
  number: string | null;
  status: InvoiceStatus;
  billTo: BillTo;
  /** Week-ending of the builder period these lines were drawn from. */
  periodId: string;
  grouping: InvoiceGrouping;
  poNumber: string | null;
  issueDate: string | null;
  dueDate: string | null;
  issuedBy: PartyRef | null;
  issuedAt: string | null;
  billingAddress: PostalAddress | null;
  lines: InvoiceLine[];
  schoolSubtotals: SchoolSubtotal[];
  totals: InvoiceMoney;
  credits: CreditNote[];
  netPosition: InvoiceMoney;
  amountPaid: number;
  history: InvoiceTransition[];
  chases: InvoiceChase[];
}

export type InvoiceIssueCode =
  | "missing_po"
  | "unresolvable_rate"
  | "unknown_vat_rate"
  | "zero_value"
  | "zero_units"
  | "already_invoiced"
  | "not_approved"
  | "missing_billing_address"
  | "missing_finance_contact"
  | "no_lines";

export interface InvoiceValidationIssue {
  code: InvoiceIssueCode;
  message: string;
  lineId?: string;
  timesheetId?: string;
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

export interface AgedDebtSummary {
  totalOutstanding: number;
  totalOverdue: number;
  buckets: AgedDebtBucket[];
  byBillTo: AgedDebtBillToRollup[];
  invoices: Invoice[];
}

export interface WeekChargeReconciliation {
  periodId: string;
  weeklyReportCharge: number;
  invoicedNet: number;
  delta: number;
  matches: boolean;
}

export interface XeroExportRecord {
  id: string;
  exportedAt: string;
  periodId: string;
  weekEnding: string;
  invoiceCount: number;
  exportedBy: PartyRef;
}

export const ALLOWED_INVOICE_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> =
  {
    draft: ["issued", "void"],
    issued: ["sent", "overdue", "disputed", "credited", "void"],
    sent: ["part-paid", "paid", "overdue", "disputed", "credited", "void"],
    "part-paid": ["paid", "overdue", "disputed", "credited"],
    paid: ["credited"],
    overdue: ["sent", "part-paid", "paid", "disputed", "credited", "void"],
    disputed: ["resolved", "credited", "void"],
    resolved: ["sent", "overdue", "part-paid", "paid", "credited"],
    credited: [],
    void: [],
  };
