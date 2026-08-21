import type { BillTo } from "@/types/billing";
import type { Timesheet } from "@/types/timesheet";
import type { XeroPushLine, XeroPushValidationIssue } from "@/types/xero";
import { lineCharge } from "@/services/invoices/pushLines";

export function validateXeroPush(input: {
  billTo: BillTo;
  poNumber: string | null | undefined;
  lines: XeroPushLine[];
  timesheets: Timesheet[];
  connected: boolean;
}): XeroPushValidationIssue[] {
  const issues: XeroPushValidationIssue[] = [];

  if (!input.connected) {
    issues.push({
      code: "disconnected",
      message: "Xero is not connected. Re-authorise before pushing.",
      billToId: input.billTo.id,
    });
  }

  if (input.lines.length === 0) {
    issues.push({
      code: "no_lines",
      message: "No lines selected — nothing to push.",
      billToId: input.billTo.id,
    });
  }

  if (!input.billTo.xeroContactId) {
    issues.push({
      code: "unmapped_bill_to",
      message: `${input.billTo.name} is not linked to a Xero contact. Map it before pushing — Tebase will not create contacts silently.`,
      billToId: input.billTo.id,
    });
  }

  if (input.billTo.poRequired && !input.poNumber?.trim()) {
    issues.push({
      code: "missing_po",
      message: `${input.billTo.name} requires a PO number before push. It is sent as the Xero invoice Reference.`,
      billToId: input.billTo.id,
    });
  }

  const sheetsById = new Map(input.timesheets.map((sheet) => [sheet.id, sheet]));

  for (const line of input.lines) {
    const sheet = sheetsById.get(line.timesheetId);

    if (!sheet) {
      issues.push({
        code: "not_approved",
        message: `Timesheet ${line.timesheetId} was not found — cannot push ${line.teacher.name} on ${line.dateWorked}.`,
        lineId: line.id,
        timesheetId: line.timesheetId,
        billToId: input.billTo.id,
      });
      continue;
    }

    if (sheet.status !== "approved") {
      issues.push({
        code: "not_approved",
        message: `${sheet.teacher.name} at ${sheet.school.name} is ${sheet.status}, not approved.`,
        lineId: line.id,
        timesheetId: sheet.id,
        billToId: input.billTo.id,
      });
    }

    if (sheet.invoiced || sheet.xeroInvoiceId) {
      issues.push({
        code: "already_invoiced",
        message: `${sheet.teacher.name} at ${sheet.school.name} is already on Xero invoice ${sheet.xeroInvoiceId ?? "(pushed)"}.`,
        lineId: line.id,
        timesheetId: sheet.id,
        billToId: input.billTo.id,
      });
    }

    if (line.unitAmount == null || line.rateProblem) {
      issues.push({
        code: "unresolvable_rate",
        message:
          line.rateProblem ??
          `No rate for ${line.teacher.name} on ${line.dateWorked}.`,
        lineId: line.id,
        timesheetId: sheet.id,
        billToId: input.billTo.id,
      });
    }

    if (line.units <= 0) {
      issues.push({
        code: "zero_units",
        message: `Zero ${line.unitType === "hour" ? "hours" : "days"} for ${line.teacher.name} on ${line.dateWorked}.`,
        lineId: line.id,
        timesheetId: sheet.id,
        billToId: input.billTo.id,
      });
    }

    const charge = lineCharge(line);
    if (charge == null || charge <= 0) {
      issues.push({
        code: "zero_value",
        message: `Zero-value line for ${line.teacher.name} on ${line.dateWorked}.`,
        lineId: line.id,
        timesheetId: sheet.id,
        billToId: input.billTo.id,
      });
    }
  }

  return issues;
}
