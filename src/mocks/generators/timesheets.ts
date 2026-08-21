import { addDays, subDays } from "date-fns";
import { parseIsoDate, payWeekContaining, toIsoDate } from "@/lib/payWeek";
import type { PayWeek } from "@/types/payroll";
import type { PartyRef } from "@/types/party";
import {
  type RatePeriod,
  type TeacherRole,
  type Timesheet,
  type TimesheetQuery,
  type TimesheetStatus,
  type TimesheetTransition,
  type WorkedDay,
} from "@/types/timesheet";
import { computeChargeTotal } from "@/types/payroll";
import {
  chargeFromWorkedDays,
  defaultRateSchedule,
  generateWorkedDays,
} from "@/services/timesheets/workedDays";
import { IDS, type SeedScenario } from "../constants";
import { toTimesheetRole } from "../data/roles";
import type { SeedBooking, SeedConsultant, SeedSchool, SeedTeacher } from "../types";

const SYSTEM: PartyRef = { id: "system", name: "Tebase" };
const SCHOOL_USER = (school: PartyRef): PartyRef => ({
  id: `portal-${school.id}`,
  name: `${school.name} office`,
});

function hoursFromDays(days: number): number {
  return Math.round(days * 6.5 * 10) / 10;
}

function transition(
  id: string,
  from: TimesheetStatus | null,
  to: TimesheetStatus,
  at: string,
  actor: PartyRef,
  extra?: Partial<TimesheetTransition>,
): TimesheetTransition {
  return { id, from, to, at, actor, ...extra };
}

function makeSheet(input: {
  id: string;
  periodId: string;
  status: TimesheetStatus;
  teacher: PartyRef;
  school: PartyRef;
  consultant: PartyRef;
  days: number;
  cost: { payRate: number | null; chargeRate: number | null };
  sentAt?: string | null;
  viewedAt?: string | null;
  approvedAt?: string | null;
  approverName?: string | null;
  lastChasedAt?: string | null;
  chaseCount?: number;
  holidayOrInset?: boolean;
  holidayLabel?: string;
  hasBookings?: boolean;
  confirmedDays?: number | null;
  query?: TimesheetQuery | null;
  history: TimesheetTransition[];
  workedDays?: WorkedDay[];
  rateSchedule?: RatePeriod[];
  role?: TeacherRole;
  invoiced?: boolean;
  xeroInvoiceId?: string | null;
  bookingId?: string;
}): Timesheet {
  const expectedHours = hoursFromDays(input.days);
  const confirmedDays = input.confirmedDays ?? null;
  const confirmedHours =
    confirmedDays == null ? null : hoursFromDays(confirmedDays);
  const role = input.role ?? "supply_teacher";
  const workedDays =
    input.workedDays ??
    generateWorkedDays(input.periodId, confirmedDays ?? input.days, role);
  const rateSchedule =
    input.rateSchedule ??
    defaultRateSchedule(input.periodId, input.cost.chargeRate);
  const units = confirmedDays ?? input.days;
  const fromDates = chargeFromWorkedDays(
    workedDays,
    rateSchedule,
    input.cost.chargeRate,
  );
  return {
    id: input.id,
    periodId: input.periodId,
    bookingId: input.bookingId ?? `bk-${input.id}`,
    school: input.school,
    teacher: input.teacher,
    consultant: input.consultant,
    status: input.status,
    expectedHours,
    expectedDays: input.days,
    confirmedHours,
    confirmedDays,
    cost: input.cost,
    chargeValue: workedDays.length > 0 ? fromDates : computeChargeTotal(input.cost, units),
    sentAt: input.sentAt ?? null,
    viewedAt: input.viewedAt ?? null,
    approvedAt: input.approvedAt ?? null,
    approverName: input.approverName ?? null,
    lastChasedAt: input.lastChasedAt ?? null,
    chaseCount: input.chaseCount ?? 0,
    holidayOrInset: input.holidayOrInset ?? false,
    holidayLabel: input.holidayLabel,
    hasBookings: input.hasBookings ?? true,
    query: input.query ?? null,
    history: input.history,
    workedDays,
    rateSchedule,
    invoiced: input.invoiced ?? false,
    xeroInvoiceId: input.xeroInvoiceId ?? null,
  };
}

function groupKey(teacherId: string, schoolId: string, periodId: string): string {
  return `${teacherId}|${schoolId}|${periodId}`;
}

