import type { BillTo } from "@/types/billing";
import type {
  InvoiceLine,
  InvoiceValidationIssue,
} from "@/types/invoice";
import type { Timesheet } from "@/types/timesheet";

export function validateInvoiceIssue(input: {
  billTo: BillTo;
  poNumber: string | null | undefined;
  lines: InvoiceLine[];
  timesheets: Timesheet[];
}): InvoiceValidationIssue[] {
  const issues: InvoiceValidationIssue[] = [];

  if (input.lines.length === 0) {
    issues.push({
      code: "no_lines",
      message: "No lines selected — nothing to invoice.",
    });
  }

  if (input.billTo.poRequired && !input.poNumber?.trim()) {
    issues.push({
      code: "missing_po",
      message: `${input.billTo.name} requires a PO number before issue.`,
    });
  }

  if (!input.billTo.billingAddress) {
    issues.push({
      code: "missing_billing_address",
      message: `${input.billTo.name} has no billing address.`,
    });
  }

  if (!input.billTo.financeContact) {
    issues.push({
      code: "missing_finance_contact",
      message: `${input.billTo.name} has no finance contact.`,
    });
  }

  const sheetsById = new Map(input.timesheets.map((sheet) => [sheet.id, sheet]));

  for (const line of input.lines) {
    const sheet = sheetsById.get(line.timesheetId);

    if (!sheet) {
      issues.push({
        code: "not_approved",
        message: `Timesheet ${line.timesheetId} was not found — cannot invoice ${line.teacher.name} on ${line.dateWorked}.`,
        lineId: line.id,
        timesheetId: line.timesheetId,
      });
      continue;
    }

    if (sheet.status !== "approved") {
      issues.push({
        code: "not_approved",
        message: `${sheet.teacher.name} at ${sheet.school.name} is ${sheet.status}, not approved.`,
        lineId: line.id,
        timesheetId: sheet.id,
      });
    }

    if (sheet.invoiced || sheet.invoiceId) {
      issues.push({
        code: "already_invoiced",
        message: `${sheet.teacher.name} at ${sheet.school.name} is already on invoice ${sheet.invoiceId ?? "(issued)"}.`,
        lineId: line.id,
        timesheetId: sheet.id,
      });
    }

    if (line.chargeRate == null || line.rateProblem) {
      issues.push({
        code: "unresolvable_rate",
        message:
          line.rateProblem ??
          `No rate for ${line.teacher.name} on ${line.dateWorked}.`,
        lineId: line.id,
        timesheetId: sheet.id,
      });
    }

    if (line.vatRate == null) {
      issues.push({
        code: "unknown_vat_rate",
        message: `No VAT rate for service type “${line.serviceType}” on ${line.teacher.name} / ${line.dateWorked}.`,
        lineId: line.id,
        timesheetId: sheet.id,
      });
    }

    if (line.units <= 0) {
      issues.push({
        code: "zero_units",
        message: `Zero ${line.unitType === "hour" ? "hours" : "days"} for ${line.teacher.name} on ${line.dateWorked}.`,
        lineId: line.id,
        timesheetId: sheet.id,
      });
    }

    if ((line.net ?? 0) <= 0) {
      issues.push({
        code: "zero_value",
        message: `Zero-value line for ${line.teacher.name} on ${line.dateWorked}.`,
        lineId: line.id,
        timesheetId: sheet.id,
      });
    }
  }

  return issues;
}
