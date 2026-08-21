import type { Timesheet } from "@/types/timesheet";
import { getDataset } from "@/mocks";
import { differenceInCalendarDays } from "date-fns";

export function buildMockTimesheets(now = new Date()): Timesheet[] {
  return getDataset({ now }).timesheets.map((sheet) => ({ ...sheet }));
}

export function daysSinceSent(sheet: Timesheet, now = new Date()): number | null {
  if (!sheet.sentAt) return null;
  return differenceInCalendarDays(now, new Date(sheet.sentAt));
}
