import { describe, expect, it } from "vitest";
import {
  generatePayeCsv,
  PAYE_COLUMN_MAP,
  toPayeRow,
  validatePayeLines,
} from "@/services/payroll/payeFormat";
import type { PayePayrollLine } from "@/types/payroll";

function payeLine(overrides: Partial<PayePayrollLine> = {}): PayePayrollLine {
  return {
    id: "p1",
    periodId: "2026-08-23",
    worker: { id: "tch-john", name: "John Smith" },
    niNumber: "QQ123456C",
    payrollNumber: "PAYE-1001",
    consultant: { id: "cons-alex", name: "Alex Patel" },
    schools: [{ id: "sch-westfield", name: "Westfield Primary" }],
    daysWorked: 5,
    hoursWorked: 32.5,
    rateUnit: "daily",
    cost: {
      payRate: 160,
      chargeRate: 210,
      employerNi: 22.08,
      holidayAccrual: 19.37,
      pensionCost: 4.8,
    },
    grossPay: 800,
    chargeTotal: 1050,
    marginContribution: 250,
    payrollType: "paye",
    ...overrides,
  };
}

describe("PAYE column map", () => {
  it("keeps placeholder headers in one config object", () => {
    const headers = PAYE_COLUMN_MAP.map((column) => column.header);
    expect(headers.every((header) => header.startsWith("PLACEHOLDER_"))).toBe(true);
    expect(headers).toContain("PLACEHOLDER_Employer_NI");
  });
});

describe("validatePayeLines", () => {
  it("flags missing NI, missing rates, and zero-hour rows", () => {
    const issues = validatePayeLines([
      payeLine({ id: "ni", niNumber: null, worker: { id: "1", name: "No NI" } }),
      payeLine({
        id: "rate",
        cost: { payRate: null, chargeRate: 220 },
        worker: { id: "2", name: "No rate" },
      }),
      payeLine({
        id: "zero",
        daysWorked: 0,
        hoursWorked: 0,
        worker: { id: "3", name: "Zero hours" },
      }),
      payeLine({ id: "ok" }),
    ]);

    expect(issues.map((issue) => issue.code).sort()).toEqual([
      "missing_ni",
      "missing_rate",
      "zero_hours",
    ]);
  });
});

describe("generatePayeCsv", () => {
  it("emits placeholder headers and PAYE on-cost columns", () => {
    const row = toPayeRow(payeLine(), "2026-08-23");
    const csv = generatePayeCsv([row]);
    expect(csv.startsWith("PLACEHOLDER_Employee_Name,")).toBe(true);
    expect(csv).toContain("John Smith");
    expect(csv).toContain("QQ123456C");
    expect(csv).toContain("PLACEHOLDER_Employer_NI");
  });
});
