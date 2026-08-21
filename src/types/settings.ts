/**
 * Agency settings that affect reports. Stored via settingsService
 * (localStorage mock today; one-file swap to Supabase later).
 *
 * Default floors are starter values, not Keep Education policy.
 */
export interface MarginThresholdSettings {
  /** Alert when (charge − pay) per day is below this £ amount. */
  poundsPerDayFloor: number;
  /** Alert when margin as a % of charge is below this (0–100). */
  percentFloor: number;
}

export const DEFAULT_MARGIN_THRESHOLDS: MarginThresholdSettings = {
  poundsPerDayFloor: 40,
  percentFloor: 20,
};
