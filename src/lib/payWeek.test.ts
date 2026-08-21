import { describe, expect, it } from "vitest";
import { listPayWeeks, payWeekContaining, toIsoDate } from "@/lib/payWeek";

describe("payWeekContaining", () => {
  it("treats Friday 21 August 2026 as week ending Sunday 23 August", () => {
    const week = payWeekContaining(new Date(2026, 7, 21, 12));
    expect(week.id).toBe("2026-08-23");
    expect(week.startsOn).toBe("2026-08-17");
    expect(week.weekEnding).toBe("2026-08-23");
    expect(week.label).toContain("week ending Sunday 23 August 2026");
  });

  it("keeps a Sunday in the week that ends that day", () => {
    const week = payWeekContaining(new Date(2026, 7, 23, 18));
    expect(toIsoDate(new Date(2026, 7, 23))).toBe("2026-08-23");
    expect(week.weekEnding).toBe("2026-08-23");
    expect(week.startsOn).toBe("2026-08-17");
  });
});

describe("listPayWeeks", () => {
  it("returns the current week first, then older weeks", () => {
    const weeks = listPayWeeks(new Date(2026, 7, 21, 12), 3);
    expect(weeks.map((week) => week.id)).toEqual([
      "2026-08-23",
      "2026-08-16",
      "2026-08-09",
    ]);
  });
});
