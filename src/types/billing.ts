import type { PartyRef } from "./party";

/**
 * Who pays — not the same as the school where the work happened.
 * A bill-to can be a school, a multi-academy trust, or a local authority,
 * and one bill-to can cover many schools.
 */
export type BillToKind = "school" | "multi_academy_trust" | "local_authority";

export type InvoiceFrequency = "weekly" | "fortnightly" | "monthly";

export type InvoiceGrouping = "per_school" | "consolidated";

export interface PostalAddress {
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
}

export interface FinanceContact {
  name: string;
  email: string;
  phone?: string;
}

export interface BillTo {
  id: string;
  name: string;
  kind: BillToKind;
  /** Schools whose approved timesheets roll up to this payer. */
  schoolIds: string[];
  paymentTermsDays: number;
  invoiceFrequency: InvoiceFrequency;
  grouping: InvoiceGrouping;
  poRequired: boolean;
  financeContact: FinanceContact | null;
  billingAddress: PostalAddress | null;
  /**
   * Xero Contact this bill-to is linked to. Null until mapped on the
   * contact-mapping screen. Never auto-created.
   */
  xeroContactId: string | null;
}

export const BILL_TO_KIND_LABELS: Record<BillToKind, string> = {
  school: "School",
  multi_academy_trust: "Multi-academy trust",
  local_authority: "Local authority",
};

export const INVOICE_FREQUENCY_LABELS: Record<InvoiceFrequency, string> = {
  weekly: "Weekly",
  fortnightly: "Fortnightly",
  monthly: "Monthly",
};

export const INVOICE_GROUPING_LABELS: Record<InvoiceGrouping, string> = {
  per_school: "One invoice per school",
  consolidated: "Consolidated (one invoice for all schools)",
};

export function formatPostalAddress(address: PostalAddress): string {
  return [address.line1, address.line2, address.city, address.postcode]
    .filter(Boolean)
    .join(", ");
}

export function billToAsParty(billTo: BillTo): PartyRef {
  return { id: billTo.id, name: billTo.name };
}
