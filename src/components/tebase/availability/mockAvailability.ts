import { addDays, format } from "date-fns";
import { enGB } from "date-fns/locale";
import { parseIsoDate, payWeekContaining } from "@/lib/payWeek";

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
  /** Monday–Friday for the current week. */
  days: AvailabilityDayCell[];
}

const NAMES: { name: string; subject: string; jobGroup: JobGroup }[] = [
  { name: "James Foster", subject: "Mathematics", jobGroup: "teacher" },
  { name: "Priya Nair", subject: "English", jobGroup: "teacher" },
  { name: "Michael Chen", subject: "Science", jobGroup: "teacher" },
  { name: "Emily Rodriguez", subject: "Art", jobGroup: "ta" },
  { name: "David Wilson", subject: "PE", jobGroup: "cover_supervisor" },
  { name: "Aisha Khan", subject: "Primary", jobGroup: "teacher" },
  { name: "Tom Hughes", subject: "History", jobGroup: "teacher" },
  { name: "Nina Cole", subject: "Early years", jobGroup: "ta" },
  { name: "Sarah Johnson", subject: "English", jobGroup: "teacher" },
  { name: "John Smith", subject: "Mathematics", jobGroup: "teacher" },
  { name: "Helen Crowe", subject: "Geography", jobGroup: "teacher" },
  { name: "Chris Adey", subject: "Music", jobGroup: "cover_supervisor" },
  { name: "Patrice Bell", subject: "Primary", jobGroup: "ta" },
  { name: "Joanna Hale", subject: "Science", jobGroup: "teacher" },
  { name: "Neil Cartwright", subject: "PE", jobGroup: "cover_supervisor" },
  { name: "Claire Dunn", subject: "MFL", jobGroup: "teacher" },
  { name: "Omar Rahman", subject: "Computing", jobGroup: "teacher" },
  { name: "Lucy Bennett", subject: "SEN", jobGroup: "ta" },
  { name: "Daniel Okeke", subject: "Mathematics", jobGroup: "teacher" },
  { name: "Freya Walsh", subject: "Drama", jobGroup: "teacher" },
  { name: "Hassan Ali", subject: "Primary", jobGroup: "ta" },
  { name: "Megan Price", subject: "English", jobGroup: "teacher" },
  { name: "Callum Reid", subject: "DT", jobGroup: "cover_supervisor" },
  { name: "Sofia Martins", subject: "Science", jobGroup: "teacher" },
  { name: "Ben Walker", subject: "Primary", jobGroup: "teacher" },
];

function hours(): Pick<AvailabilityDayCell, "start" | "end"> {
  return { start: DEFAULT_DAY_HOURS.start, end: DEFAULT_DAY_HOURS.end };
}

function available(): AvailabilityDayCell {
  return { status: "available", ...hours() };
}

function booked(): AvailabilityDayCell {
  return { status: "booked", ...hours() };
}

function off(): AvailabilityDayCell {
  return { status: "off" };
}

/**
 * 25 teachers. Friday (today in the screenshot week) is mostly available,
 * none booked, one fully off / unavailable.
 */
export function buildAvailabilityTeachers(): AvailabilityTeacher[] {
  return NAMES.map((person, index) => {
    const days: AvailabilityDayCell[] = [
      index % 7 === 0 ? booked() : available(),
      index % 5 === 2 ? off() : available(),
      index % 4 === 1 ? booked() : index === 24 ? off() : available(),
      index % 6 === 3 ? off() : available(),
      index === 14 || index === 24 ? off() : available(),
    ];
    if (index === 4) {
      days[0] = off();
      days[1] = off();
      days[2] = off();
      days[3] = off();
      days[4] = off();
    }
    return {
      id: `avail-${index + 1}`,
      name: person.name,
      subject: person.subject,
      jobGroup: person.jobGroup,
      days,
    };
  });
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
