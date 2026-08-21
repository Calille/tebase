import {
  demoWriteResult,
  type WriteResult,
} from "@/lib/persistence";
import {
  DEFAULT_MARGIN_THRESHOLDS,
  type MarginThresholdSettings,
} from "@/types/settings";

const STORAGE_KEY = "tebase.settings.marginThresholds";

function readStored(): MarginThresholdSettings | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<MarginThresholdSettings>;
    if (
      typeof parsed.poundsPerDayFloor !== "number" ||
      typeof parsed.percentFloor !== "number"
    ) {
      return null;
    }
    return {
      poundsPerDayFloor: parsed.poundsPerDayFloor,
      percentFloor: parsed.percentFloor,
    };
  } catch {
    return null;
  }
}

/**
 * Agency settings. Components must call this module only.
 * Swap the localStorage mock for a Supabase row in this file later.
 */
export const settingsService = {
  async getMarginThresholds(): Promise<MarginThresholdSettings> {
    return readStored() ?? { ...DEFAULT_MARGIN_THRESHOLDS };
  },

  async saveMarginThresholds(
    next: MarginThresholdSettings,
  ): Promise<WriteResult> {
    if (typeof localStorage === "undefined") {
      return demoWriteResult();
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return demoWriteResult();
  },
};

export function resetSettingsStoreForTests() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
