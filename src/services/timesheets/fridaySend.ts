import { isLondonFridayTenAmWindow } from "@/lib/londonTime";
import type { Timesheet } from "@/types/timesheet";

export type FridaySendSkipReason = "no_bookings" | "holiday_inset" | "not_draft";

export interface FridaySendPlan {
  sendIds: string[];
  skipped: { id: string; reason: FridaySendSkipReason }[];
}

/**
 * Friday 10am send planner (shared with the Edge Function stub).
 * Does not send email. Empty weeks and holiday/INSET sheets are skipped.
 */
export function planFridaySend(sheets: Timesheet[]): FridaySendPlan {
  const sendIds: string[] = [];
  const skipped: FridaySendPlan["skipped"] = [];

  for (const sheet of sheets) {
    if (sheet.holidayOrInset) {
      skipped.push({ id: sheet.id, reason: "holiday_inset" });
      continue;
    }
    if (!sheet.hasBookings || sheet.expectedDays <= 0) {
      skipped.push({ id: sheet.id, reason: "no_bookings" });
      continue;
    }
    if (sheet.status !== "draft") {
      skipped.push({ id: sheet.id, reason: "not_draft" });
      continue;
    }
    sendIds.push(sheet.id);
  }

  return { sendIds, skipped };
}

export function shouldRunScheduledSend(now: Date, force: boolean): boolean {
  return force || isLondonFridayTenAmWindow(now);
}
