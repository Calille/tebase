import {
  DEFAULT_SEED,
  SCENARIOS,
  STORAGE_SCENARIO,
  STORAGE_SEED,
  type SeedScenario,
} from "./constants";
import { buildDataset, defaultConfig } from "./seed";
import type { SeedConfig, SeedDataset } from "./types";

export { DEFAULT_SEED, SCENARIOS, VOLUME, IDS } from "./constants";
export type { SeedScenario } from "./constants";
export type { SeedConfig, SeedDataset, SeedEdgeCases, SeedBooking, SeedTeacher, SeedSchool } from "./types";
export { buildDataset } from "./seed";

let cache: SeedDataset | null = null;
let active: SeedConfig | null = null;
let generation = 0;

export function datasetGeneration(): number {
  return generation;
}

function readBrowserOverrides(): Partial<SeedConfig> {
  if (typeof localStorage === "undefined") return {};
  try {
    const seedRaw = localStorage.getItem(STORAGE_SEED);
    const scenarioRaw = localStorage.getItem(STORAGE_SCENARIO);
    const seed = seedRaw ? Number(seedRaw) : undefined;
    const scenario = SCENARIOS.some((item) => item.id === scenarioRaw)
      ? (scenarioRaw as SeedScenario)
      : undefined;
    return {
      seed: seed != null && Number.isFinite(seed) ? seed : undefined,
      scenario,
    };
  } catch {
    return {};
  }
}

export function getSeedConfig(): SeedConfig {
  if (active) return active;
  const stored = readBrowserOverrides();
  active = defaultConfig(
    new Date(),
    stored.seed ?? DEFAULT_SEED,
    stored.scenario ?? "default",
  );
  return active;
}

export function getDataset(overrides?: Partial<SeedConfig>): SeedDataset {
  if (overrides?.now || overrides?.seed != null || overrides?.scenario) {
    const config = {
      ...getSeedConfig(),
      ...overrides,
    };
    cache = buildDataset(config);
    active = config;
    return cache;
  }
  if (!cache) {
    cache = buildDataset(getSeedConfig());
  }
  return cache;
}

export function resetDataset(config?: Partial<SeedConfig>): SeedDataset {
  const next = {
    ...getSeedConfig(),
    ...config,
    now: config?.now ?? new Date(),
  };
  active = next;
  cache = buildDataset(next);
  generation += 1;
  return cache;
}

export function persistSeedConfig(seed: number, scenario: SeedScenario) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_SEED, String(seed));
  localStorage.setItem(STORAGE_SCENARIO, scenario);
}

export function applyUiSeed(seed: number, scenario: SeedScenario) {
  persistSeedConfig(seed, scenario);
  resetDataset({ seed, scenario, now: new Date() });
  if (typeof window !== "undefined") {
    window.location.reload();
  }
}
