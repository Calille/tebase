import { addDays, format } from "date-fns";
import { enGB } from "date-fns/locale";
import { parseIsoDate, payWeekContaining } from "@/lib/payWeek";
import { getDataset } from "@/mocks";

export type JobGroup = "teacher" | "ta" | "cover_supervisor";

export type DayCellStatus = "available" | "booked" | "off";

export const JOB_GROUP_LABELS: Record<JobGroup, string> = {
  teacher: "Teacher",
  ta: "TA",
  cover_supervisor: "Cover Supervisor",
};

export const DEFAULT_DAY_HOURS = { start: "08:30", end: "15:30" } as const;

export interface AvailabilityDayCell {
  status: DayCellStatus;
  start?: string;
  end?: string;
}

export interface AvailabilityTeacher {
  id: string;
  name: string;
  subject: string;
  jobGroup: JobGroup;
  days: AvailabilityDayCell[];
}

export function buildAvailabilityTeachers(): AvailabilityTeacher[] {
  return getDataset().availability as AvailabilityTeacher[];
}

export function weekdaysMonToFri(now = new Date()): Date[] {
  const week = payWeekContaining(now);
  const monday = parseIsoDate(week.startsOn);
  return [0, 1, 2, 3, 4].map((offset) => addDays(monday, offset));
}

export function formatDayHeader(date: Date): string {
  return format(date, "EEE d MMM", { locale: enGB });
}

/** 0 = Monday … 4 = Friday. Weekend maps to Friday. */
export function weekdayIndex(now = new Date()): number {
  const day = now.getDay();
  if (day === 0 || day === 6) return 4;
  return day - 1;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}
