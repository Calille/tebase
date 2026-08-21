import { describe, expect, it } from "vitest";
import { payWeekContaining } from "@/lib/payWeek";
import { lastCompletedHalfTerm, sameWeekLastTerm, termContaining } from "@/lib/terms";

describe("termContaining", () => {
  it("places 21 August 2026 in the summer holiday, not a term", () => {
    expect(termContaining("2026-08-21")).toBeNull();
  });

  it("places mid-June in Summer 2026", () => {
    expect(termContaining("2026-06-15")?.id).toBe("summer-2026");
  });
});

describe("sameWeekLastTerm", () => {
  it("maps a summer-term week onto the same index in spring", () => {
    const summerWeek = payWeekContaining(new Date(2026, 5, 15, 12));
    const seasonal = sameWeekLastTerm(summerWeek);
    expect(seasonal.isProxy).toBe(false);
    expect(seasonal.termName).toBe("Spring 2026");
  });

  it("uses a 13-week proxy when the selected week is outside term", () => {
    const holiday = payWeekContaining(new Date(2026, 7, 21, 12));
    const seasonal = sameWeekLastTerm(holiday);
    expect(seasonal.isProxy).toBe(true);
    expect(seasonal.label).toMatch(/proxy/i);
  });
});

describe("lastCompletedHalfTerm", () => {
  it("treats summer second half as last completed from August", () => {
    const half = lastCompletedHalfTerm("2026-08-21");
    expect(half?.id).toBe("summer-2026-2");
  });
});
