import { beforeEach, describe, expect, it } from "vitest";
import {
  getPayeLinesForTests,
  getUmbrellaLinesForTests,
  payrollService,
  resetPayrollStoreForTests,
} from "@/services/payroll/payrollService";

const FROZEN = new Date(2026, 7, 21, 12);

describe("payrollService", () => {
  beforeEach(() => {
    resetPayrollStoreForTests(FROZEN);
  });

  it("defaults the current pay week to week ending 23 August 2026", async () => {
    const current = await payrollService.getCurrentPayWeek();
    expect(current.weekEnding).toBe("2026-08-23");
  });

  it("splits a run into PAYE and Umbrella with worker counts", async () => {
    const run = await payrollService.getPayrollRun("2026-08-23");
    expect(run.paye.workerCount).toBeGreaterThan(0);
    expect(run.umbrella.workerCount).toBeGreaterThan(0);
    expect(run.totalGrossPay).toBe(
      Math.round((run.paye.grossPay + run.umbrella.grossPay) * 100) / 100,
    );
    expect(run.lines.every((line) => line.periodId === "2026-08-23")).toBe(true);
  });

  it("filters by consultant, school, payroll type and search", async () => {
    const payeOnly = await payrollService.getPayrollRun("2026-08-23", {
      payrollType: "paye",
    });
    expect(payeOnly.umbrella.workerCount).toBe(0);
    expect(payeOnly.lines.every((line) => line.payrollType === "paye")).toBe(
      true,
    );

    const byName = await payrollService.getPayrollRun("2026-08-23", {
      search: "priya",
    });
    expect(byName.lines).toHaveLength(1);
    expect(byName.lines[0].worker.name).toBe("Priya Nair");

    const bySchool = await payrollService.getPayrollRun("2026-08-23", {
      schoolId: "sch-greenfield",
    });
    expect(
      bySchool.lines.every((line) =>
        line.schools.some((school) => school.id === "sch-greenfield"),
      ),
    ).toBe(true);
  });

  it("does not include employer on-costs in worker margin", async () => {
    const run = await payrollService.getPayrollRun("2026-08-23");
    const john = run.lines.find((line) => line.worker.name === "John Smith");
    expect(john).toBeDefined();
    expect(john?.cost.employerNi).toBeGreaterThan(0);
    expect(john?.marginContribution).toBe(
      ((john?.cost.chargeRate ?? 0) - (john?.cost.payRate ?? 0)) *
        (john?.daysWorked ?? 0),
    );
  });

  it("blocks a Mainpay preview when the current week has validation issues", async () => {
    const preview = await payrollService.previewMainpayExport("2026-08-23");
    expect(preview.issues.length).toBeGreaterThan(0);
    expect(preview.issues.map((issue) => issue.code).sort()).toEqual([
      "missing_ni",
      "missing_rate",
      "zero_hours",
    ]);
    expect(preview.csv).toContain("PLACEHOLDER_Employee_Name");
  });

  it("records a Mainpay export against the period", async () => {
    const periodId = "2026-08-09";
    const umbrella = getUmbrellaLinesForTests(periodId);
    const result = await payrollService.recordMainpayExport({
      periodId,
      rowCount: umbrella.length,
      exportedBy: { id: "demo-viewer", name: "Demo Viewer" },
    });

    expect(result.ok).toBe(true);
    expect(result.persisted).toBe(false);
    expect(result.data?.exportedBy.name).toBe("Demo Viewer");

    const records = await payrollService.getMainpayExports(periodId);
    expect(records[0]?.rowCount).toBe(umbrella.length);
    expect(records[0]?.weekEnding).toBe("2026-08-09");
  });

  it("seeds a prior-week export so the page can show already-sent state", async () => {
    const previous = await payrollService.getMainpayExports("2026-08-16");
    expect(previous.length).toBe(1);
    const current = await payrollService.getMainpayExports("2026-08-23");
    expect(current.length).toBe(0);
  });

  it("previews and records a PAYE CSV of PAYE workers only", async () => {
    const preview = await payrollService.previewPayeExport("2026-08-23");
    expect(preview.payeCount).toBeGreaterThan(0);
    expect(preview.csv).toContain("PLACEHOLDER_Gross_Pay");
    expect(preview.rows.every((row) => row.workerName.length > 0)).toBe(true);

    const paye = getPayeLinesForTests("2026-08-23");
    expect(preview.payeCount).toBe(paye.length);

    const result = await payrollService.recordPayeExport({
      periodId: "2026-08-23",
      rowCount: preview.payeCount,
      exportedBy: { id: "demo-viewer", name: "Demo Viewer" },
    });
    expect(result.ok).toBe(true);
    expect(result.persisted).toBe(false);

    const records = await payrollService.getPayeExports("2026-08-23");
    expect(records[0]?.rowCount).toBe(preview.payeCount);
  });

  it("marks Mainpay API as disconnected until a demo connect, then disconnects", async () => {
    const initial = await payrollService.getMainpayConnectionHealth();
    expect(initial.status).toBe("disconnected");
    expect(initial.demo).toBe(false);

    const connected = await payrollService.connectMainpayApi();
    expect(connected.ok).toBe(true);
    expect(connected.persisted).toBe(false);
    expect(connected.data?.status).toBe("connected");
    expect(connected.data?.demo).toBe(true);

    const health = await payrollService.getMainpayConnectionHealth();
    expect(health.status).toBe("connected");

    const disconnected = await payrollService.disconnectMainpayApi();
    expect(disconnected.data?.status).toBe("disconnected");
    expect((await payrollService.getMainpayConnectionHealth()).status).toBe(
      "disconnected",
    );
  });
});
