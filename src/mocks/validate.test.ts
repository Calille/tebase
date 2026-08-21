import { describe, expect, it } from "vitest";
import { buildDataset, defaultConfig } from "./seed";
import { validateDataset } from "./validate";

const NOW = new Date(2026, 7, 21, 12);

describe("seed dataset", () => {
  const dataset = buildDataset(defaultConfig(NOW));

  it("is internally consistent", () => {
    const issues = validateDataset(dataset).filter(
      (issue) => issue.code !== "timesheet-days" || !issue.message.includes(dataset.emptyWeek.id),
    );
    const blocking = issues.filter((issue) => issue.code !== "volume" || dataset.bookings.length < 700);
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });

  it("hits the volume band and named edge cases", () => {
    expect(dataset.consultants.filter((c) => c.role === "consultant")).toHaveLength(8);
    expect(dataset.consultants.filter((c) => c.role === "coordinator")).toHaveLength(14);
    expect(dataset.consultants.filter((c) => c.role === "team_leader")).toHaveLength(2);
    expect(new Set(dataset.teams.map((team) => team.leaderId)).size).toBe(2);
    expect(dataset.teachers).toHaveLength(50);
    expect(dataset.schools).toHaveLength(30);
    expect(dataset.bookings.length).toBeGreaterThanOrEqual(700);
    expect(dataset.edgeCases.idleConsultantId).toBe("cons-idle");
    expect(dataset.teachers.some((t) => t.name.includes("O'Brien"))).toBe(true);
    expect(dataset.teachers.some((t) => t.name.includes("Ní Mhaoileoin"))).toBe(true);
    expect(dataset.schools.some((s) => s.name.length > 60)).toBe(true);
    expect(dataset.billTos.find((b) => b.id === dataset.edgeCases.unmappedBillToId)?.xeroContactId).toBeNull();
    expect(
      dataset.billTos.find((b) => b.id === dataset.edgeCases.consolidatedTrustBillToId)?.schoolIds.length,
    ).toBeGreaterThanOrEqual(5);
    expect(dataset.bookings.length).toBeLessThanOrEqual(1400);
    const paye = dataset.teachers.filter((t) => t.payrollType === "paye").length;
    const umbrella = dataset.teachers.filter((t) => t.payrollType === "umbrella").length;
    expect({
      bookings: dataset.bookings.length,
      timesheets: dataset.timesheets.length,
      teachers: dataset.teachers.length,
      schools: dataset.schools.length,
      consultants: dataset.consultants.length,
      teams: dataset.teams.length,
      billTos: dataset.billTos.length,
      vacancies: dataset.vacancies.length,
      weeks: dataset.weeks.length,
      emptyWeek: dataset.emptyWeek.id,
      paye,
      umbrella,
    }).toMatchObject({
      teachers: 50,
      schools: 30,
      teams: 2,
    });
  });

  it("is deterministic for a fixed seed", () => {
    const again = buildDataset(defaultConfig(NOW));
    expect(again.bookings.length).toBe(dataset.bookings.length);
    expect(again.bookings[0]?.id).toBe(dataset.bookings[0]?.id);
    expect(again.timesheets.find((t) => t.id === "ts-unapp-2")?.status).toBe("queried");
  });
});
