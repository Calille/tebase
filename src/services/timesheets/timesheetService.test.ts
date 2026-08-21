import { beforeEach, describe, expect, it } from "vitest";
import { resetTimesheetStoreForTests } from "@/services/timesheets/timesheetService";
import { isSheetOverdue, timesheetService } from "@/services/timesheets/timesheetService";
import { planFridaySend } from "@/services/timesheets/fridaySend";
import { payWeekContaining } from "@/lib/payWeek";

const NOW = new Date(2026, 7, 21, 12);
const PERIOD = payWeekContaining(NOW).id;

describe("timesheetService", () => {
  beforeEach(() => {
    resetTimesheetStoreForTests(NOW);
  });

  it("builds a board with outstanding, confirmed and queried money", async () => {
    const { board, sheets } = await timesheetService.list({
      periodId: PERIOD,
      status: "all",
    });
    expect(board.outstanding.count).toBeGreaterThan(0);
    expect(board.confirmed.count).toBeGreaterThan(0);
    expect(board.queried.count).toBeGreaterThan(0);
    expect(board.cannotInvoice.chargeValue).toBe(
      Math.round(
        (board.outstanding.chargeValue + board.queried.chargeValue) * 100,
      ) / 100,
    );
    expect(sheets.some((sheet) => sheet.holidayOrInset)).toBe(true);
    const approved = sheets.find((sheet) => sheet.status === "approved");
    expect(approved?.approverName).toBeTruthy();
    expect(approved?.history.some((item) => item.to === "approved")).toBe(true);
  });

  it("keeps getUnapprovedSummary excluding INSET empty sheets", async () => {
    const summary = await timesheetService.getUnapprovedSummary(PERIOD);
    expect(summary.count).toBeGreaterThan(0);
    expect(summary.timesheetIds).not.toContain("ts-inset-1");
  });

  it("does not send holiday/INSET or empty sheets", async () => {
    const { sheets } = await timesheetService.list({
      periodId: PERIOD,
      status: "all",
    });
    const plan = planFridaySend(sheets);
    expect(plan.skipped.some((item) => item.reason === "holiday_inset")).toBe(
      true,
    );
    expect(plan.sendIds).toContain("ts-draft-late");
    expect(plan.sendIds).not.toContain("ts-inset-1");

    const result = await timesheetService.sendSheets({
      ids: ["ts-inset-1", "ts-draft-late"],
      mode: "manual",
      requestedBy: { id: "demo-viewer", name: "Demo Viewer" },
    });
    expect(result.data?.emailLive).toBe(false);
    expect(result.data?.queuedIds).toEqual(["ts-draft-late"]);
    expect(result.data?.skipped[0]?.reason).toBe("holiday_inset");
  });

  it("records chase without claiming email was sent", async () => {
    const result = await timesheetService.chaseSheets({
      ids: ["ts-unapp-1"],
      requestedBy: { id: "demo-viewer", name: "Demo Viewer" },
    });
    expect(result.data?.emailLive).toBe(false);
    const sheet = await timesheetService.getById("ts-unapp-1");
    expect(sheet?.chaseCount).toBe(1);
    expect(sheet?.lastChasedAt).toBeTruthy();
  });

  it("accepts proposed hours and records who resolved what", async () => {
    const result = await timesheetService.decideAmendment({
      timesheetId: "ts-unapp-2",
      decision: "accepted",
      actor: { id: "cons-alex", name: "Alex Patel" },
    });
    expect(result.ok).toBe(true);
    const sheet = await timesheetService.getById("ts-unapp-2");
    expect(sheet?.status).toBe("resolved");
    expect(sheet?.confirmedDays).toBe(3.5);
    expect(sheet?.query?.resolvedBy?.name).toBe("Alex Patel");
    expect(sheet?.query?.whatChanged).toMatch(/3.5/);
    expect(sheet?.history.at(-1)?.to).toBe("resolved");
  });
});

describe("isSheetOverdue", () => {
  it("flags a sent sheet past the chase threshold", () => {
    const sentAt = new Date(NOW);
    sentAt.setDate(sentAt.getDate() - 6);
    expect(
      isSheetOverdue(
        {
          status: "sent",
          sentAt: sentAt.toISOString(),
        } as Parameters<typeof isSheetOverdue>[0],
        5,
        NOW,
      ),
    ).toBe(true);
  });
});
