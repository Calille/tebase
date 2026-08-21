import { beforeEach, describe, expect, it, vi } from "vitest";

const { from } = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: true,
  supabase: {
    from,
  },
}));

import { bookingService } from "@/services/bookingService";

describe("bookingService", () => {
  beforeEach(() => {
    from.mockReset();
  });

  it("throws when listing bookings fails instead of returning an empty list", async () => {
    from.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "permission denied" },
      }),
    });

    await expect(bookingService.getBookings()).rejects.toThrow(
      "permission denied"
    );
  });

  it("maps booking rows from Supabase", async () => {
    from.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [
          {
            id: "b1",
            reference: "TB-1",
            school: { id: "s1", name: "Westfield" },
            teacher: { id: "t1", name: "John Smith" },
            subject: "Maths",
            start_date: "2026-01-01",
            end_date: "2026-01-02",
            status: "confirmed",
            duration: "1 day",
            rate: 150,
            notes: "",
          },
        ],
        error: null,
      }),
    });

    const bookings = await bookingService.getBookings();
    expect(bookings).toEqual([
      {
        id: "b1",
        reference: "TB-1",
        school: { id: "s1", name: "Westfield" },
        teacher: { id: "t1", name: "John Smith" },
        subject: "Maths",
        startDate: "2026-01-01",
        endDate: "2026-01-02",
        status: "confirmed",
        duration: "1 day",
        rate: 150,
        notes: "",
      },
    ]);
  });

  it("throws when create fails", async () => {
    from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "insert failed" },
        }),
      }),
    });

    await expect(
      bookingService.createBooking({
        reference: "TB-2",
        school: { id: "s1", name: "Westfield" },
        teacher: { id: "t1", name: "John Smith" },
        subject: "Maths",
        startDate: "2026-01-01",
        endDate: "2026-01-02",
        status: "pending",
        duration: "1 day",
        rate: 150,
      })
    ).rejects.toThrow("insert failed");
  });
});
