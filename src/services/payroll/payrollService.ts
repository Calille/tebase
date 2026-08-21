import {
  demoCreateResult,
  type CreateResult,
} from "@/lib/persistence";
import { payWeekContaining, parseIsoDate } from "@/lib/payWeek";
import {
  emptyGroupSummary,
  summariseGroup,
  type MainpayExportRecord,
  type MainpayValidationIssue,
  type PayWeek,
  type PayrollFilters,
  type PayrollPartyRef,
  type PayrollRun,
  type PayrollWorkerLine,
  type UmbrellaPayrollLine,
} from "@/types/payroll";
import {
  generateMainpayCsv,
  isUmbrellaLine,
  MAINPAY_COLUMN_MAP,
  toMainpayRow,
  validateMainpayLines,
  type MainpayCsvRow,
} from "./mainpayFormat";
import { getDataset, resetDataset } from "@/mocks";

const EXPORT_STORAGE_KEY = "tebase.payroll.mainpayExports";

let linesByPeriod = new Map<string, PayrollWorkerLine[]>();
let weeks: PayWeek[] = [];
let exportsStore: MainpayExportRecord[] = [];
let seeded = false;

function uniqueById(items: PayrollPartyRef[]): PayrollPartyRef[] {
  const seen = new Set<string>();
  const result: PayrollPartyRef[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

function readStoredExports(): MainpayExportRecord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(EXPORT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MainpayExportRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredExports(records: MainpayExportRecord[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(EXPORT_STORAGE_KEY, JSON.stringify(records));
}

function seedIfNeeded(now = new Date()) {
  if (seeded) return;
  const dataset = getDataset();
  weeks = dataset.weeks.slice(0, 12);
  linesByPeriod = new Map(
    weeks.map((week) => [week.id, (dataset.payrollByPeriod[week.id] ?? []).map((line) => ({ ...line }))]),
  );

  const stored = readStoredExports();
  if (stored.length > 0) {
    exportsStore = stored;
  } else {
    const previous = weeks[1];
    if (previous) {
      const umbrellaCount = (linesByPeriod.get(previous.id) ?? []).filter(
        isUmbrellaLine,
      ).length;
      exportsStore = [
        {
          id: `exp-${previous.id}`,
          exportedAt: new Date(
            parseIsoDate(previous.weekEnding).getTime() + 10 * 60 * 60 * 1000,
          ).toISOString(),
          periodId: previous.id,
          weekEnding: previous.weekEnding,
          rowCount: umbrellaCount,
          exportedBy: dataset.consultants[0]
            ? { id: dataset.consultants[0].id, name: dataset.consultants[0].name }
            : { id: "cons-alex", name: "Alex Patel" },
        },
      ];
      writeStoredExports(exportsStore);
    }
  }

  seeded = true;
}

function getLines(periodId: string): PayrollWorkerLine[] {
  seedIfNeeded();
  return linesByPeriod.get(periodId) ?? [];
}

function matchesFilters(
  line: PayrollWorkerLine,
  filters: PayrollFilters,
): boolean {
  if (filters.consultantId && line.consultant.id !== filters.consultantId) {
    return false;
  }
  if (
    filters.schoolId &&
    !line.schools.some((school) => school.id === filters.schoolId)
  ) {
    return false;
  }
  if (
    filters.payrollType &&
    filters.payrollType !== "all" &&
    line.payrollType !== filters.payrollType
  ) {
    return false;
  }
  const search = filters.search?.trim().toLowerCase();
  if (search) {
    const haystack = [
      line.worker.name,
      line.consultant.name,
      ...line.schools.map((school) => school.name),
      line.niNumber ?? "",
      line.payrollNumber ?? "",
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(search)) return false;
  }
  return true;
}

export function applyPayrollFilters(
  run: PayrollRun,
  filters: PayrollFilters,
): PayrollRun {
  const lines = run.lines.filter((line) => matchesFilters(line, filters));
  return buildRun(run.period, lines);
}

function buildRun(period: PayWeek, lines: PayrollWorkerLine[]): PayrollRun {
  const payeLines = lines.filter((line) => line.payrollType === "paye");
  const umbrellaLines = lines.filter((line) => line.payrollType === "umbrella");
  const paye = summariseGroup("paye", payeLines);
  const umbrella = summariseGroup("umbrella", umbrellaLines);

  return {
    period,
    lines,
    totalGrossPay: Math.round((paye.grossPay + umbrella.grossPay) * 100) / 100,
    paye,
    umbrella,
  };
}

export interface MainpayExportPreview {
  weekEnding: string;
  periodId: string;
  headers: string[];
  rows: MainpayCsvRow[];
  csv: string;
  issues: MainpayValidationIssue[];
  umbrellaCount: number;
}

/**
 * Payroll domain service.
 *
 * Components must call this module only — no sample arrays in the UI.
 * Swapping the in-memory mock for Supabase should be a change to this file.
 */
export const payrollService = {
  async getPayWeeks(): Promise<PayWeek[]> {
    seedIfNeeded();
    return weeks;
  },

  async getCurrentPayWeek(): Promise<PayWeek> {
    seedIfNeeded();
    return weeks[0] ?? payWeekContaining(new Date());
  },

  async getPayrollRun(
    periodId: string,
    filters: PayrollFilters = {},
  ): Promise<PayrollRun> {
    seedIfNeeded();
    const period = weeks.find((week) => week.id === periodId);
    if (!period) {
      return {
        period: {
          id: periodId,
          startsOn: periodId,
          weekEnding: periodId,
          label: `Unknown period ${periodId}`,
        },
        lines: [],
        totalGrossPay: 0,
        paye: emptyGroupSummary("paye"),
        umbrella: emptyGroupSummary("umbrella"),
      };
    }

    const run = buildRun(period, getLines(periodId));
    return applyPayrollFilters(run, filters);
  },

  async getFilterOptions(periodId: string): Promise<{
    consultants: PayrollPartyRef[];
    schools: PayrollPartyRef[];
  }> {
    const lines = getLines(periodId);
    return {
      consultants: uniqueById(lines.map((line) => line.consultant)),
      schools: uniqueById(lines.flatMap((line) => line.schools)),
    };
  },

  async getMainpayExports(periodId: string): Promise<MainpayExportRecord[]> {
    seedIfNeeded();
    return exportsStore
      .filter((record) => record.periodId === periodId)
      .sort((a, b) => b.exportedAt.localeCompare(a.exportedAt));
  },

  async previewMainpayExport(periodId: string): Promise<MainpayExportPreview> {
    seedIfNeeded();
    const period = weeks.find((week) => week.id === periodId);
    const weekEnding = period?.weekEnding ?? periodId;
    const umbrella = getLines(periodId).filter(isUmbrellaLine);
    const rows = umbrella.map((line) => toMainpayRow(line, weekEnding));
    return {
      weekEnding,
      periodId,
      headers: MAINPAY_COLUMN_MAP.map((column) => column.header),
      rows,
      csv: generateMainpayCsv(rows),
      issues: validateMainpayLines(umbrella),
      umbrellaCount: umbrella.length,
    };
  },

  async recordMainpayExport(input: {
    periodId: string;
    rowCount: number;
    exportedBy: PayrollPartyRef;
  }): Promise<CreateResult<MainpayExportRecord>> {
    seedIfNeeded();
    const period = weeks.find((week) => week.id === input.periodId);
    const record: MainpayExportRecord = {
      id: `exp-${input.periodId}-${Date.now()}`,
      exportedAt: new Date().toISOString(),
      periodId: input.periodId,
      weekEnding: period?.weekEnding ?? input.periodId,
      rowCount: input.rowCount,
      exportedBy: input.exportedBy,
    };
    exportsStore = [record, ...exportsStore];
    writeStoredExports(exportsStore);
    return demoCreateResult(record);
  },
};

/** Test-only: rebuild mock weeks/lines and clear recorded exports. */
export function resetPayrollStoreForTests(now = new Date()) {
  resetDataset({ now });
  seeded = false;
  linesByPeriod = new Map();
  weeks = [];
  exportsStore = [];
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(EXPORT_STORAGE_KEY);
  }
  seedIfNeeded(now);
}

export function getUmbrellaLinesForTests(
  periodId: string,
): UmbrellaPayrollLine[] {
  return getLines(periodId).filter(isUmbrellaLine);
}
