import { describe, expect, it } from "vitest";
import { financialYearFor, formatInvoiceNumber } from "@/lib/financialYear";
import { getVatRate } from "@/lib/vat";
import { resolveChargeRate } from "@/types/timesheet";
import { roundGbp } from "@/types/payroll";
import { buildInvoiceLine } from "@/services/invoices/invoiceMoney";
import { validateInvoiceIssue } from "@/services/invoices/invoiceValidation";
import { XERO_COLUMN_MAP, generateXeroCsv } from "@/services/invoices/xeroFormat";
import { BILL_TOS, billToById } from "@/services/invoices/mockBillTos";
import {
  ALL_BILLABLE,
  invoiceService,
  resetInvoiceStoreForTests,
} from "@/services/invoices/invoiceService";
import { timesheetService } from "@/services/timesheets/timesheetService";
import { payWeekContaining } from "@/lib/payWeek";
import { beforeEach } from "vitest";
import type { Timesheet } from "@/types/timesheet";
import type { Invoice } from "@/types/invoice";

const NOW = new Date(2026, 7, 21, 12);
const PERIOD = payWeekContaining(NOW).id;
const ACTOR = { id: "demo-viewer", name: "Demo Viewer" };

function sheetLineIds(sheet: Timesheet): string[] {
  return sheet.workedDays.map((day) => `${sheet.id}:${day.date}`);
}

describe("financial year numbering", () => {
  it("uses 1 April as the FY start (assumption)", () => {
    expect(financialYearFor(new Date(2026, 7, 21)).code).toBe("2627");
    expect(financialYearFor(new Date(2026, 2, 31)).code).toBe("2526");
    expect(financialYearFor(new Date(2026, 3, 1)).code).toBe("2627");
    expect(formatInvoiceNumber("2627", 1)).toBe("KE-2627-0001");
  });
});

describe("VAT by service type", () => {
  it("applies 20% to supply of staff and refuses unknown types", () => {
    expect(getVatRate("supply_of_staff")).toBe(0.2);
    expect(getVatRate("something_else")).toBeNull();
  });
});

describe("rate on the date worked", () => {
  it("uses the schedule in force that day, including half days", () => {
    const schedule = [
      { from: "2026-08-17", to: "2026-08-18", dayRate: 230 },
      { from: "2026-08-19", to: "2026-08-23", dayRate: 250 },
    ];
    expect(resolveChargeRate(schedule, "2026-08-18", "day")).toBe(230);
    expect(resolveChargeRate(schedule, "2026-08-19", "day")).toBe(250);
    expect(resolveChargeRate(schedule, "2026-08-20", "hour")).toBeNull();
    expect(resolveChargeRate(schedule, "2026-08-16", "day")).toBeNull();
    expect(roundGbp(230 * 0.5)).toBe(115);
  });
});

