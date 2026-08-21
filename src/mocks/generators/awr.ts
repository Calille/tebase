import { addWeeks } from "date-fns";
import { parseIsoDate, toIsoDate } from "@/lib/payWeek";
import type { TeacherWithAWR } from "@/types/awr";
import { IDS } from "../constants";
import type { SeedBooking, SeedSchool, SeedTeacher } from "../types";
import type { Teacher } from "@/services/teacherService";

function weeksAtSchool(
  bookings: SeedBooking[],
  teacherId: string,
  schoolId: string,
): { weeks: number; start: string | null; daysThisWeek: number } {
  const dates = bookings
    .filter((b) => b.teacherId === teacherId && b.schoolId === schoolId)
    .flatMap((b) => b.days.filter((d) => !d.cancelled).map((d) => d.date))
    .sort();
  if (dates.length === 0) return { weeks: 0, start: null, daysThisWeek: 0 };
  const uniqueWeeks = new Set(dates.map((d) => toIsoDate(parseIsoDate(d))));
  const weekKeys = new Set(
    dates.map((iso) => {
      const date = parseIsoDate(iso);
      const day = date.getDay();
      const monday = new Date(date);
      monday.setDate(date.getDate() - ((day + 6) % 7));
      return toIsoDate(monday);
    }),
  );
  const lastWeek = [...weekKeys].sort().at(-1);
  const daysThisWeek = dates.filter((d) => {
    const date = parseIsoDate(d);
    const day = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((day + 6) % 7));
    return toIsoDate(monday) === lastWeek;
  }).length;
  return { weeks: weekKeys.size, start: dates[0] ?? null, daysThisWeek };
}

export function generateAwrTeachers(input: {
  teachers: SeedTeacher[];
  schools: SeedSchool[];
  bookings: SeedBooking[];
  teacherProfiles: Teacher[];
}): TeacherWithAWR[] {
  const { teachers, schools, bookings, teacherProfiles } = input;
  const schoolById = new Map(schools.map((s) => [s.id, s]));
  const profileById = new Map(teacherProfiles.map((t) => [t.id, t]));

  const assignments: { teacherId: string; schoolId: string; forceWeeks?: number }[] = [
    { teacherId: IDS.teachers.sarah, schoolId: IDS.schools.stmarys, forceWeeks: 10 },
    { teacherId: IDS.teachers.awr4, schoolId: IDS.schools.oakridge, forceWeeks: 4 },
    { teacherId: IDS.teachers.awr11, schoolId: IDS.schools.harbour, forceWeeks: 11 },
    { teacherId: IDS.teachers.awr12, schoolId: IDS.schools.greenfield, forceWeeks: 12 },
    { teacherId: IDS.teachers.awr13, schoolId: IDS.schools.oakridge, forceWeeks: 13 },
    { teacherId: IDS.teachers.awrBreak, schoolId: IDS.schools.westfield },
    { teacherId: IDS.teachers.longterm, schoolId: IDS.schools.oakridge, forceWeeks: 14 },
    { teacherId: IDS.teachers.john, schoolId: IDS.schools.westfield },
  ];

  const seen = new Set<string>();
  const result: TeacherWithAWR[] = [];

  for (const assignment of assignments) {
    const teacher = teachers.find((t) => t.id === assignment.teacherId);
    const profile = profileById.get(assignment.teacherId);
    const school = schoolById.get(assignment.schoolId);
    if (!teacher || !profile || !school) continue;
    const stats = weeksAtSchool(bookings, assignment.teacherId, assignment.schoolId);
    let weeks = assignment.forceWeeks ?? stats.weeks;
    if (assignment.teacherId === IDS.teachers.awrBreak) {
      weeks = 4;
    }
    let awrStatus: TeacherWithAWR["awrStatus"] = "not-applicable";
    if (weeks >= 12) awrStatus = "qualified";
    else if (weeks >= 10) awrStatus = "approaching";
    else if (weeks > 0) awrStatus = "tracking";
    const start = stats.start ?? toIsoDate(addWeeks(new Date(), -weeks));
    const qual =
      weeks >= 12
        ? toIsoDate(addWeeks(parseIsoDate(start), 12))
        : undefined;
    result.push({
      ...profile,
      awrStatus,
      awrWeeks: weeks,
      awrDays: stats.daysThisWeek,
      currentSchool: school.name,
      currentSchoolId: school.id,
      assignmentStartDate: start,
      awrQualificationDate: qual,
      awrNotificationSent: weeks >= 10,
      pauseReason: undefined,
      awrHistory: [
        {
          schoolId: school.id,
          schoolName: school.name,
          startDate: start,
          weeksCompleted: weeks,
          status: awrStatus,
          notes:
            assignment.teacherId === IDS.teachers.awrBreak
              ? "Break in service of 3 weeks reset the AWR clock"
              : weeks >= 12
                ? "Moved to parity pay at week 12"
                : "Continuous assignment",
        },
      ],
    });
    seen.add(teacher.id);
  }

  for (const profile of teacherProfiles) {
    if (seen.has(profile.id)) continue;
    result.push({
      ...profile,
      awrStatus: "not-applicable",
      awrWeeks: 0,
      awrDays: 0,
      awrHistory: [],
    });
  }

  return result;
}
