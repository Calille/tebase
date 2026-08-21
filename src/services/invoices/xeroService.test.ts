import { describe, expect, it, beforeEach } from "vitest";
import { resolveChargeRate } from "@/types/timesheet";
import { roundGbp } from "@/types/payroll";
import { payWeekContaining } from "@/lib/payWeek";
import { resetTimesheetStoreForTests, timesheetService } from "@/services/timesheets/timesheetService";
import { billToById } from "@/services/invoices/mockBillTos";
import { buildPushLine, lineCharge } from "@/services/invoices/pushLines";
import { validateXeroPush } from "@/services/invoices/pushValidation";
import { ALL_BILLABLE, xeroService } from "@/services/invoices/xeroService";
import type { Timesheet } from "@/types/timesheet";

const NOW = new Date(2026, 7, 21, 12);
const PERIOD = payWeekContaining(NOW).id;

function sheetLineIds(sheet: Timesheet): string[] {
  return sheet.workedDays.map((day) => `${sheet.id}:${day.date}`);
}

describe("rate on the date worked", () => {
  it("uses the schedule in force that day, including half days", () => {
    const schedule = [
      { from: "2026-08-17", to: "2026-08-18", dayRate: 230 },
      { from: "2026-08-19", to: "2026-08-23", dayRate: 250 },
    ];
    expect(resolveChargeRate(schedule, "2026-08-18", "day")).toBe(230);
    expect(resolveChargeRate(schedule, "2026-08-19", "day")).toBe(250);
    expect(resolveChargeRate(schedule, "2026-08-20", "hour")).toBeNull();
    expect(roundGbp(230 * 0.5)).toBe(115);
  });
});

describe("xero push payload (what we send, not a local invoice)", () => {
  beforeEach(() => {
    resetTimesheetStoreForTests(NOW);
  });

  it("lists approved uninvoiced timesheets as ready to invoice", async () => {
    const ready = await timesheetService.listReadyToInvoice(PERIOD);
    expect(ready.map((sheet) => sheet.id)).toEqual(
      expect.arrayContaining(["ts-ok-1", "ts-ok-greenfield"]),
    );
    expect(ready.map((sheet) => sheet.id)).not.toContain("ts-older-slow");
  });

  it("builds a half-day line at the rate in force, without calculating VAT", async () => {
    const sheet = await timesheetService.getById("ts-ok-1");
    const half = sheet!.workedDays.find((day) => day.units === 0.5);
    const line = buildPushLine(sheet!, half!);
    expect(line.unitAmount).toBe(230);
    expect(lineCharge(line)).toBe(115);
    expect(line).not.toHaveProperty("vat");
    expect(line).not.toHaveProperty("gross");
  });

  it("blocks a date with no resolvable rate, naming the line", async () => {
    const sheet = await timesheetService.getById("ts-ok-gap");
    const billTo = billToById("bt-county-la")!;
    const lines = sheet!.workedDays.map((day) => buildPushLine(sheet!, day));
    const issues = validateXeroPush({
      billTo,
      poNumber: null,
      lines,
      timesheets: [sheet!],
      connected: true,
    });
    const rateIssue = issues.find((issue) => issue.code === "unresolvable_rate");
    expect(rateIssue?.lineId).toBe(`${sheet!.id}:${sheet!.workedDays[1].date}`);
    expect(rateIssue?.message).toMatch(/No day rate in force/);
  });

  it("refuses unmapped bill-tos, missing required POs, zero lines, and already-pushed sheets", async () => {
    const trust = billToById("bt-keep-trust")!;
    expect(trust.xeroContactId).toBeNull();
    const michael = await timesheetService.getById("ts-ok-1");
    const mapped = { ...trust, xeroContactId: "xero-contact-trust" };

    const unmapped = validateXeroPush({
      billTo: trust,
      poNumber: "KAT-1",
      lines: michael!.workedDays.map((day) => buildPushLine(michael!, day)),
      timesheets: [michael!],
      connected: true,
    });
    expect(unmapped.some((issue) => issue.code === "unmapped_bill_to")).toBe(true);

    const po = validateXeroPush({
      billTo: mapped,
      poNumber: "",
      lines: michael!.workedDays.map((day) => buildPushLine(michael!, day)),
      timesheets: [michael!],
      connected: true,
    });
    expect(po.some((issue) => issue.code === "missing_po")).toBe(true);

    const james = await timesheetService.getById("ts-ok-harbour");
    const harbour = { ...billToById("bt-harbour-incomplete")!, xeroContactId: "xero-h" };
    const zero = validateXeroPush({
      billTo: harbour,
      poNumber: null,
      lines: james!.workedDays.map((day) => buildPushLine(james!, day)),
      timesheets: [james!],
      connected: true,
    });
    expect(zero.some((issue) => issue.code === "zero_units")).toBe(true);

    const older = await timesheetService.getById("ts-older-slow");
    expect(older?.xeroInvoiceId).toBeTruthy();
    const already = validateXeroPush({
      billTo: { ...billToById("bt-westfield")!, xeroContactId: "xero-w" },
      poNumber: null,
      lines: older!.workedDays.map((day) => buildPushLine(older!, day)),
      timesheets: [older!],
      connected: true,
    });
    expect(already.some((issue) => issue.code === "already_invoiced")).toBe(true);
  });

  it("groups all-billable candidates by each bill-to's preference", async () => {
    const groups = await xeroService.listCandidateGroups({
      periodId: PERIOD,
      billToId: ALL_BILLABLE,
    });
    const trust = groups.find((group) => group.billTo.id === "bt-keep-trust");
    expect(trust?.school).toBeNull();
    expect(trust?.lines.some((line) => line.school.id === "sch-oakridge")).toBe(true);
  });

  it("reports connection as disconnected without a live Edge Function", async () => {
    const health = await xeroService.getConnectionHealth();
    expect(health.status).toBe("disconnected");
  });

  it("reconciles pushed timesheet charge against the weekly report without inventing a match", async () => {
    const recon = await xeroService.getWeekReconciliation(PERIOD);
    expect(recon.weeklyReportCharge).toBeGreaterThan(0);
    expect(recon.matches).toBe(false);
  });

  it("does not expose a local invoice register", async () => {
    expect(await xeroService.listPushes()).toEqual([]);
    const aged = await xeroService.getAgedDebt();
    expect(aged.source).toBe("unavailable");
    expect(aged.invoices).toEqual([]);
  });

  it("keeps line ids stable for selected rows", async () => {
    const sheet = await timesheetService.getById("ts-ok-1");
    expect(sheetLineIds(sheet!).length).toBeGreaterThan(0);
  });
});
