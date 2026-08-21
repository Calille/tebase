import { describe, expect, it } from "vitest";
import { beforeEach } from "vitest";
import { payWeekContaining } from "@/lib/payWeek";
import { resetTimesheetStoreForTests, timesheetService } from "@/services/timesheets/timesheetService";
import { billingStateFor } from "@/types/timesheet";

const NOW = new Date(2026, 7, 21, 12);

describe("timesheet billing state", () => {
  beforeEach(() => {
    resetTimesheetStoreForTests(NOW);
  });

  it("marks approved uninvoiced sheets as ready to invoice", async () => {
    const sheet = await timesheetService.getById("ts-ok-1");
    expect(billingStateFor(sheet!)).toBe("ready_to_invoice");
    const invoiced = await timesheetService.getById("ts-older-slow");
    expect(billingStateFor(invoiced!)).toBe("invoiced");
    const sent = await timesheetService.getById("ts-unapp-1");
    expect(billingStateFor(sent!)).toBe("not_ready");
  });

  it("keeps the current week board including the extra approved sheets", async () => {
    const { board } = await timesheetService.list({
      periodId: payWeekContaining(NOW).id,
      status: "all",
    });
    expect(board.confirmed.count).toBeGreaterThanOrEqual(4);
  });
});
