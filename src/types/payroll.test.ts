import { describe, expect, it } from "vitest";
import {
  computeChargeTotal,
  computeGrossPay,
  computeMarginContribution,
  marginPerUnit,
  summariseGroup,
  type PayePayrollLine,
} from "@/types/payroll";

const cost = {
  payRate: 160,
  chargeRate: 210,
  employerNi: 22.08,
  holidayAccrual: 19.37,
  pensionCost: 4.8,
};

describe("payroll margin", () => {
  it("is charge rate minus pay rate and ignores employer on-costs", () => {
    expect(marginPerUnit(cost)).toBe(50);
    expect(computeMarginContribution(cost, 5)).toBe(250);
    expect(computeGrossPay(cost, 5)).toBe(800);
    expect(computeChargeTotal(cost, 5)).toBe(1050);
  });

  it("returns 0 when a rate is missing", () => {
    expect(marginPerUnit({ payRate: null, chargeRate: 210 })).toBe(0);
    expect(computeGrossPay({ payRate: null, chargeRate: 210 }, 3)).toBe(0);
  });
});

describe("summariseGroup", () => {
  it("counts workers and sums money", () => {
    const lines: PayePayrollLine[] = [
      {
        id: "a",
        periodId: "2026-08-23",
        worker: { id: "1", name: "A" },
        niNumber: "QQ1",
        payrollNumber: "P1",
        consultant: { id: "c", name: "C" },
        schools: [{ id: "s", name: "S" }],
        daysWorked: 5,
        hoursWorked: 32.5,
        rateUnit: "daily",
        cost,
        grossPay: 800,
        chargeTotal: 1050,
        marginContribution: 250,
        payrollType: "paye",
      },
      {
        id: "b",
        periodId: "2026-08-23",
        worker: { id: "2", name: "B" },
        niNumber: "QQ2",
        payrollNumber: "P2",
        consultant: { id: "c", name: "C" },
        schools: [{ id: "s", name: "S" }],
        daysWorked: 3,
        hoursWorked: 19.5,
        rateUnit: "daily",
        cost,
        grossPay: 480,
        chargeTotal: 630,
        marginContribution: 150,
        payrollType: "paye",
      },
    ];

    expect(summariseGroup("paye", lines)).toEqual({
      payrollType: "paye",
      workerCount: 2,
      daysWorked: 8,
      hoursWorked: 52,
      grossPay: 1280,
      chargeTotal: 1680,
      marginContribution: 400,
    });
  });
});
