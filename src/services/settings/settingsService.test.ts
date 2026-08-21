import { beforeEach, describe, expect, it } from "vitest";
import {
  resetSettingsStoreForTests,
  settingsService,
} from "@/services/settings/settingsService";
import { DEFAULT_MARGIN_THRESHOLDS } from "@/types/settings";

describe("settingsService", () => {
  beforeEach(() => {
    resetSettingsStoreForTests();
  });

  it("returns starter floors then round-trips a save in localStorage", async () => {
    expect(await settingsService.getMarginThresholds()).toEqual(
      DEFAULT_MARGIN_THRESHOLDS,
    );

    const next = { poundsPerDayFloor: 35, percentFloor: 18 };
    const result = await settingsService.saveMarginThresholds(next);
    expect(result.ok).toBe(true);
    expect(result.persisted).toBe(false);
    expect(await settingsService.getMarginThresholds()).toEqual(next);
  });

  it("round-trips timesheet overdue days", async () => {
    expect(await settingsService.getTimesheetChaseSettings()).toEqual({
      overdueAfterDays: 5,
    });
    await settingsService.saveTimesheetChaseSettings({ overdueAfterDays: 7 });
    expect(await settingsService.getTimesheetChaseSettings()).toEqual({
      overdueAfterDays: 7,
    });
  });
});
