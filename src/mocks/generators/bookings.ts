import { addDays, addWeeks, format } from "date-fns";
import type { AcademicCalendar } from "@/lib/academicCalendar";
import { isBookableDay } from "@/lib/academicCalendar";
import { lastCompletedHalfTerm } from "@/lib/terms";
import { parseIsoDate, payWeekContaining, toIsoDate } from "@/lib/payWeek";
import type { PayWeek } from "@/types/payroll";
import { IDS, VOLUME, type SeedScenario } from "../constants";
import { REGION_RATE } from "../data/postcodes";
import { RATE_BANDS, type StaffRole } from "../data/roles";
import { PRIMARY_KEY_STAGES, SECONDARY_SUBJECTS } from "../data/subjects";
import { chance, int, pick, round2, type Rng } from "../rng";
import type { SeedBooking, SeedBookingDay, SeedConsultant, SeedSchool, SeedTeacher } from "../types";

function iso(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function weekdays(week: PayWeek, calendar: AcademicCalendar): string[] {
  const monday = parseIsoDate(week.startsOn);
  const days: string[] = [];
  for (let i = 0; i < 5; i += 1) {
    const date = addDays(monday, i);
    if (isBookableDay(date, calendar)) days.push(iso(date));
  }
  return days;
}

function scaleForScenario(scenario: SeedScenario, isCurrentWeek: boolean): number {
  if (scenario === "quiet") return 0.38;
  if (scenario === "busy" && isCurrentWeek) return 1.85;
  return 1;
}

function ratesFor(
  rng: Rng,
  teacher: SeedTeacher,
  school: SeedSchool,
  longTerm: boolean,
  opts?: { forceThin?: boolean; forceFat?: boolean; forceNegative?: boolean },
): { pay: number; charge: number } {
  const band = longTerm ? RATE_BANDS.long_term : RATE_BANDS[teacher.role];
  const mul = REGION_RATE[school.area];
  let pay = teacher.payRate ?? round2(band.pay[0] + rng() * (band.pay[1] - band.pay[0]));
  pay = round2(pay * mul.pay);
  let charge =
    teacher.chargeRate ?? round2(band.charge[0] + rng() * (band.charge[1] - band.charge[0]));
  charge = round2(charge * mul.charge);
  if (opts?.forceNegative) {
    charge = round2(pay - 12 - rng() * 18);
  } else if (opts?.forceThin || school.thinMargin) {
    charge = round2(pay + 8 + rng() * 6);
  } else if (opts?.forceFat) {
    charge = round2(pay + 55 + rng() * 25);
  } else if (charge <= pay) {
    charge = round2(pay + 20);
  }
  return { pay, charge };
}

function subjectFor(teacher: SeedTeacher, school: SeedSchool, rng: Rng): { subject: string; keyStage: string | null } {
  const secondary = school.phase === "secondary" || school.phase === "sixth_form";
  if (secondary) {
    const subject =
      teacher.subjects.find((item) => (SECONDARY_SUBJECTS as readonly string[]).includes(item)) ??
      pick(rng, SECONDARY_SUBJECTS);
    return { subject, keyStage: null };
  }
  const keyStage = teacher.keyStages[0] ?? pick(rng, PRIMARY_KEY_STAGES);
  return { subject: keyStage, keyStage };
}

function durationLabel(days: SeedBookingDay[]): string {
  const units = days.filter((d) => !d.cancelled).reduce((sum, d) => sum + d.units, 0);
  if (units === 0.5) return "Half day";
  if (units <= 1) return "1 day";
  if (units < 5) return `${units} days`;
  const weeks = Math.round((units / 5) * 10) / 10;
  return weeks >= 2 ? `${weeks} weeks` : `${units} days`;
}

function makeBooking(input: {
  id: string;
  seq: number;
  teacher: SeedTeacher;
  school: SeedSchool;
  consultantId: string;
  days: SeedBookingDay[];
  payRate: number;
  chargeRate: number;
  longTerm?: boolean;
  notes?: string;
  status?: SeedBooking["status"];
  role?: StaffRole;
  rng: Rng;
}): SeedBooking {
  const live = input.days.filter((d) => !d.cancelled);
  const start = (live[0] ?? input.days[0])!.date;
  const end = (live.at(-1) ?? input.days.at(-1))!.date;
  const cancelled = live.length === 0;
  const { subject, keyStage } = subjectFor(input.teacher, input.school, input.rng);
  const allPast = end < iso(new Date());
  return {
    id: input.id,
    reference: `TB-${String(input.seq).padStart(5, "0")}`,
    teacherId: input.teacher.id,
    schoolId: input.school.id,
    consultantId: input.consultantId,
    role: input.role ?? input.teacher.role,
    subject,
    keyStage,
    startDate: start,
    endDate: end,
    days: input.days,
    payRate: input.payRate,
    chargeRate: input.chargeRate,
    status: input.status ?? (cancelled ? "cancelled" : allPast ? "completed" : "confirmed"),
    longTerm: Boolean(input.longTerm),
    notes: input.notes ?? durationLabel(input.days),
  };
}

function consecutiveDays(dates: string[], count: number, rng: Rng): string[] {
  if (dates.length === 0) return [];
  const start = int(rng, 0, Math.max(0, dates.length - 1));
  const slice: string[] = [];
  for (let i = 0; i < count && start + i < dates.length; i += 1) {
    slice.push(dates[start + i]!);
  }
  return slice.length > 0 ? slice : [dates[0]!];
}

export function generateBookings(input: {
  rng: Rng;
  now: Date;
  scenario: SeedScenario;
  calendar: AcademicCalendar;
  weeks: PayWeek[];
  emptyWeek: PayWeek;
  teachers: SeedTeacher[];
  schools: SeedSchool[];
  consultants: SeedConsultant[];
}): SeedBooking[] {
  const { rng, now, scenario, calendar, weeks, emptyWeek, teachers, schools, consultants } = input;
  const desks = consultants.filter((c) => c.role === "consultant");
  const bookableTeachers = teachers.filter((t) => !t.blockedFromBookings);
  const activeSchools = schools.filter((s) => !s.dormant);
  const dormant = schools.find((s) => s.id === IDS.schools.meadowbank)!;
  const bookings: SeedBooking[] = [];
  let seq = 1;

  const todayIso = iso(now);
  const currentWeek = weeks[0]!;
  const occupied = new Set<string>();
  const keyFor = (teacherId: string, date: string) => `${teacherId}|${date}`;

  const push = (booking: SeedBooking) => {
    for (const day of booking.days) {
      if (!day.cancelled) occupied.add(keyFor(booking.teacherId, day.date));
    }
    bookings.push(booking);
    seq += 1;
  };

  const teacherById = new Map(teachers.map((t) => [t.id, t]));
  const schoolById = new Map(schools.map((s) => [s.id, s]));

  const addSpan = (
    teacher: SeedTeacher,
    school: SeedSchool,
    consultantId: string,
    dates: string[],
    opts?: {
      units?: number;
      cancelled?: boolean;
      sameMorning?: boolean;
      earlyFinish?: boolean;
      longTerm?: boolean;
      forceThin?: boolean;
      forceFat?: boolean;
      forceNegative?: boolean;
      notes?: string;
      status?: SeedBooking["status"];
      id?: string;
    },
  ): SeedBooking | null => {
    const free = dates.filter((date) => !occupied.has(keyFor(teacher.id, date)));
    if (free.length === 0) return null;
    const units = opts?.units ?? 1;
    const days: SeedBookingDay[] = free.map((date) => ({
      date,
      units: opts?.earlyFinish ? 0.5 : units,
      cancelled: Boolean(opts?.cancelled),
      sameMorningCancel: opts?.sameMorning,
      earlyFinish: opts?.earlyFinish,
      cancelReason: opts?.sameMorning
        ? "Same-morning cancellation — class collapsed"
        : opts?.cancelled
          ? "School cancelled"
          : undefined,
    }));
    const { pay, charge } = ratesFor(rng, teacher, school, Boolean(opts?.longTerm), opts);
    const booking = makeBooking({
      id: opts?.id ?? `bk-${String(seq).padStart(5, "0")}`,
      seq,
      teacher,
      school,
      consultantId,
      days,
      payRate: pay,
      chargeRate: charge,
      longTerm: opts?.longTerm,
      notes: opts?.notes,
      status: opts?.status,
      rng,
    });
    push(booking);
    return booking;
  };

  const historyWeeks = weeks.slice(0, VOLUME.historyWeeks + VOLUME.extraHistoryWeeks);
  const awrSchool = schoolById.get(IDS.schools.stmarys)!;
  const oakridge = schoolById.get(IDS.schools.oakridge)!;
  const westfield = schoolById.get(IDS.schools.westfield)!;
  const harbour = schoolById.get(IDS.schools.harbour)!;
  const greenfield = schoolById.get(IDS.schools.greenfield)!;
  const thin = schoolById.get(IDS.schools.thin)!;
  const drop = schoolById.get(IDS.schools.drop)!;

  const weeksBack = (count: number, school: SeedSchool, teacher: SeedTeacher, consultantId: string, extra?: Parameters<typeof addSpan>[4]) => {
    for (const week of historyWeeks.slice(0, count)) {
      if (week.id === emptyWeek.id) continue;
      const dates = weekdays(week, calendar);
      if (dates.length === 0) continue;
      addSpan(teacher, school, consultantId, dates, extra);
    }
  };

  weeksBack(4, oakridge, teacherById.get(IDS.teachers.awr4)!, IDS.consultants.alex);
  weeksBack(10, awrSchool, teacherById.get(IDS.teachers.sarah)!, IDS.consultants.alex);
  weeksBack(11, harbour, teacherById.get(IDS.teachers.awr11)!, IDS.consultants.jordan);
  weeksBack(12, greenfield, teacherById.get(IDS.teachers.awr12)!, IDS.consultants.sam, {
    longTerm: true,
    notes: "AWR week 12 — moved to parity pay",
  });
  weeksBack(13, oakridge, teacherById.get(IDS.teachers.awr13)!, IDS.consultants.fatima, { longTerm: true });

  const breakTeacher = teacherById.get(IDS.teachers.awrBreak)!;
  for (const [index, week] of historyWeeks.entries()) {
    if (week.id === emptyWeek.id) continue;
    const dates = weekdays(week, calendar);
    if (dates.length === 0) continue;
    if (index >= 4 && index <= 6) continue;
    if (index > 10) continue;
    addSpan(breakTeacher, westfield, IDS.consultants.owen, dates, {
      notes: index <= 3 ? "Current assignment after break in service" : "Earlier assignment — clock later reset",
    });
  }

  const longTermTeacher = teacherById.get(IDS.teachers.longterm)!;
  let longTermBooking: SeedBooking | null = null;
  const longDays: SeedBookingDay[] = [];
  for (const week of historyWeeks.slice(0, 14)) {
    if (week.id === emptyWeek.id) continue;
    for (const date of weekdays(week, calendar)) {
      longDays.push({ date, units: 1, cancelled: false });
    }
  }
  if (longDays.length > 0) {
    const { pay, charge } = ratesFor(rng, longTermTeacher, oakridge, true);
    longTermBooking = makeBooking({
      id: "bk-longterm-14",
      seq,
      teacher: longTermTeacher,
      school: oakridge,
      consultantId: IDS.consultants.amara,
      days: longDays,
      payRate: pay,
      chargeRate: charge,
      longTerm: true,
      notes: "Long-term cover — 14 weeks",
      rng,
    });
    push(longTermBooking);
  }

  const half = lastCompletedHalfTerm(todayIso);
  if (half) {
    const dormantTeacher = teacherById.get(IDS.teachers.tom)!;
    let cursor = parseIsoDate(half.startsOn);
    const end = parseIsoDate(half.endsOn);
    while (cursor <= end) {
      const week = payWeekContaining(cursor);
      if (week.id !== emptyWeek.id) {
        const dates = weekdays(week, calendar);
        if (dates.length > 0) {
          addSpan(dormantTeacher, dormant, IDS.consultants.sam, dates.slice(0, 4), {
            notes: "Last half-term — school now dormant",
          });
        }
      }
      cursor = addWeeks(cursor, 1);
    }
  }

  for (const week of weeks.filter((w) => w.id !== emptyWeek.id)) {
    const dates = weekdays(week, calendar);
    if (dates.length === 0) continue;
    const teacher = pick(rng, bookableTeachers);
    addSpan(teacher, thin, teacher.consultantId, dates.slice(0, Math.min(4, dates.length)), {
      forceThin: true,
    });
    const dropTeacher = pick(rng, bookableTeachers);
    const recent = weeks.indexOf(week) <= 2;
    addSpan(dropTeacher, drop, dropTeacher.consultantId, dates.slice(0, 3), {
      forceThin: recent,
      forceFat: !recent,
    });
  }

  const currentDates = weekdays(currentWeek, calendar);
  const fallbackDates =
    currentDates.length > 0
      ? currentDates
      : weekdays(weeks.find((w) => w.id !== emptyWeek.id && weekdays(w, calendar).length > 0) ?? currentWeek, calendar);

  const john = teacherById.get(IDS.teachers.john)!;
  const sarah = teacherById.get(IDS.teachers.sarah)!;
  const michael = teacherById.get(IDS.teachers.michael)!;
  const priya = teacherById.get(IDS.teachers.priya)!;
  const emily = teacherById.get(IDS.teachers.emily)!;
  const nina = teacherById.get(IDS.teachers.nina)!;
  const james = teacherById.get(IDS.teachers.james)!;
  const aisha = teacherById.get(IDS.teachers.aisha)!;
  const lisa = teacherById.get(IDS.teachers.lisa)!;
  const nora = teacherById.get(IDS.teachers.nora)!;

  addSpan(john, westfield, IDS.consultants.alex, fallbackDates.slice(0, 5), { notes: "Day-to-day Maths cover" });
  addSpan(sarah, awrSchool, IDS.consultants.alex, fallbackDates.slice(0, 4));
  const michaelBooking = addSpan(michael, oakridge, IDS.consultants.jordan, fallbackDates.slice(0, 5), {
    units: 1,
    notes: "Includes a half-day Tuesday",
  });
  if (michaelBooking?.days[1] && !michaelBooking.days[1].cancelled) {
    michaelBooking.days[1] = { ...michaelBooking.days[1], units: 0.5, earlyFinish: true };
  }
  addSpan(priya, harbour, IDS.consultants.jordan, fallbackDates.slice(0, 3));
  addSpan(nina, greenfield, IDS.consultants.sam, fallbackDates.slice(0, 5));
  addSpan(james, harbour, IDS.consultants.jordan, fallbackDates.slice(0, 3));
  addSpan(emily, greenfield, IDS.consultants.sam, fallbackDates.slice(0, 3));
  const tomCurrent = teacherById.get(IDS.teachers.tom)!;
  addSpan(tomCurrent, dormant, IDS.consultants.alex, fallbackDates.slice(0, 2), {
    notes: "Gap booking used by the ready-to-invoice tests",
  });
  addSpan(aisha, oakridge, IDS.consultants.alex, fallbackDates.slice(0, 2));
  addSpan(lisa, greenfield, IDS.consultants.alex, fallbackDates.slice(0, 3));
  addSpan(nora, oakridge, IDS.consultants.jordan, fallbackDates.slice(0, 2), {
    notes: "Pay rate missing on file",
  });

  const prevWeek = weeks[1];
  if (prevWeek) {
    const prevDates = weekdays(prevWeek, calendar);
    const tom = teacherById.get(IDS.teachers.tom)!;
    if (prevDates.length) addSpan(tom, westfield, IDS.consultants.sam, prevDates, { notes: "Overdue timesheet week" });
    if (prevDates.length) addSpan(aisha, westfield, IDS.consultants.jordan, prevDates);
  }
  const older = weeks[2];
  if (older) {
    const olderDates = weekdays(older, calendar);
    if (olderDates.length) addSpan(john, westfield, IDS.consultants.alex, olderDates);
  }

  const nextWeek = payWeekContaining(addWeeks(now, 1));
  const nextDates = weekdays(nextWeek, calendar);
  if (nextDates.length > 0) {
    addSpan(john, westfield, IDS.consultants.alex, nextDates.slice(0, 4), {
      status: "confirmed",
      notes: "Next week — already confirmed",
    });
    addSpan(michael, oakridge, IDS.consultants.jordan, nextDates.slice(0, 3), {
      status: "confirmed",
    });
    addSpan(priya, harbour, IDS.consultants.jordan, nextDates.slice(0, 5), {
      status: "confirmed",
    });
    addSpan(emily, greenfield, IDS.consultants.sam, nextDates.slice(0, 2), {
      status: "confirmed",
    });
  }

  const cancelDates = fallbackDates.slice(0, 1);
  const sameMorning = addSpan(pick(rng, bookableTeachers), westfield, IDS.consultants.alex, cancelDates, {
    cancelled: true,
    sameMorning: true,
    status: "cancelled",
    notes: "Same-morning cancellation",
    id: "bk-same-morning-cancel",
  });

  const negTeacher = teacherById.get(IDS.teachers.obrien)!;
  addSpan(negTeacher, thin, IDS.consultants.lee, fallbackDates.slice(0, 2), {
    forceNegative: true,
    notes: "Charge entered below pay — negative margin",
    id: "bk-negative-margin",
  });

  for (const week of weeks) {
    if (week.id === emptyWeek.id) continue;
    const dates = weekdays(week, calendar);
    if (dates.length === 0) continue;
    const isCurrent = week.id === currentWeek.id;
    const scale = scaleForScenario(scenario, isCurrent);
    const perConsultant = Math.max(1, Math.round(VOLUME.bookingsPerConsultantPerWeek * scale));

    for (const consultant of desks) {
      if (isCurrent && consultant.id === IDS.consultants.idle) continue;
      let made = 0;
      let guard = 0;
      while (made < perConsultant && guard < perConsultant * 8) {
        guard += 1;
        const teacher = pick(rng, bookableTeachers);
        if (teacher.id === IDS.teachers.wright && isCurrent) continue;
        const school = pick(rng, activeSchools);
        const length = chance(rng, 0.15) ? 1 : chance(rng, 0.35) ? 2 : chance(rng, 0.3) ? 3 : int(rng, 1, dates.length);
        const span = consecutiveDays(dates, length, rng);
        const half = chance(rng, 0.08);
        const early = chance(rng, 0.04);
        const cancelled = chance(rng, 0.05);
        const created = addSpan(teacher, school, consultant.id, span, {
          units: half ? 0.5 : 1,
          earlyFinish: early,
          cancelled,
          forceThin: school.thinMargin,
          forceFat: school.droppedMargin && weeks.indexOf(week) >= 6,
          forceNegative: false,
        });
        if (created) made += 1;
      }
    }
  }

  for (const teacher of teachers) {
    const last = bookings
      .filter((b) => b.teacherId === teacher.id && b.status !== "cancelled")
      .flatMap((b) => b.days)
      .filter((d) => !d.cancelled)
      .map((d) => d.date)
      .sort()
      .at(-1);
    teacher.lastBookingDate = last ?? null;
  }

  void sameMorning;
  void durationLabel;
  void addWeeks;
  void now;

  return bookings;
}

export function bookingListDuration(booking: SeedBooking): string {
  return durationLabel(booking.days);
}
