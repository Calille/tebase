import {
  demoWriteResult,
  type WriteResult,
} from "@/lib/persistence";
import {
  DEFAULT_MARGIN_THRESHOLDS,
  DEFAULT_TIMESHEET_CHASE_SETTINGS,
  type MarginThresholdSettings,
  type TimesheetChaseSettings,
} from "@/types/settings";

const MARGIN_KEY = "tebase.settings.marginThresholds";
const CHASE_KEY = "tebase.settings.timesheetChase";

function readJson<T>(key: string): T | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readMargin(): MarginThresholdSettings | null {
  const parsed = readJson<Partial<MarginThresholdSettings>>(MARGIN_KEY);
  if (
    !parsed ||
    typeof parsed.poundsPerDayFloor !== "number" ||
    typeof parsed.percentFloor !== "number"
  ) {
    return null;
  }
  return {
    poundsPerDayFloor: parsed.poundsPerDayFloor,
    percentFloor: parsed.percentFloor,
  };
}

function readChase(): TimesheetChaseSettings | null {
  const parsed = readJson<Partial<TimesheetChaseSettings>>(CHASE_KEY);
  if (!parsed || typeof parsed.overdueAfterDays !== "number") return null;
  return { overdueAfterDays: parsed.overdueAfterDays };
}

/**
 * Agency settings. Components must call this module only.
 * Swap the localStorage mock for a Supabase row in this file later.
 */
export const settingsService = {
  async getMarginThresholds(): Promise<MarginThresholdSettings> {
    return readMargin() ?? { ...DEFAULT_MARGIN_THRESHOLDS };
  },

  async saveMarginThresholds(
    next: MarginThresholdSettings,
  ): Promise<WriteResult> {
    if (typeof localStorage === "undefined") return demoWriteResult();
    localStorage.setItem(MARGIN_KEY, JSON.stringify(next));
    return demoWriteResult();
  },

  async getTimesheetChaseSettings(): Promise<TimesheetChaseSettings> {
    return readChase() ?? { ...DEFAULT_TIMESHEET_CHASE_SETTINGS };
  },

  async saveTimesheetChaseSettings(
    next: TimesheetChaseSettings,
  ): Promise<WriteResult> {
    if (typeof localStorage === "undefined") return demoWriteResult();
    localStorage.setItem(CHASE_KEY, JSON.stringify(next));
    return demoWriteResult();
  },
};

export function resetSettingsStoreForTests() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(MARGIN_KEY);
    localStorage.removeItem(CHASE_KEY);
  }
}
