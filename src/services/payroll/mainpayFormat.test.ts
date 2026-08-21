import { describe, expect, it } from "vitest";
import {
  generateMainpayCsv,
  MAINPAY_COLUMN_MAP,
  toMainpayRow,
  validateMainpayLines,
} from "@/services/payroll/mainpayFormat";
import type { UmbrellaPayrollLine } from "@/types/payroll";

function umbrellaLine(
  overrides: Partial<UmbrellaPayrollLine> = {},
): UmbrellaPayrollLine {
  return {
    id: "u1",
    periodId: "2026-08-23",
    worker: { id: "tch-priya", name: "Priya Nair" },
    niNumber: "QQ778899A",
    payrollNumber: "UMB-2001",
    consultant: { id: "cons-alex", name: "Alex Patel" },
    schools: [{ id: "sch-westfield", name: "Westfield Primary" }],
    daysWorked: 5,
    hoursWorked: 32.5,
    rateUnit: "daily",
    cost: { payRate: 185, chargeRate: 230 },
    grossPay: 925,
    chargeTotal: 1150,
    marginContribution: 225,
    payrollType: "umbrella",
    umbrellaProvider: "Mainpay",
    ...overrides,
  };
}

describe("Mainpay column map", () => {
  it("keeps placeholder headers in one config object", () => {
    const headers = MAINPAY_COLUMN_MAP.map((column) => column.header);
    expect(headers.every((header) => header.startsWith("PLACEHOLDER_"))).toBe(
      true,
    );
    expect(headers).toContain("PLACEHOLDER_NI_Number");
  });
});

describe("validateMainpayLines", () => {
  it("flags missing NI, missing rates, and zero-hour rows", () => {
    const issues = validateMainpayLines([
      umbrellaLine({ id: "ni", niNumber: null, worker: { id: "1", name: "No NI" } }),
      umbrellaLine({
        id: "rate",
        cost: { payRate: null, chargeRate: 220 },
        worker: { id: "2", name: "No rate" },
      }),
      umbrellaLine({
        id: "zero",
        daysWorked: 0,
        hoursWorked: 0,
        worker: { id: "3", name: "Zero hours" },
      }),
      umbrellaLine({ id: "ok" }),
    ]);

    expect(issues.map((issue) => issue.code).sort()).toEqual([
      "missing_ni",
      "missing_rate",
      "zero_hours",
    ]);
  });
});

describe("generateMainpayCsv", () => {
  it("emits placeholder headers and escaped row values", () => {
    const row = toMainpayRow(umbrellaLine(), "2026-08-23");
    const csv = generateMainpayCsv([row]);
    expect(csv.startsWith("PLACEHOLDER_Employee_Name,")).toBe(true);
    expect(csv).toContain("Priya Nair");
    expect(csv).toContain("QQ778899A");
    expect(csv).toContain("Mainpay");
  });
});