export function generateTimesheets(input: {
  now: Date;
  scenario: SeedScenario;
  weeks: PayWeek[];
  bookings: SeedBooking[];
  teachers: SeedTeacher[];
  schools: SeedSchool[];
  consultants: SeedConsultant[];
}): Timesheet[] {
  const { now, scenario, weeks, bookings, teachers, schools, consultants } = input;
  const teacherById = new Map(teachers.map((t) => [t.id, t]));
  const schoolById = new Map(schools.map((s) => [s.id, s]));
  const consultantById = new Map(consultants.map((c) => [c.id, c]));
  const current = weeks[0]!;
  const previous = weeks[1] ?? current;
  const older = weeks[2] ?? previous;

  type Agg = {
    teacherId: string;
    schoolId: string;
    consultantId: string;
    periodId: string;
    units: number;
    pay: number;
    charge: number;
    bookingId: string;
    role: TeacherRole;
    worked: WorkedDay[];
    payNull: boolean;
  };

  const groups = new Map<string, Agg>();
  for (const booking of bookings) {
    for (const day of booking.days) {
      if (day.cancelled) continue;
      const periodId = payWeekContaining(parseIsoDate(day.date)).id;
      const key = groupKey(booking.teacherId, booking.schoolId, periodId);
      const existing = groups.get(key);
      const role = toTimesheetRole(booking.role);
      const teacher = teacherById.get(booking.teacherId);
      if (!existing) {
        groups.set(key, {
          teacherId: booking.teacherId,
          schoolId: booking.schoolId,
          consultantId: booking.consultantId,
          periodId,
          units: day.units,
          pay: booking.payRate,
          charge: booking.chargeRate,
          bookingId: booking.id,
          role,
          worked: [
            { date: day.date, units: day.units, unitType: "day", role },
          ],
          payNull: teacher?.payRate == null,
        });
      } else {
        existing.units = Math.round((existing.units + day.units) * 10) / 10;
        existing.worked.push({
          date: day.date,
          units: day.units,
          unitType: "day",
          role,
        });
      }
    }
  }

  const sheets: Timesheet[] = [];
  let seq = 1;
  const byPair = new Map<string, Timesheet>();

  for (const agg of groups.values()) {
    const teacher = teacherById.get(agg.teacherId);
    const school = schoolById.get(agg.schoolId);
    const consultant = consultantById.get(agg.consultantId);
    if (!teacher || !school || !consultant) continue;
    const weekIndex = weeks.findIndex((w) => w.id === agg.periodId);
    const teacherRef = { id: teacher.id, name: teacher.name };
    const schoolRef = { id: school.id, name: school.name };
    const consultantRef = { id: consultant.id, name: consultant.name };
    const payRate = agg.payNull ? null : agg.pay;

    let status: TimesheetStatus = "approved";
    let sentAt: string | null = subDays(now, Math.max(1, weekIndex * 7 + 2)).toISOString();
    let viewedAt: string | null = subDays(now, Math.max(0, weekIndex * 7)).toISOString();
    let approvedAt: string | null = viewedAt;
    let approverName: string | null = school.contactName;
    let confirmedDays: number | null = agg.units;
    let query: TimesheetQuery | null = null;
    const history: TimesheetTransition[] = [
      transition(`h-${seq}-1`, null, "draft", subDays(now, weekIndex * 7 + 3).toISOString(), SYSTEM),
      transition(`h-${seq}-2`, "draft", "sent", sentAt, SYSTEM),
    ];

    if (weekIndex === 0) {
      status = "sent";
      approvedAt = null;
      approverName = null;
      confirmedDays = null;
      viewedAt = null;
    } else if (school.slowTimesheets && weekIndex <= 4 && weekIndex > 0) {
      status = "overdue";
      sentAt = subDays(now, 11 + weekIndex).toISOString();
      viewedAt = null;
      approvedAt = null;
      approverName = null;
      confirmedDays = null;
      history.push(transition(`h-${seq}-o`, "sent", "overdue", subDays(now, 5).toISOString(), SYSTEM));
    } else if (weekIndex > 0) {
      history.push(
        transition(`h-${seq}-3`, "sent", "approved", approvedAt!, SCHOOL_USER(schoolRef), {
          approverName: school.contactName,
        }),
      );
    }

    if (scenario === "queries" && weekIndex <= 2 && weekIndex >= 0 && seq % 2 === 0) {
      status = "queried";
      confirmedDays = null;
      approvedAt = null;
      approverName = null;
      query = {
        id: `q-${seq}`,
        reason: "wrong_days",
        freeText: "Please check Thursday.",
        openedAt: subDays(now, 2).toISOString(),
        openedBy: SCHOOL_USER(schoolRef),
        messages: [
          {
            id: `q-${seq}-m1`,
            author: SCHOOL_USER(schoolRef),
            authorRole: "school",
            body: "Hours look high for Thursday.",
            at: subDays(now, 2).toISOString(),
          },
          {
            id: `q-${seq}-m2`,
            author: consultantRef,
            authorRole: "consultant",
            body: "I’ll look into it today.",
            at: subDays(now, 1).toISOString(),
          },
        ],
      };
    }

    const invoiced = weekIndex >= 2 && status === "approved";
    const sheet = makeSheet({
      id: `ts-${String(seq).padStart(4, "0")}`,
      periodId: agg.periodId,
      status,
      teacher: teacherRef,
      school: schoolRef,
      consultant: consultantRef,
      days: agg.units,
      cost: { payRate, chargeRate: agg.charge },
      sentAt,
      viewedAt,
      approvedAt,
      approverName,
      confirmedDays,
      query,
      history,
      workedDays: agg.worked,
      role: agg.role,
      invoiced,
      xeroInvoiceId: invoiced ? `xero-inv-${agg.periodId}-${seq}` : null,
      bookingId: agg.bookingId,
      holidayOrInset: false,
      hasBookings: agg.units > 0,
    });
    sheets.push(sheet);
    byPair.set(groupKey(agg.teacherId, agg.schoolId, agg.periodId), sheet);
    seq += 1;
  }

function toMakeSheet(sheet: Timesheet, patch: Partial<Parameters<typeof makeSheet>[0]> & { id: string }): Timesheet {
  return makeSheet({
    id: patch.id,
    periodId: sheet.periodId,
    status: patch.status ?? sheet.status,
    teacher: sheet.teacher,
    school: sheet.school,
    consultant: sheet.consultant,
    days: patch.days ?? sheet.expectedDays,
    cost: patch.cost ?? sheet.cost,
    sentAt: patch.sentAt === undefined ? sheet.sentAt : patch.sentAt,
    viewedAt: patch.viewedAt === undefined ? sheet.viewedAt : patch.viewedAt,
    approvedAt: patch.approvedAt === undefined ? sheet.approvedAt : patch.approvedAt,
    approverName: patch.approverName === undefined ? sheet.approverName : patch.approverName,
    lastChasedAt: patch.lastChasedAt === undefined ? sheet.lastChasedAt : patch.lastChasedAt,
    chaseCount: patch.chaseCount ?? sheet.chaseCount,
    holidayOrInset: patch.holidayOrInset ?? sheet.holidayOrInset,
    holidayLabel: patch.holidayLabel ?? sheet.holidayLabel,
    hasBookings: patch.hasBookings ?? sheet.hasBookings,
    confirmedDays: patch.confirmedDays === undefined ? sheet.confirmedDays : patch.confirmedDays,
    query: patch.query === undefined ? sheet.query : patch.query,
    history: patch.history ?? sheet.history,
    workedDays: patch.workedDays ?? sheet.workedDays,
    rateSchedule: patch.rateSchedule ?? sheet.rateSchedule,
    role: patch.role,
    invoiced: patch.invoiced ?? sheet.invoiced,
    xeroInvoiceId: patch.xeroInvoiceId === undefined ? sheet.xeroInvoiceId : patch.xeroInvoiceId,
    bookingId: sheet.bookingId,
  });
}

  const relabel = (
    teacherId: string,
    schoolId: string,
    periodId: string,
    id: string,
    patch: (sheet: Timesheet) => Timesheet,
  ) => {
    const key = groupKey(teacherId, schoolId, periodId);
    const existing = byPair.get(key);
    if (existing) {
      const next = patch(existing);
      const idx = sheets.findIndex((s) => s.id === existing.id);
      if (idx >= 0) sheets[idx] = next;
      byPair.set(key, next);
      return next;
    }
    return null;
  };

  const currentStarts = current.startsOn;
  const dayOn = (offset: number) => toIsoDate(addDays(parseIsoDate(currentStarts), offset));
  const fridaySend = (daysAgo: number) => subDays(now, daysAgo).toISOString();
  const alex = { id: IDS.consultants.alex, name: "Alex Patel" };

  relabel(IDS.teachers.john, IDS.schools.westfield, current.id, IDS.timesheets.unapp1, (sheet) =>
    toMakeSheet(sheet, {
      id: IDS.timesheets.unapp1,
      status: "sent",
      days: sheet.expectedDays || 5,
      cost: { payRate: 160, chargeRate: 210 },
      sentAt: fridaySend(1),
      viewedAt: null,
      approvedAt: null,
      approverName: null,
      confirmedDays: null,
      query: null,
      invoiced: false,
      xeroInvoiceId: null,
      history: [
        transition("h1", null, "draft", subDays(now, 1).toISOString(), SYSTEM),
        transition("h2", "draft", "sent", fridaySend(1), SYSTEM, {
          note: "Friday 10am send (stub)",
        }),
      ],
    }),
  );

  const sarahQuery: TimesheetQuery = {
    id: "q-sarah",
    reason: "wrong_hours",
    freeText: "Sarah left at lunch on Thursday — should be 3.5 days not 4.",
    openedAt: subDays(now, 2).toISOString(),
    openedBy: SCHOOL_USER({ id: IDS.schools.stmarys, name: "St Mary's Secondary" }),
    amendment: {
      originalHours: hoursFromDays(4),
      originalDays: 4,
      proposedHours: hoursFromDays(3.5),
      proposedDays: 3.5,
      status: "pending",
    },
    messages: [
      {
        id: "m1",
        author: SCHOOL_USER({ id: IDS.schools.stmarys, name: "St Mary's Secondary" }),
        authorRole: "school",
        body: "Sarah left at lunch on Thursday. Please amend to 3.5 days.",
        at: subDays(now, 2).toISOString(),
      },
      {
        id: "m2",
        author: alex,
        authorRole: "consultant",
        body: "Thanks — I’ll check with Sarah and confirm.",
        at: subDays(now, 1).toISOString(),
      },
    ],
  };

  relabel(IDS.teachers.sarah, IDS.schools.stmarys, current.id, IDS.timesheets.unapp2, (sheet) =>
    toMakeSheet(sheet, {
      id: IDS.timesheets.unapp2,
      status: "queried",
      days: 4,
      cost: { payRate: 155, chargeRate: 205 },
      sentAt: fridaySend(1),
      viewedAt: subDays(now, 2).toISOString(),
      query: sarahQuery,
      approvedAt: null,
      approverName: null,
      confirmedDays: null,
      invoiced: false,
      xeroInvoiceId: null,
      history: [
        transition("h3", null, "draft", subDays(now, 1).toISOString(), SYSTEM),
        transition("h4", "draft", "sent", fridaySend(1), SYSTEM),
        transition("h5", "sent", "viewed", subDays(now, 2).toISOString(), SCHOOL_USER(sheet.school)),
        transition("h6", "viewed", "queried", subDays(now, 2).toISOString(), SCHOOL_USER(sheet.school), {
          note: "Wrong hours",
        }),
      ],
    }),
  );

  relabel(IDS.teachers.priya, IDS.schools.harbour, current.id, IDS.timesheets.unapp3, (sheet) =>
    toMakeSheet(sheet, {
      id: IDS.timesheets.unapp3,
      status: "viewed",
      sentAt: fridaySend(1),
      viewedAt: subDays(now, 1).toISOString(),
      approvedAt: null,
      approverName: null,
      confirmedDays: null,
      invoiced: false,
      xeroInvoiceId: null,
      history: [
        transition("h7", null, "draft", subDays(now, 1).toISOString(), SYSTEM),
        transition("h8", "draft", "sent", fridaySend(1), SYSTEM),
        transition("h9", "sent", "viewed", subDays(now, 1).toISOString(), SCHOOL_USER(sheet.school)),
      ],
    }),
  );

  relabel(IDS.teachers.michael, IDS.schools.oakridge, current.id, IDS.timesheets.ok1, (sheet) =>
    toMakeSheet(sheet, {
      id: IDS.timesheets.ok1,
      status: "approved",
      days: 4.5,
      cost: { payRate: 170, chargeRate: 250 },
      sentAt: fridaySend(1),
      viewedAt: now.toISOString(),
      approvedAt: now.toISOString(),
      approverName: "Joanna Hale",
      confirmedDays: 4.5,
      role: "supply_teacher",
      invoiced: false,
      xeroInvoiceId: null,
      workedDays: [
        { date: dayOn(0), units: 1, unitType: "day", role: "supply_teacher" },
        { date: dayOn(1), units: 0.5, unitType: "day", role: "supply_teacher" },
        { date: dayOn(2), units: 1, unitType: "day", role: "supply_teacher" },
        { date: dayOn(3), units: 1, unitType: "day", role: "supply_teacher" },
        { date: dayOn(4), units: 1, unitType: "day", role: "supply_teacher" },
      ],
      rateSchedule: [
        { from: dayOn(0), to: dayOn(1), dayRate: 230 },
        { from: dayOn(2), to: current.id, dayRate: 250 },
      ],
      history: [
        transition("h10", null, "draft", subDays(now, 1).toISOString(), SYSTEM),
        transition("h11", "draft", "sent", fridaySend(1), SYSTEM),
        transition("h12", "sent", "viewed", now.toISOString(), SCHOOL_USER(sheet.school)),
        transition("h13", "viewed", "approved", now.toISOString(), SCHOOL_USER(sheet.school), {
          approverName: "Joanna Hale",
        }),
      ],
    }),
  );

  relabel(IDS.teachers.nina, IDS.schools.greenfield, current.id, IDS.timesheets.okGreenfield, (sheet) =>
    toMakeSheet(sheet, {
      id: IDS.timesheets.okGreenfield,
      status: "approved",
      days: 5,
      cost: { payRate: 110, chargeRate: 145 },
      sentAt: fridaySend(1),
      viewedAt: now.toISOString(),
      approvedAt: now.toISOString(),
      approverName: "Patrice Bell",
      confirmedDays: 5,
      role: "teaching_assistant",
      invoiced: false,
      xeroInvoiceId: null,
      history: [
        transition("h-nina-1", null, "draft", subDays(now, 1).toISOString(), SYSTEM),
        transition("h-nina-2", "draft", "sent", fridaySend(1), SYSTEM),
        transition("h-nina-3", "sent", "approved", now.toISOString(), SCHOOL_USER(sheet.school), {
          approverName: "Patrice Bell",
        }),
      ],
    }),
  );

  relabel(IDS.teachers.james, IDS.schools.harbour, current.id, IDS.timesheets.okHarbour, (sheet) => {
    const worked = (sheet.workedDays.length > 0
      ? sheet.workedDays
      : generateWorkedDays(sheet.periodId, sheet.expectedDays, "cover_supervisor")
    ).map((day, index) => (index === 0 ? { ...day, units: 0 } : day));
    return toMakeSheet(sheet, {
      id: IDS.timesheets.okHarbour,
      status: "approved",
      days: sheet.expectedDays || 3,
      cost: { payRate: 140, chargeRate: 185 },
      sentAt: fridaySend(1),
      viewedAt: now.toISOString(),
      approvedAt: now.toISOString(),
      approverName: "Chris Adey",
      confirmedDays: sheet.expectedDays || 3,
      role: "cover_supervisor",
      invoiced: false,
      xeroInvoiceId: null,
      workedDays: worked,
      history: [
        transition("h-james-1", null, "draft", subDays(now, 1).toISOString(), SYSTEM),
        transition("h-james-2", "draft", "sent", fridaySend(1), SYSTEM),
        transition("h-james-3", "sent", "approved", now.toISOString(), SCHOOL_USER(sheet.school), {
          approverName: "Chris Adey",
        }),
      ],
    });
  });

  relabel(IDS.teachers.emily, IDS.schools.greenfield, current.id, IDS.timesheets.sam1, (sheet) =>
    toMakeSheet(sheet, {
      id: IDS.timesheets.sam1,
      status: "sent",
      sentAt: fridaySend(1),
      viewedAt: null,
      approvedAt: null,
      approverName: null,
      confirmedDays: null,
      invoiced: false,
      xeroInvoiceId: null,
    }),
  );

  relabel(IDS.teachers.aisha, IDS.schools.oakridge, current.id, IDS.timesheets.draftLate, (sheet) =>
    toMakeSheet(sheet, {
      id: IDS.timesheets.draftLate,
      status: "draft",
      days: 2,
      cost: { payRate: 190, chargeRate: 240 },
      sentAt: null,
      viewedAt: null,
      approvedAt: null,
      approverName: null,
      confirmedDays: null,
      invoiced: false,
      xeroInvoiceId: null,
      history: [
        transition("h-draft-late", null, "draft", subDays(now, 1).toISOString(), SYSTEM, {
          note: "Missed the Friday send — send now",
        }),
      ],
    }),
  );

  const harbourSchool = { id: IDS.schools.harbour, name: "Harbour View High" };
  const david = teachers.find((t) => t.id === IDS.teachers.david)!;
  const jordan = consultants.find((c) => c.id === IDS.consultants.jordan)!;
  sheets.push(
    makeSheet({
      id: IDS.timesheets.inset1,
      periodId: current.id,
      status: "draft",
      teacher: { id: david.id, name: david.name },
      school: harbourSchool,
      consultant: { id: jordan.id, name: jordan.name },
      days: 0,
      cost: { payRate: 165, chargeRate: 215 },
      holidayOrInset: true,
      holidayLabel: "INSET day — whole week",
      hasBookings: false,
      history: [
        transition("h19", null, "draft", subDays(now, 1).toISOString(), SYSTEM, {
          note: "Not sent: no bookings / INSET",
        }),
      ],
    }),
  );

  relabel(IDS.teachers.tom, IDS.schools.westfield, previous.id, IDS.timesheets.overdue1, (sheet) =>
    toMakeSheet(sheet, {
      id: IDS.timesheets.overdue1,
      status: "overdue",
      days: sheet.expectedDays || 5,
      cost: { payRate: 180, chargeRate: 225 },
      sentAt: subDays(now, 11).toISOString(),
      lastChasedAt: subDays(now, 4).toISOString(),
      chaseCount: 2,
      viewedAt: null,
      approvedAt: null,
      approverName: null,
      confirmedDays: null,
      invoiced: false,
      xeroInvoiceId: null,
      history: [
        transition("h16", null, "draft", subDays(now, 13).toISOString(), SYSTEM),
        transition("h17", "draft", "sent", subDays(now, 11).toISOString(), SYSTEM),
        transition("h18", "sent", "overdue", subDays(now, 5).toISOString(), SYSTEM, {
          note: "Past chase threshold",
        }),
      ],
    }),
  );

  relabel(IDS.teachers.aisha, IDS.schools.westfield, previous.id, IDS.timesheets.prevApproved, (sheet) =>
    toMakeSheet(sheet, {
      id: IDS.timesheets.prevApproved,
      status: "approved",
      sentAt: subDays(now, 10).toISOString(),
      viewedAt: subDays(now, 3).toISOString(),
      approvedAt: subDays(now, 2).toISOString(),
      approverName: "Neil Cartwright",
      confirmedDays: sheet.expectedDays,
      invoiced: false,
      xeroInvoiceId: null,
      query: {
        id: "q-resolved",
        reason: "wrong_days",
        freeText: "Tuesday was a half day.",
        openedAt: subDays(now, 6).toISOString(),
        openedBy: SCHOOL_USER(sheet.school),
        resolvedAt: subDays(now, 3).toISOString(),
        resolvedBy: { id: IDS.consultants.jordan, name: "Jordan Blake" },
        resolutionNote: "Amended then approved",
        whatChanged: "Query resolved — school then approved",
        messages: [
          {
            id: "q-res-1",
            author: SCHOOL_USER(sheet.school),
            authorRole: "school",
            body: "Tuesday should be a half day.",
            at: subDays(now, 6).toISOString(),
          },
          {
            id: "q-res-2",
            author: { id: IDS.consultants.jordan, name: "Jordan Blake" },
            authorRole: "consultant",
            body: "Agreed — updated. Please approve.",
            at: subDays(now, 4).toISOString(),
          },
        ],
      },
      history: [
        transition("h20", "draft", "sent", subDays(now, 10).toISOString(), SYSTEM),
        transition("h21q", "sent", "queried", subDays(now, 6).toISOString(), SCHOOL_USER(sheet.school)),
        transition("h21r", "queried", "resolved", subDays(now, 3).toISOString(), {
          id: IDS.consultants.jordan,
          name: "Jordan Blake",
        }),
        transition("h21", "resolved", "approved", subDays(now, 2).toISOString(), SCHOOL_USER(sheet.school), {
          approverName: "Neil Cartwright",
        }),
      ],
    }),
  );

  const olderSlow = relabel(IDS.teachers.john, IDS.schools.westfield, older.id, IDS.timesheets.olderSlow, (sheet) =>
    toMakeSheet(sheet, {
      id: IDS.timesheets.olderSlow,
      status: "approved",
      sentAt: subDays(now, 18).toISOString(),
      approvedAt: subDays(now, 6).toISOString(),
      approverName: "Neil Cartwright",
      confirmedDays: sheet.expectedDays,
      invoiced: true,
      xeroInvoiceId: "xero-inv-demo-old",
      history: [
        transition("h22", "draft", "sent", subDays(now, 18).toISOString(), SYSTEM),
        transition("h23", "sent", "approved", subDays(now, 6).toISOString(), SCHOOL_USER(sheet.school), {
          approverName: "Neil Cartwright",
        }),
      ],
    }),
  );
  if (!olderSlow) {
    const candidate = sheets.find(
      (sheet) =>
        sheet.teacher.id === IDS.teachers.john &&
        sheet.school.id === IDS.schools.westfield &&
        sheet.periodId !== current.id,
    );
    if (candidate) {
      const next = toMakeSheet(candidate, {
        id: IDS.timesheets.olderSlow,
        status: "approved",
        sentAt: subDays(now, 18).toISOString(),
        approvedAt: subDays(now, 6).toISOString(),
        approverName: "Neil Cartwright",
        confirmedDays: candidate.expectedDays,
        invoiced: true,
        xeroInvoiceId: "xero-inv-demo-old",
        history: [
          transition("h22", "draft", "sent", subDays(now, 18).toISOString(), SYSTEM),
          transition("h23", "sent", "approved", subDays(now, 6).toISOString(), SCHOOL_USER(candidate.school), {
            approverName: "Neil Cartwright",
          }),
        ],
      });
      const idx = sheets.findIndex((item) => item.id === candidate.id);
      if (idx >= 0) sheets[idx] = next;
    }
  }

  const wright = teachers.find((t) => t.id === IDS.teachers.wright)!;
  const nora = teachers.find((t) => t.id === IDS.teachers.nora)!;
  const sam = consultants.find((c) => c.id === IDS.consultants.sam)!;
  sheets.push(
    makeSheet({
      id: "ts-wright-zero",
      periodId: current.id,
      status: "sent",
      teacher: { id: wright.id, name: wright.name },
      school: { id: IDS.schools.westfield, name: "Westfield Primary" },
      consultant: { id: sam.id, name: sam.name },
      days: 0,
      cost: { payRate: 180, chargeRate: 225 },
      sentAt: fridaySend(1),
      hasBookings: true,
      history: [
        transition("h-wright", null, "draft", subDays(now, 1).toISOString(), SYSTEM),
        transition("h-wright-2", "draft", "sent", fridaySend(1), SYSTEM),
      ],
    }),
  );

  const noraSheet = byPair.get(groupKey(IDS.teachers.nora, IDS.schools.oakridge, current.id));
  if (noraSheet) {
    const idx = sheets.findIndex((s) => s.id === noraSheet.id);
    if (idx >= 0) {
      sheets[idx] = { ...noraSheet, cost: { ...noraSheet.cost, payRate: null } };
    }
  } else {
    sheets.push(
      makeSheet({
        id: "ts-nora-norate",
        periodId: current.id,
        status: "sent",
        teacher: { id: nora.id, name: nora.name },
        school: { id: IDS.schools.oakridge, name: "Oakridge Academy" },
        consultant: { id: IDS.consultants.jordan, name: "Jordan Blake" },
        days: 2,
        cost: { payRate: null, chargeRate: 220 },
        sentAt: fridaySend(1),
        history: [transition("h-nora", null, "draft", subDays(now, 1).toISOString(), SYSTEM)],
      }),
    );
  }

  const tom = teachers.find((t) => t.id === IDS.teachers.tom)!;
  const nina = teachers.find((t) => t.id === IDS.teachers.nina)!;
  const michaelT = teachers.find((t) => t.id === IDS.teachers.michael)!;
  const jamesT = teachers.find((t) => t.id === IDS.teachers.james)!;
  const meadow = { id: IDS.schools.meadowbank, name: "Meadowbank Primary" };
  const greenfield = { id: IDS.schools.greenfield, name: "Greenfield Infants" };
  const oakridge = { id: IDS.schools.oakridge, name: "Oakridge Academy" };
  const harbourRef = { id: IDS.schools.harbour, name: "Harbour View High" };

  const upsert = (sheet: Timesheet) => {
    const idx = sheets.findIndex((item) => item.id === sheet.id);
    if (idx >= 0) sheets[idx] = sheet;
    else sheets.push(sheet);
  };

  if (!sheets.some((sheet) => sheet.id === IDS.timesheets.okGreenfield)) {
    upsert(
      makeSheet({
        id: IDS.timesheets.okGreenfield,
        periodId: current.id,
        status: "approved",
        teacher: { id: nina.id, name: nina.name },
        school: greenfield,
        consultant: { id: sam.id, name: sam.name },
        days: 5,
        cost: { payRate: 110, chargeRate: 145 },
        sentAt: fridaySend(1),
        viewedAt: now.toISOString(),
        approvedAt: now.toISOString(),
        approverName: "Patrice Bell",
        confirmedDays: 5,
        role: "teaching_assistant",
        history: [
          transition("h-nina-1", null, "draft", subDays(now, 1).toISOString(), SYSTEM),
          transition("h-nina-2", "draft", "sent", fridaySend(1), SYSTEM),
          transition("h-nina-3", "sent", "approved", now.toISOString(), SCHOOL_USER(greenfield), {
            approverName: "Patrice Bell",
          }),
        ],
      }),
    );
  }

  if (!sheets.some((sheet) => sheet.id === IDS.timesheets.ok1)) {
    upsert(
      makeSheet({
        id: IDS.timesheets.ok1,
        periodId: current.id,
        status: "approved",
        teacher: { id: michaelT.id, name: michaelT.name },
        school: oakridge,
        consultant: { id: jordan.id, name: jordan.name },
        days: 4.5,
        cost: { payRate: 170, chargeRate: 250 },
        sentAt: fridaySend(1),
        approvedAt: now.toISOString(),
        approverName: "Joanna Hale",
        confirmedDays: 4.5,
        workedDays: [
          { date: dayOn(0), units: 1, unitType: "day", role: "supply_teacher" },
          { date: dayOn(1), units: 0.5, unitType: "day", role: "supply_teacher" },
          { date: dayOn(2), units: 1, unitType: "day", role: "supply_teacher" },
          { date: dayOn(3), units: 1, unitType: "day", role: "supply_teacher" },
          { date: dayOn(4), units: 1, unitType: "day", role: "supply_teacher" },
        ],
        rateSchedule: [
          { from: dayOn(0), to: dayOn(1), dayRate: 230 },
          { from: dayOn(2), to: current.id, dayRate: 250 },
        ],
        history: [
          transition("h10", null, "draft", subDays(now, 1).toISOString(), SYSTEM),
          transition("h13", "viewed", "approved", now.toISOString(), SCHOOL_USER(oakridge), {
            approverName: "Joanna Hale",
          }),
        ],
      }),
    );
  }

  if (!sheets.some((sheet) => sheet.id === IDS.timesheets.okHarbour)) {
    upsert(
      makeSheet({
        id: IDS.timesheets.okHarbour,
        periodId: current.id,
        status: "approved",
        teacher: { id: jamesT.id, name: jamesT.name },
        school: harbourRef,
        consultant: { id: jordan.id, name: jordan.name },
        days: 3,
        cost: { payRate: 140, chargeRate: 185 },
        sentAt: fridaySend(1),
        approvedAt: now.toISOString(),
        approverName: "Chris Adey",
        confirmedDays: 3,
        role: "cover_supervisor",
        workedDays: [
          { date: dayOn(0), units: 0, unitType: "day", role: "cover_supervisor" },
          { date: dayOn(1), units: 1, unitType: "day", role: "cover_supervisor" },
          { date: dayOn(2), units: 1, unitType: "day", role: "cover_supervisor" },
        ],
        history: [
          transition("h-james-3", "sent", "approved", now.toISOString(), SCHOOL_USER(harbourRef), {
            approverName: "Chris Adey",
          }),
        ],
      }),
    );
  }

  const gapSheet = relabel(IDS.teachers.tom, IDS.schools.meadowbank, current.id, "ts-ok-gap", (sheet) => {
    const worked =
      sheet.workedDays.length >= 2
        ? sheet.workedDays
        : [
            { date: dayOn(0), units: 1, unitType: "day" as const, role: "supply_teacher" as const },
            { date: dayOn(1), units: 1, unitType: "day" as const, role: "supply_teacher" as const },
          ];
    return toMakeSheet(sheet, {
      id: "ts-ok-gap",
      status: "approved",
      days: sheet.expectedDays || 2,
      cost: { payRate: 160, chargeRate: 210 },
      sentAt: fridaySend(1),
      viewedAt: now.toISOString(),
      approvedAt: now.toISOString(),
      approverName: "Helen Crowe",
      confirmedDays: sheet.expectedDays || 2,
      role: "supply_teacher",
      invoiced: false,
      xeroInvoiceId: null,
      workedDays: worked,
      rateSchedule: [
        {
          from: worked[0]!.date,
          to: worked[0]!.date,
          dayRate: 210,
        },
      ],
      history: [
        transition("h-gap-1", null, "draft", subDays(now, 1).toISOString(), SYSTEM),
        transition("h-gap-2", "draft", "sent", fridaySend(1), SYSTEM),
        transition("h-gap-3", "sent", "approved", now.toISOString(), SCHOOL_USER(meadow), {
          approverName: "Helen Crowe",
        }),
      ],
    });
  });
  if (!gapSheet) {
    upsert(
      makeSheet({
        id: "ts-ok-gap",
        periodId: current.id,
        status: "approved",
        teacher: { id: tom.id, name: tom.name },
        school: meadow,
        consultant: { id: IDS.consultants.alex, name: "Alex Patel" },
        days: 2,
        cost: { payRate: 160, chargeRate: 210 },
        sentAt: fridaySend(1),
        viewedAt: now.toISOString(),
        approvedAt: now.toISOString(),
        approverName: "Helen Crowe",
        confirmedDays: 2,
        role: "supply_teacher",
        workedDays: [
          { date: dayOn(0), units: 1, unitType: "day", role: "supply_teacher" },
          { date: dayOn(1), units: 1, unitType: "day", role: "supply_teacher" },
        ],
        rateSchedule: [
          {
            from: dayOn(0),
            to: dayOn(0),
            dayRate: 210,
          },
        ],
        history: [
          transition("h-gap-1", null, "draft", subDays(now, 1).toISOString(), SYSTEM),
          transition("h-gap-2", "draft", "sent", fridaySend(1), SYSTEM),
          transition("h-gap-3", "sent", "approved", now.toISOString(), SCHOOL_USER(meadow), {
            approverName: "Helen Crowe",
          }),
        ],
      }),
    );
  }

  return sheets;
}
