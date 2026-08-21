import { beforeEach, describe, expect, it } from "vitest";
import { nextWeeklySendOn } from "./schedule";
import {
  complianceService,
  resetComplianceStoreForTests,
} from "./complianceService";

const FROZEN = new Date(2026, 7, 21, 12);

describe("nextWeeklySendOn", () => {
  it("from Friday 21 Aug 2026, next Monday is 24 Aug", () => {
    expect(nextWeeklySendOn(FROZEN, 1, null)).toBe("2026-08-24");
  });

  it("after a Friday send, still lands on the following Monday", () => {
    expect(nextWeeklySendOn(FROZEN, 1, FROZEN.toISOString())).toBe("2026-08-24");
  });
});

describe("complianceService", () => {
  beforeEach(() => {
    resetComplianceStoreForTests(FROZEN);
  });

  it("lists courses with incomplete staff on each course", async () => {
    const courses = await complianceService.listCourses();
    expect(courses.map((course) => course.id)).toEqual([
      "safeguarding",
      "prevent",
      "gdpr-staff",
      "equality",
    ]);
    for (const course of courses) {
      expect(course.incompleteCount, course.id).toBeGreaterThan(0);
      expect(course.completeCount + course.incompleteCount).toBe(50);
    }
  });

  it("includes the expired-DBS teacher on safeguarding incomplete", async () => {
    const detail = await complianceService.getCourse("safeguarding");
    expect(detail?.incomplete.some((row) => row.teacherId === "tch-dbs")).toBe(true);
  });

  it("queues a course chase without claiming email is live", async () => {
    const result = await complianceService.queueCourseChase("safeguarding");
    expect(result.ok).toBe(true);
    expect(result.data?.emailLive).toBe(false);
    expect(result.data?.recipientCount).toBeGreaterThan(0);
    const sends = await complianceService.listSends();
    expect(sends[0]?.kind).toBe("course");
    expect(sends[0]?.recipientCount).toBe(result.data?.recipientCount);
  });

  it("lists seed outstanding documents including DBS and the second reference", async () => {
    const rows = await complianceService.listOutstandingDocuments();
    expect(rows.some((row) => row.teacherId === "tch-dbs" && row.kind === "dbs")).toBe(true);
    expect(rows.some((row) => row.teacherId === "tch-noref" && row.kind === "reference")).toBe(
      true,
    );
    expect(rows.some((row) => row.teacherId === "tch-lisa" && row.kind === "ni")).toBe(true);
    expect(rows.length).toBeGreaterThanOrEqual(3);
  });

  it("defaults weekly document reminders on, next send Monday 24 Aug", async () => {
    const state = await complianceService.getWeeklyReminder();
    expect(state.enabled).toBe(true);
    expect(state.weekday).toBe(1);
    expect(state.nextSendOn).toBe("2026-08-24");
    expect(state.peopleCount).toBeGreaterThan(0);
  });

  it("records a weekly reminder queue and advances lastSentAt", async () => {
    const result = await complianceService.queueWeeklyDocumentReminders();
    expect(result.ok).toBe(true);
    expect(result.data?.emailLive).toBe(false);
    expect(result.data?.recipientCount).toBeGreaterThan(0);
    const state = await complianceService.getWeeklyReminder();
    expect(state.lastSentAt).toBe(FROZEN.toISOString());
    expect(state.nextSendOn).toBe("2026-08-24");
  });
});