describe("invoiceService", () => {
  beforeEach(() => {
    resetInvoiceStoreForTests(NOW);
  });

  it("lists approved uninvoiced timesheets as ready to invoice", async () => {
    const ready = await timesheetService.listReadyToInvoice(PERIOD);
    expect(ready.map((sheet) => sheet.id)).toEqual(
      expect.arrayContaining(["ts-ok-1", "ts-ok-greenfield", "ts-ok-harbour", "ts-ok-gap"]),
    );
    expect(ready.map((sheet) => sheet.id)).not.toContain("ts-older-slow");
    expect(ready.every((sheet) => sheet.status === "approved" && !sheet.invoiced)).toBe(
      true,
    );
  });

  it("builds VAT on the full charge and half-day lines", async () => {
    const sheet = await timesheetService.getById("ts-ok-1");
    expect(sheet).toBeTruthy();
    const half = sheet!.workedDays.find((day) => day.units === 0.5);
    expect(half).toBeTruthy();
    const line = buildInvoiceLine(sheet!, half!);
    expect(line.chargeRate).toBe(230);
    expect(line.net).toBe(115);
    expect(line.vat).toBe(23);
    expect(line.gross).toBe(138);
  });

  it("blocks issue when a date has no resolvable rate, naming the line", async () => {
    const sheet = await timesheetService.getById("ts-ok-gap");
    const billTo = billToById("bt-county-la")!;
    const lines = sheet!.workedDays.map((day) => buildInvoiceLine(sheet!, day));
    const issues = validateInvoiceIssue({
      billTo,
      poNumber: null,
      lines,
      timesheets: [sheet!],
    });
    const rateIssue = issues.find((issue) => issue.code === "unresolvable_rate");
    expect(rateIssue?.lineId).toBe(`${sheet!.id}:${sheet!.workedDays[1].date}`);
    expect(rateIssue?.message).toMatch(/No day rate in force/);
  });

  it("refuses a missing PO, zero-unit lines, missing address, and already-invoiced sheets", async () => {
    const trust = billToById("bt-keep-trust")!;
    const harbour = billToById("bt-harbour-incomplete")!;
    const michael = await timesheetService.getById("ts-ok-1");
    const james = await timesheetService.getById("ts-ok-harbour");
    const older = await timesheetService.getById("ts-older-slow");

    const poIssues = validateInvoiceIssue({
      billTo: trust,
      poNumber: "",
      lines: michael!.workedDays.map((day) => buildInvoiceLine(michael!, day)),
      timesheets: [michael!],
    });
    expect(poIssues.some((issue) => issue.code === "missing_po")).toBe(true);

    const harbourIssues = validateInvoiceIssue({
      billTo: harbour,
      poNumber: null,
      lines: james!.workedDays.map((day) => buildInvoiceLine(james!, day)),
      timesheets: [james!],
    });
    expect(harbourIssues.some((issue) => issue.code === "missing_billing_address")).toBe(
      true,
    );
    expect(harbourIssues.some((issue) => issue.code === "missing_finance_contact")).toBe(
      true,
    );
    expect(harbourIssues.some((issue) => issue.code === "zero_units")).toBe(true);

    const already = validateInvoiceIssue({
      billTo: BILL_TOS[1],
      poNumber: null,
      lines: older!.workedDays.map((day) => buildInvoiceLine(older!, day)),
      timesheets: [older!],
    });
    expect(already.some((issue) => issue.code === "already_invoiced")).toBe(true);
  });

  it("assigns a sequential number on issue, not on draft, and does not reuse it", async () => {
    const sheet = await timesheetService.getById("ts-ok-1");
    const nina = await timesheetService.getById("ts-ok-greenfield");
    const lineIds = [...sheetLineIds(sheet!), ...sheetLineIds(nina!)];

    const preview = await invoiceService.previewGroup({
      periodId: PERIOD,
      billToId: "bt-keep-trust",
      lineIds,
      poNumber: "KAT-1001",
      actor: ACTOR,
    });
    expect(preview.draft?.number).toBeNull();
    expect(preview.draft?.status).toBe("draft");
    expect(preview.issues).toEqual([]);

    const first = await invoiceService.issue({
      periodId: PERIOD,
      billToId: "bt-keep-trust",
      lineIds,
      poNumber: "KAT-1001",
      actor: ACTOR,
    });
    expect(first.ok).toBe(true);
    expect(first.data?.number).toBe("KE-2627-0007");
    expect(first.data?.status).toBe("issued");
    expect(first.data?.issuedBy?.name).toBe("Demo Viewer");
    expect(first.data?.schoolSubtotals.length).toBe(2);

    const locked = await timesheetService.getById("ts-ok-1");
    expect(locked?.invoiced).toBe(true);
    expect(locked?.invoiceId).toBe(first.data?.id);

    const west = await timesheetService.getById("ts-prev-approved");
    const second = await invoiceService.issue({
      periodId: west!.periodId,
      billToId: "bt-westfield",
      lineIds: sheetLineIds(west!),
      actor: ACTOR,
    });
    expect(second.data?.number).toBe("KE-2627-0008");
  });

  it("credits selected lines and shows a net position without reopening timesheets", async () => {
    const sheet = await timesheetService.getById("ts-ok-1");
    const nina = await timesheetService.getById("ts-ok-greenfield");
    const issued = await invoiceService.issue({
      periodId: PERIOD,
      billToId: "bt-keep-trust",
      lineIds: [...sheetLineIds(sheet!), ...sheetLineIds(nina!)],
      poNumber: "KAT-1001",
      actor: ACTOR,
    });
    const invoice = issued.data as Invoice;
    const firstLine = invoice.lines[0];
    const credit = await invoiceService.createCreditNote({
      invoiceId: invoice.id,
      lineIds: [firstLine.id],
      reason: "School queried a half day",
      actor: ACTOR,
    });
    expect(credit.data?.number).toMatch(/^KE-CN-2627-0001$/);
    const refreshed = await invoiceService.getInvoice(invoice.id);
    expect(refreshed?.credits).toHaveLength(1);
    expect(refreshed?.netPosition.net).toBe(
      roundGbp(invoice.totals.net - (firstLine.net ?? 0)),
    );
    expect(refreshed?.status).not.toBe("credited");
    const stillLocked = await timesheetService.getById("ts-ok-1");
    expect(stillLocked?.invoiced).toBe(true);

    const rest = invoice.lines.slice(1).map((line) => line.id);
    await invoiceService.createCreditNote({
      invoiceId: invoice.id,
      lineIds: rest,
      reason: "Full credit — booking cancelled after issue",
      actor: ACTOR,
    });
    const fully = await invoiceService.getInvoice(invoice.id);
    expect(fully?.status).toBe("credited");
    expect(fully?.netPosition.gross).toBe(0);
  });

  it("buckets aged debt and flags habitually late bill-tos", async () => {
    const aged = await invoiceService.getAgedDebt(NOW);
    expect(aged.totalOutstanding).toBeGreaterThan(0);
    expect(aged.totalOverdue).toBeGreaterThan(0);
    expect(aged.buckets.map((row) => row.bucket)).toEqual([
      "0-30",
      "31-60",
      "61-90",
      "90+",
    ]);
    expect(aged.buckets.some((row) => row.count > 0 && row.bucket === "90+")).toBe(
      true,
    );
    const westfield = aged.byBillTo.find((row) => row.billTo.id === "bt-westfield");
    expect(westfield?.habituallyLate).toBe(true);
  });

  it("records a chase and a Xero export so a week cannot be silently re-exported", async () => {
    const chase = await invoiceService.recordChase({
      invoiceId: "inv-seed-old",
      method: "phone",
      actor: ACTOR,
      note: "Left voicemail with the office",
    });
    expect(chase.ok).toBe(true);
    const invoice = await invoiceService.getInvoice("inv-seed-old");
    expect(invoice?.chases).toHaveLength(1);
    expect(invoice?.history.some((item) => item.note?.includes("phone"))).toBe(true);

    const olderPeriod = invoice!.periodId;
    const preview = await invoiceService.previewXeroExport(olderPeriod);
    expect(preview.csv).toContain("PLACEHOLDER_ContactName");
    expect(preview.alreadyExported).toHaveLength(0);
    const recorded = await invoiceService.recordXeroExport({
      periodId: olderPeriod,
      exportedBy: ACTOR,
    });
    expect(recorded.data?.record.invoiceCount).toBeGreaterThan(0);
    const again = await invoiceService.getXeroExports(olderPeriod);
    expect(again).toHaveLength(1);
  });

  it("shows a weekly report recon indicator that does not fake a match", async () => {
    const recon = await invoiceService.getWeekReconciliation(PERIOD);
    expect(recon.weeklyReportCharge).toBeGreaterThan(0);
    expect(recon.matches).toBe(false);
  });

  it("groups all-billable candidates by each bill-to's preference", async () => {
    const groups = await invoiceService.listCandidateGroups({
      periodId: PERIOD,
      billToId: ALL_BILLABLE,
    });
    const trust = groups.find((group) => group.billTo.id === "bt-keep-trust");
    expect(trust?.school).toBeNull();
    expect(trust?.lines.some((line) => line.school.id === "sch-oakridge")).toBe(true);
    expect(trust?.lines.some((line) => line.school.id === "sch-greenfield")).toBe(true);
  });
});

describe("Xero column map", () => {
  it("keeps placeholder headers in one config object", () => {
    const headers = XERO_COLUMN_MAP.map((column) => column.header);
    expect(headers.every((header) => header.startsWith("PLACEHOLDER_"))).toBe(true);
    const csv = generateXeroCsv([]);
    expect(csv.startsWith("PLACEHOLDER_ContactName,")).toBe(true);
  });
});
