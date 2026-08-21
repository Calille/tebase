import { addWeeks } from "date-fns";
import { buildAcademicCalendar } from "@/lib/academicCalendar";
import { listPayWeeks, payWeekContaining, parseIsoDate } from "@/lib/payWeek";
import { DEFAULT_SEED, IDS, VOLUME, type SeedScenario } from "./constants";
import { mulberry32 } from "./rng";
import type { SeedConfig, SeedDataset, SeedEdgeCases } from "./types";
import { generateOrgPeople, generateTeachers } from "./generators/people";
import { generateBillTos, generateSchools } from "./generators/organisations";
import { generateBookings } from "./generators/bookings";
import { generateTimesheets } from "./generators/timesheets";
import { generatePayroll } from "./generators/payroll";
import { generateWeeklyReports } from "./generators/weeklyReport";
import { generateAwrTeachers } from "./generators/awr";
import { generateAgedDebt } from "./generators/xero";
import {
  generateAlarms,
  generateAvailability,
  generateComplaints,
  generateNotes,
  generateVacancies,
} from "./generators/extras";
import { toListBooking, toSchoolProfile, toTeacherProfile } from "./generators/adapt";

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
}

export function buildDataset(config: SeedConfig): SeedDataset {
  const now = startOfLocalDay(config.now);
  const rng = mulberry32(config.seed);
  const calendar = buildAcademicCalendar(now);
  const weeks = listPayWeeks(now, VOLUME.historyWeeks + VOLUME.extraHistoryWeeks);
  const emptyWeek =
    weeks[Math.min(VOLUME.emptyWeekOffset, weeks.length - 1)] ?? weeks[weeks.length - 1]!;

  const { teams, consultants } = generateOrgPeople(rng);
  const teachers = generateTeachers(rng, consultants, now);
  const schools = generateSchools(rng);
  const billTos = generateBillTos(schools);
  const bookings = generateBookings({
    rng,
    now,
    scenario: config.scenario,
    calendar,
    weeks,
    emptyWeek,
    teachers,
    schools,
    consultants,
  });
  const timesheets = generateTimesheets({
    now,
    scenario: config.scenario,
    weeks,
    bookings,
    teachers,
    schools,
    consultants,
  });
  const payrollByPeriod = generatePayroll({
    weeks,
    timesheets,
    teachers,
    schools,
    consultants,
  });
  const teacherProfiles = teachers.map(toTeacherProfile);
  const schoolProfiles = schools.map((school) =>
    toSchoolProfile(school, now.toISOString().slice(0, 10)),
  );
  const awrTeachers = generateAwrTeachers({
    teachers,
    schools,
    bookings,
    teacherProfiles,
  });
  const weeklyReports = generateWeeklyReports({
    weeks,
    bookings,
    timesheets,
    teachers,
    schools,
    consultants,
    awrTeachers,
  });
  const agedDebt = generateAgedDebt({ now, billTos, weeks });
  const vacancies = generateVacancies(rng, now, schools);
  const complaints = generateComplaints(rng, now, schools, teachers);
  const alarms = generateAlarms(now, teachers, schools);
  const notes = generateNotes(now, consultants, teachers, schools);
  const availability = generateAvailability(weeks[0]!, teachers, bookings);
  const listBookings = bookings.map((booking) => toListBooking(booking, teachers, schools));

  const operating =
    weeks.find((week) =>
      bookings.some((booking) =>
        booking.days.some(
          (day) => !day.cancelled && day.date >= week.startsOn && day.date <= week.weekEnding,
        ),
      ),
    ) ?? weeks[0]!;

  const edgeCases: SeedEdgeCases = {
    negativeMarginBookingId: "bk-negative-margin",
    thinMarginSchoolId: IDS.schools.thin,
    droppedMarginSchoolId: IDS.schools.drop,
    idleConsultantId: IDS.consultants.idle,
    emptyWeekStart: emptyWeek.startsOn,
    longSchoolNameId: IDS.schools.long,
    longTeacherNameId: IDS.teachers.long,
    specialCharTeacherIds: [IDS.teachers.obrien, IDS.teachers.ni],
    expiredDbsTeacherId: IDS.teachers.dbs,
    missingRefTeacherId: IDS.teachers.noref,
    dormantSchoolId: IDS.schools.meadowbank,
    longTermBookingId: "bk-longterm-14",
    sameMorningCancelBookingId: "bk-same-morning-cancel",
    unmappedBillToId: IDS.billTos.harbour,
    poRequiredBillToId: IDS.billTos.keepTrust,
    consolidatedTrustBillToId: IDS.billTos.keepTrust,
    awr: {
      week4: IDS.teachers.awr4,
      week10: IDS.teachers.sarah,
      week11: IDS.teachers.awr11,
      week12: IDS.teachers.awr12,
      week13: IDS.teachers.awr13,
      breakInService: IDS.teachers.awrBreak,
    },
    timesheets: {
      freshOutstanding: IDS.timesheets.unapp1,
      overdue: IDS.timesheets.overdue1,
      approved: IDS.timesheets.ok1,
      openQuery: IDS.timesheets.unapp3,
      queryWithAmendment: IDS.timesheets.unapp2,
      resolvedThenApproved: IDS.timesheets.prevApproved,
      inset: IDS.timesheets.inset1,
      draftLate: IDS.timesheets.draftLate,
    },
    invoices: {
      aged90: "xero-inv-90plus",
      paid: "xero-inv-paid",
      partPaid: "xero-inv-part",
      dispute: "xero-inv-dispute",
    },
  };

  return {
    config: { ...config, now },
    generatedAt: now.toISOString(),
    calendar,
    weeks,
    operatingWeek: operating,
    emptyWeek,
    teams,
    consultants,
    teachers,
    schools,
    billTos,
    bookings,
    timesheets,
    payrollByPeriod,
    weeklyReports,
    awrTeachers,
    agedDebt,
    xeroPushes: [],
    vacancies,
    complaints,
    alarms,
    notes,
    availability,
    teacherProfiles,
    schoolProfiles,
    listBookings,
    edgeCases,
  };
}

export function defaultConfig(now = new Date(), seed = DEFAULT_SEED, scenario: SeedScenario = "default"): SeedConfig {
  return { now: startOfLocalDay(now), seed, scenario };
}

void addWeeks;
void payWeekContaining;
void parseIsoDate;
