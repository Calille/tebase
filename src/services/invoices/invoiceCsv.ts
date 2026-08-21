import type { Invoice } from "@/types/invoice";
import { TEACHER_ROLE_LABELS } from "@/types/timesheet";
import { formatGbp } from "@/types/payroll";

/**
 * Human-readable invoice CSV for emailing finance teams — not the Xero import.
 */
const EMAIL_HEADERS = [
  "Invoice number",
  "Status",
  "Bill to",
  "School",
  "Teacher",
  "Role",
  "Date worked",
  "Units",
  "Unit type",
  "Rate",
  "Net",
  "VAT rate",
  "VAT",
  "Gross",
  "PO number",
  "Issue date",
  "Due date",
] as const;

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateInvoiceEmailCsv(invoice: Invoice): string {
  const headerLine = EMAIL_HEADERS.map(csvEscape).join(",");
  const body = invoice.lines.map((line) =>
    [
      invoice.number ?? "",
      invoice.status,
      invoice.billTo.name,
      line.school.name,
      line.teacher.name,
      TEACHER_ROLE_LABELS[line.role],
      line.dateWorked,
      String(line.units),
      line.unitType,
      line.chargeRate == null ? "" : formatGbp(line.chargeRate),
      line.net == null ? "" : formatGbp(line.net),
      line.vatRate == null ? "" : `${Math.round(line.vatRate * 100)}%`,
      line.vat == null ? "" : formatGbp(line.vat),
      line.gross == null ? "" : formatGbp(line.gross),
      invoice.poNumber ?? "",
      invoice.issueDate ?? "",
      invoice.dueDate ?? "",
    ]
      .map(csvEscape)
      .join(","),
  );
  return [headerLine, ...body].join("\r\n") + "\r\n";
}
