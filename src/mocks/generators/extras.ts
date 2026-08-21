import { subDays } from "date-fns";
import { toIsoDate } from "@/lib/payWeek";
import { IDS } from "../constants";
import { chance, int, pick, type Rng } from "../rng";
import type {
  SeedAlarm,
  SeedAvailabilityTeacher,
  SeedBooking,
  SeedComplaint,
  SeedConsultant,
  SeedNote,
  SeedSchool,
  SeedTeacher,
  SeedVacancy,
} from "../types";
import type { PayWeek } from "@/types/payroll";

export function generateVacancies(
  rng: Rng,
  now: Date,
  schools: SeedSchool[],
): SeedVacancy[] {
  const openSchools = schools.filter((s) => !s.dormant).slice(0, 12);
  return openSchools.map((school, index) => ({
    id: `vac-${String(index + 1).padStart(3, "0")}`,
    title:
      school.phase === "secondary"
        ? `${pick(rng, ["Maths", "English", "Science"])} supply — ${school.name}`
        : `KS2 cover — ${school.name}`,
    schoolId: school.id,
    schoolName: school.name,
    location: `${school.city} (${school.postcode})`,
    subject: school.phase === "secondary" ? pick(rng, ["Maths", "English", "Science", "PE"]) : "Primary",
    type: pick(rng, ["full-time", "part-time", "temporary"] as const),
    startDate: toIsoDate(subDays(now, -int(rng, 1, 14))),
    rate: 140 + index * 5,
    status: index % 7 === 0 ? "filled" : index % 11 === 0 ? "closed" : "open",
    description: `Cover required at ${school.name}. Rates on application.`,
    requirements: ["QTS or equivalent", "Recent DBS"],
    postedDate: toIsoDate(subDays(now, int(rng, 1, 21))),
  }));
}

export function generateComplaints(
  rng: Rng,
  now: Date,
  schools: SeedSchool[],
  teachers: SeedTeacher[],
): SeedComplaint[] {
  return Array.from({ length: 12 }, (_, index) => {
    const school = schools[index % schools.length]!;
    const teacher = teachers[index % teachers.length]!;
    return {
      id: `cmp-${String(index + 1).padStart(3, "0")}`,
      title: pick(rng, [
        "Late arrival",
        "Lesson planning concern",
        "Playground incident",
        "Uniform policy",
        "Timesheet query escalated",
      ]),
      description: `Logged against ${school.name}.`,
      schoolId: school.id,
      schoolName: school.name,
      teacherId: teacher.id,
      teacherName: teacher.name,
      status: pick(rng, ["open", "investigating", "resolved", "closed"] as const),
      priority: pick(rng, ["low", "medium", "high"] as const),
      date: toIsoDate(subDays(now, int(rng, 1, 40))),
    };
  });
}

export function generateAlarms(
  now: Date,
  teachers: SeedTeacher[],
  schools: SeedSchool[],
): SeedAlarm[] {
  const expired = teachers.find((t) => t.dbsExpired)!;
  const missing = teachers.find((t) => t.missingReference)!;
  return [
    {
      id: "al-dbs",
      title: "Expired DBS",
      description: `${expired.name} DBS expired ${expired.dbsExpiry}`,
      type: "teacher",
      priority: "critical",
      status: "active",
      date: expired.dbsExpiry,
      entityName: expired.name,
    },
    {
      id: "al-ref",
      title: "Missing reference — bookings blocked",
      description: `${missing.name} cannot be booked until a second reference is on file.`,
      type: "teacher",
      priority: "high",
      status: "active",
      date: toIsoDate(subDays(now, 3)),
      entityName: missing.name,
    },
    {
      id: "al-slow",
      title: "Habitually slow timesheets",
      description: `${schools.find((s) => s.slowTimesheets)?.name} is outstanding across multiple weeks.`,
      type: "school",
      priority: "high",
      status: "active",
      date: toIsoDate(subDays(now, 11)),
      entityName: schools.find((s) => s.slowTimesheets)?.name,
    },
    {
      id: "al-margin",
      title: "Negative margin booking",
      description: "A charge rate was entered below pay.",
      type: "booking",
      priority: "critical",
      status: "acknowledged",
      date: toIsoDate(now),
    },
    ...Array.from({ length: 10 }, (_, index) => ({
      id: `al-${index + 5}`,
      title: index % 2 === 0 ? "Compliance reminder" : "Booking starting tomorrow",
      description: "Generated from the seed dataset.",
      type: (index % 2 === 0 ? "system" : "booking") as SeedAlarm["type"],
      priority: (index % 3 === 0 ? "medium" : "low") as SeedAlarm["priority"],
      status: (index % 4 === 0 ? "resolved" : "active") as SeedAlarm["status"],
      date: toIsoDate(subDays(now, index + 1)),
    })),
  ];
}

export function generateNotes(
  now: Date,
  consultants: SeedConsultant[],
  teachers: SeedTeacher[],
  schools: SeedSchool[],
): SeedNote[] {
  const author = consultants[0]?.name ?? "Alex Patel";
  const notes: SeedNote[] = [];
  for (const teacher of teachers.slice(0, 12)) {
    notes.push({
      id: `note-t-${teacher.id}`,
      entityId: teacher.id,
      entityType: "teacher",
      content: teacher.missingReference
        ? "Second professional reference still outstanding — do not book."
        : teacher.dbsExpired
          ? "DBS has expired. Compliance hold."
          : `${teacher.name} is reliable on this desk.`,
      createdAt: subDays(now, 4).toISOString(),
      createdByName: author,
    });
  }
  for (const school of schools.slice(0, 10)) {
    notes.push({
      id: `note-s-${school.id}`,
      entityId: school.id,
      entityType: "school",
      content: school.dormant
        ? "Regular last half-term; nothing booked recently."
        : school.slowTimesheets
          ? "Habitually slow to approve timesheets — chase on Tuesday."
          : `Office prefers email. ${school.contactName} is the usual contact.`,
      createdAt: subDays(now, 6).toISOString(),
      createdByName: author,
    });
  }
  return notes;
}

export function generateAvailability(
  currentWeek: PayWeek,
  teachers: SeedTeacher[],
  bookings: SeedBooking[],
): SeedAvailabilityTeacher[] {
  const hours = { start: "08:30", end: "15:30" };
  return teachers.filter((t) => t.status === "active").map((teacher) => {
    const jobGroup =
      teacher.role === "cover_supervisor"
        ? "cover_supervisor"
        : teacher.role === "supply_teacher"
          ? "teacher"
          : "ta";
    const days = [0, 1, 2, 3, 4].map((offset) => {
      const date = new Date(currentWeek.startsOn);
      date.setDate(date.getDate() + offset);
      const iso = toIsoDate(date);
      const booked = bookings.some(
        (b) =>
          b.teacherId === teacher.id &&
          b.days.some((d) => d.date === iso && !d.cancelled),
      );
      if (teacher.id === IDS.teachers.noref) {
        return { status: "off" as const };
      }
      if (booked) return { status: "booked" as const, ...hours };
      return { status: "available" as const, ...hours };
    });
    return {
      id: teacher.id,
      name: teacher.name,
      subject: teacher.subjects[0] ?? "Primary",
      jobGroup,
      days,
    };
  });
}

export function unusedChance(rng: Rng): boolean {
  return chance(rng, 0.5);
}
