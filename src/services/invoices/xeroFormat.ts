import type { Invoice } from "@/types/invoice";
import { TEACHER_ROLE_LABELS } from "@/types/timesheet";
import { VAT_SERVICE_TYPE_LABELS } from "@/lib/vat";

/**
 * Xero sales-invoice CSV column mapping.
 *
 * PLACEHOLDER NAMES — Keep Education does not yet have a confirmed Xero
 * organisation or import template. When the spec arrives, change only the
 * `header` strings here (and add or remove entries). Preview, validation
 * messaging, and the downloaded file all read from this object. Do not
 * scatter Xero column names through the UI.
 *
 * `key` is our internal field. `header` is the CSV column title Xero expects.
 *
 * Typical Xero invoice import is one row per line item, repeating invoice
 * header fields. Tax is standard-rated supply of staff until told otherwise.
 */
export const XERO_COLUMN_MAP = [
  { key: "contactName", header: "PLACEHOLDER_ContactName" },
  { key: "emailAddress", header: "PLACEHOLDER_EmailAddress" },
  { key: "poAddressLine1", header: "PLACEHOLDER_POAddressLine1" },
  { key: "poCity", header: "PLACEHOLDER_POCity" },
  { key: "poPostalCode", header: "PLACEHOLDER_POPostalCode" },
  { key: "invoiceNumber", header: "PLACEHOLDER_InvoiceNumber" },
  { key: "reference", header: "PLACEHOLDER_Reference" },
  { key: "invoiceDate", header: "PLACEHOLDER_InvoiceDate" },
  { key: "dueDate", header: "PLACEHOLDER_DueDate" },
  { key: "description", header: "PLACEHOLDER_Description" },
  { key: "quantity", header: "PLACEHOLDER_Quantity" },
  { key: "unitAmount", header: "PLACEHOLDER_UnitAmount" },
  { key: "accountCode", header: "PLACEHOLDER_AccountCode" },
  { key: "taxType", header: "PLACEHOLDER_TaxType" },
  { key: "taxAmount", header: "PLACEHOLDER_TaxAmount" },
  { key: "currency", header: "PLACEHOLDER_Currency" },
] as const;

export type XeroColumnKey = (typeof XERO_COLUMN_MAP)[number]["key"];

export type XeroCsvRow = Record<XeroColumnKey, string>;

/** Xero sales account code — placeholder until the live chart of accounts is known. */
export const XERO_SUPPLY_ACCOUNT_CODE = "PLACEHOLDER_200";

/** Xero tax type code — placeholder; do not assume a live Xero tax rate name. */
export const XERO_SUPPLY_TAX_TYPE = "PLACEHOLDER_20% (VAT on Income)";

export function toXeroRows(invoice: Invoice): XeroCsvRow[] {
  const address = invoice.billingAddress;
  return invoice.lines.map((line) => ({
    contactName: invoice.billTo.name,
    emailAddress: invoice.billTo.financeContact?.email ?? "",
    poAddressLine1: address?.line1 ?? "",
    poCity: address?.city ?? "",
    poPostalCode: address?.postcode ?? "",
    invoiceNumber: invoice.number ?? "",
    reference: invoice.poNumber ?? "",
    invoiceDate: invoice.issueDate ?? "",
    dueDate: invoice.dueDate ?? "",
    description: [
      line.teacher.name,
      TEACHER_ROLE_LABELS[line.role],
      line.school.name,
      line.dateWorked,
      VAT_SERVICE_TYPE_LABELS[line.serviceType],
    ].join(" · "),
    quantity: String(line.units),
    unitAmount: line.chargeRate == null ? "" : line.chargeRate.toFixed(2),
    accountCode: XERO_SUPPLY_ACCOUNT_CODE,
    taxType: XERO_SUPPLY_TAX_TYPE,
    taxAmount: line.vat == null ? "" : line.vat.toFixed(2),
    currency: "GBP",
  }));
}

export function xeroHeaders(): string[] {
  return XERO_COLUMN_MAP.map((column) => column.header);
}

export function xeroRowValues(row: XeroCsvRow): string[] {
  return XERO_COLUMN_MAP.map((column) => row[column.key]);
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateXeroCsv(invoices: Invoice[]): string {
  const rows = invoices.flatMap(toXeroRows);
  const headerLine = xeroHeaders().map(csvEscape).join(",");
  const body = rows.map((row) => xeroRowValues(row).map(csvEscape).join(","));
  return [headerLine, ...body].join("\r\n") + "\r\n";
}
