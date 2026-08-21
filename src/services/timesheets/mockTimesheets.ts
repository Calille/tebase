import { addDays, differenceInCalendarDays, subDays } from "date-fns";
import {
  computeChargeTotal,
  type PayrollCostModel,
} from "@/types/payroll";
import type { PartyRef } from "@/types/party";
import type {
  RatePeriod,
  TeacherRole,
  Timesheet,
  TimesheetQuery,
  TimesheetStatus,
  TimesheetTransition,
  WorkedDay,
} from "@/types/timesheet";
import { CONSULTANTS, SCHOOLS, TEACHERS } from "@/services/weeklyReport/mockRefs";
import { listPayWeeks, parseIsoDate, toIsoDate } from "@/lib/payWeek";
import {
  chargeFromWorkedDays,
  defaultRateSchedule,
  generateWorkedDays,
} from "@/services/timesheets/workedDays";

const SYSTEM: PartyRef = { id: "system", name: "Tebase" };
const SCHOOL_USER = (school: PartyRef): PartyRef => ({
  id: `portal-${school.id}`,
  name: `${school.name} office`,
});

function hoursFromDays(days: number): number {
  return Math.round(days * 6.5 * 10) / 10;
}

function charge(cost: PayrollCostModel, days: number): number {
  return computeChargeTotal(cost, days);
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
  cost: PayrollCostModel;
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
    bookingId: `bk-${input.id}`,
    school: input.school,
    teacher: input.teacher,
    consultant: input.consultant,
    status: input.status,
    expectedHours,
    expectedDays: input.days,
    confirmedHours,
    confirmedDays,
    cost: input.cost,
    chargeValue: workedDays.length > 0 ? fromDates : charge(input.cost, units),
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

export function buildMockTimesheets(now = new Date()): Timesheet[] {
  const weeks = listPayWeeks(now, 8);
  const currentId = weeks[0]?.id ?? "current";
  const previousId = weeks[1]?.id ?? currentId;
  const olderId = weeks[2]?.id ?? currentId;
  const currentStarts = weeks[0]?.startsOn ?? currentId;
  const dayOn = (weekStarts: string, offset: number) =>
    toIsoDate(addDays(parseIsoDate(weekStarts), offset));

  const alex = CONSULTANTS[0];
  const jordan = CONSULTANTS[1];
  const sam = CONSULTANTS[2];

  const fridaySend = (periodEnding: string, daysAgo: number) =>
    subDays(now, daysAgo).toISOString();

  const sarahQuery: TimesheetQuery = {
    id: "q-sarah",
    reason: "wrong_hours",
    freeText: "Sarah left at lunch on Thursday — should be 3.5 days not 4.",
    openedAt: subDays(now, 2).toISOString(),
    openedBy: SCHOOL_USER(SCHOOLS.stmarys),
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
        author: SCHOOL_USER(SCHOOLS.stmarys),
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

  return [
    makeSheet({
      id: "ts-unapp-1",
      periodId: currentId,
      status: "sent",
      teacher: TEACHERS.john,
      school: SCHOOLS.westfield,
      consultant: alex,
      days: 5,
      cost: { payRate: 160, chargeRate: 210 },
      sentAt: fridaySend(currentId, 0),
      history: [
        transition("h1", null, "draft", subDays(now, 1).toISOString(), SYSTEM),
        transition("h2", "draft", "sent", fridaySend(currentId, 0), SYSTEM, {
          note: "Friday 10am send (stub)",
        }),
      ],
    }),
    makeSheet({
      id: "ts-unapp-2",
      periodId: currentId,
      status: "queried",
      teacher: TEACHERS.sarah,
      school: SCHOOLS.stmarys,
      consultant: alex,
      days: 4,
      cost: { payRate: 155, chargeRate: 205 },
      sentAt: fridaySend(currentId, 0),
      viewedAt: subDays(now, 2).toISOString(),
      query: sarahQuery,
      history: [
        transition("h3", null, "draft", subDays(now, 1).toISOString(), SYSTEM),
        transition("h4", "draft", "sent", fridaySend(currentId, 0), SYSTEM),
        transition(
          "h5",
          "sent",
          "viewed",
          subDays(now, 2).toISOString(),
          SCHOOL_USER(SCHOOLS.stmarys),
        ),
        transition(
          "h6",
          "viewed",
          "queried",
          subDays(now, 2).toISOString(),
          SCHOOL_USER(SCHOOLS.stmarys),
          { note: "Wrong hours" },
        ),
      ],
    }),
    makeSheet({
      id: "ts-unapp-3",
      periodId: currentId,
      status: "viewed",
      teacher: TEACHERS.priya,
      school: SCHOOLS.harbour,
      consultant: jordan,
      days: 3,
      cost: { payRate: 185, chargeRate: 230 },
      sentAt: fridaySend(currentId, 0),
      viewedAt: subDays(now, 1).toISOString(),
      history: [
        transition("h7", null, "draft", subDays(now, 1).toISOString(), SYSTEM),
        transition("h8", "draft", "sent", fridaySend(currentId, 0), SYSTEM),
        transition(
          "h9",
          "sent",
          "viewed",
          subDays(now, 1).toISOString(),
          SCHOOL_USER(SCHOOLS.harbour),
        ),
      ],
    }),
    makeSheet({
      id: "ts-ok-1",
      periodId: currentId,
      status: "approved",
      teacher: TEACHERS.michael,
      school: SCHOOLS.oakridge,
      consultant: jordan,
      days: 4.5,
      cost: { payRate: 170, chargeRate: 250 },
      sentAt: fridaySend(currentId, 0),
      viewedAt: subDays(now, 0).toISOString(),
      approvedAt: now.toISOString(),
      approverName: "Joanna Hale",
      confirmedDays: 4.5,
      role: "supply_teacher",
      workedDays: [
        { date: dayOn(currentStarts, 0), units: 1, unitType: "day", role: "supply_teacher" },
        { date: dayOn(currentStarts, 1), units: 0.5, unitType: "day", role: "supply_teacher" },
        { date: dayOn(currentStarts, 2), units: 1, unitType: "day", role: "supply_teacher" },
        { date: dayOn(currentStarts, 3), units: 1, unitType: "day", role: "supply_teacher" },
        { date: dayOn(currentStarts, 4), units: 1, unitType: "day", role: "supply_teacher" },
      ],
      rateSchedule: [
        {
          from: dayOn(currentStarts, 0),
          to: dayOn(currentStarts, 1),
          dayRate: 230,
        },
        {
          from: dayOn(currentStarts, 2),
          to: currentId,
          dayRate: 250,
        },
      ],
      history: [
        transition("h10", null, "draft", subDays(now, 1).toISOString(), SYSTEM),
        transition("h11", "draft", "sent", fridaySend(currentId, 0), SYSTEM),
        transition(
          "h12",
          "sent",
          "viewed",
          now.toISOString(),
          SCHOOL_USER(SCHOOLS.oakridge),
        ),
        transition(
          "h13",
          "viewed",
          "approved",
          now.toISOString(),
          SCHOOL_USER(SCHOOLS.oakridge),
          { approverName: "Joanna Hale" },
        ),
      ],
    }),
    makeSheet({
      id: "ts-ok-greenfield",
      periodId: currentId,
      status: "approved",
      teacher: TEACHERS.nina,
      school: SCHOOLS.greenfield,
      consultant: sam,
      days: 5,
      cost: { payRate: 110, chargeRate: 145 },
      sentAt: fridaySend(currentId, 0),
      viewedAt: now.toISOString(),
      approvedAt: now.toISOString(),
      approverName: "Patrice Bell",
      confirmedDays: 5,
      role: "teaching_assistant",
      history: [
        transition("h-nina-1", null, "draft", subDays(now, 1).toISOString(), SYSTEM),
        transition("h-nina-2", "draft", "sent", fridaySend(currentId, 0), SYSTEM),
        transition(
          "h-nina-3",
          "sent",
          "approved",
          now.toISOString(),
          SCHOOL_USER(SCHOOLS.greenfield),
          { approverName: "Patrice Bell" },
        ),
      ],
    }),
    makeSheet({
      id: "ts-ok-harbour",
      periodId: currentId,
      status: "approved",
      teacher: TEACHERS.james,
      school: SCHOOLS.harbour,
      consultant: jordan,
      days: 3,
      cost: { payRate: 140, chargeRate: 185 },
      sentAt: fridaySend(currentId, 0),
      viewedAt: now.toISOString(),
      approvedAt: now.toISOString(),
      approverName: "Chris Adey",
      confirmedDays: 3,
      role: "cover_supervisor",
      workedDays: [
        { date: dayOn(currentStarts, 0), units: 1, unitType: "day", role: "cover_supervisor" },
        { date: dayOn(currentStarts, 1), units: 1, unitType: "day", role: "cover_supervisor" },
        { date: dayOn(currentStarts, 2), units: 1, unitType: "day", role: "cover_supervisor" },
        {
          date: dayOn(currentStarts, 3),
          units: 0,
          unitType: "day",
          role: "cover_supervisor",
        },
      ],
      history: [
        transition("h-james-1", null, "draft", subDays(now, 1).toISOString(), SYSTEM),
        transition("h-james-2", "draft", "sent", fridaySend(currentId, 0), SYSTEM),
        transition(
          "h-james-3",
          "sent",
          "approved",
          now.toISOString(),
          SCHOOL_USER(SCHOOLS.harbour),
          { approverName: "Chris Adey" },
        ),
      ],
    }),
    makeSheet({
      id: "ts-ok-gap",
      periodId: currentId,
      status: "approved",
      teacher: TEACHERS.tom,
      school: SCHOOLS.meadowbank,
      consultant: alex,
      days: 2,
      cost: { payRate: 160, chargeRate: 210 },
      sentAt: fridaySend(currentId, 0),
      viewedAt: now.toISOString(),
      approvedAt: now.toISOString(),
      approverName: "Helen Crowe",
      confirmedDays: 2,
      role: "supply_teacher",
      workedDays: [
        { date: dayOn(currentStarts, 0), units: 1, unitType: "day", role: "supply_teacher" },
        { date: dayOn(currentStarts, 1), units: 1, unitType: "day", role: "supply_teacher" },
      ],
      rateSchedule: [
        {
          from: dayOn(currentStarts, 0),
          to: dayOn(currentStarts, 0),
          dayRate: 210,
        },
      ],
      history: [
        transition("h-gap-1", null, "draft", subDays(now, 1).toISOString(), SYSTEM),
        transition("h-gap-2", "draft", "sent", fridaySend(currentId, 0), SYSTEM),
        transition(
          "h-gap-3",
          "sent",
          "approved",
          now.toISOString(),
          SCHOOL_USER(SCHOOLS.meadowbank),
          { approverName: "Helen Crowe" },
        ),
      ],
    }),
    makeSheet({
      id: "ts-sam-1",
      periodId: currentId,
      status: "sent",
      teacher: TEACHERS.emily,
      school: SCHOOLS.greenfield,
      consultant: sam,
      days: 3,
      cost: { payRate: 150, chargeRate: 195 },
      sentAt: fridaySend(currentId, 0),
      history: [
        transition("h14", null, "draft", subDays(now, 1).toISOString(), SYSTEM),
        transition("h15", "draft", "sent", fridaySend(currentId, 0), SYSTEM),
      ],
    }),
    makeSheet({
      id: "ts-overdue-1",
      periodId: previousId,
      status: "overdue",
      teacher: TEACHERS.tom,
      school: SCHOOLS.westfield,
      consultant: sam,
      days: 5,
      cost: { payRate: 180, chargeRate: 225 },
      sentAt: subDays(now, 12).toISOString(),
      lastChasedAt: subDays(now, 4).toISOString(),
      chaseCount: 2,
      history: [
        transition("h16", null, "draft", subDays(now, 13).toISOString(), SYSTEM),
        transition("h17", "draft", "sent", subDays(now, 12).toISOString(), SYSTEM),
        transition("h18", "sent", "overdue", subDays(now, 5).toISOString(), SYSTEM, {
          note: "Past chase threshold",
        }),
      ],
    }),
    makeSheet({
      id: "ts-draft-late",
      periodId: currentId,
      status: "draft",
      teacher: TEACHERS.aisha,
      school: SCHOOLS.oakridge,
      consultant: alex,
      days: 2,
      cost: { payRate: 190, chargeRate: 240 },
      history: [
        transition("h-draft-late", null, "draft", subDays(now, 1).toISOString(), SYSTEM, {
          note: "Missed the Friday send — send now",
        }),
      ],
    }),
    makeSheet({
      id: "ts-inset-1",
      periodId: currentId,
      status: "draft",
      teacher: TEACHERS.david,
      school: SCHOOLS.harbour,
      consultant: jordan,
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
    makeSheet({
      id: "ts-prev-approved",
      periodId: previousId,
      status: "approved",
      teacher: TEACHERS.aisha,
      school: SCHOOLS.westfield,
      consultant: jordan,
      days: 5,
      cost: { payRate: 190, chargeRate: 240 },
      sentAt: subDays(now, 10).toISOString(),
      viewedAt: subDays(now, 3).toISOString(),
      approvedAt: subDays(now, 2).toISOString(),
      approverName: "Neil Cartwright",
      confirmedDays: 4,
      history: [
        transition("h20", "draft", "sent", subDays(now, 10).toISOString(), SYSTEM),
        transition(
          "h21",
          "sent",
          "approved",
          subDays(now, 2).toISOString(),
          SCHOOL_USER(SCHOOLS.westfield),
          { approverName: "Neil Cartwright" },
        ),
      ],
    }),
    makeSheet({
      id: "ts-older-slow",
      periodId: olderId,
      status: "approved",
      teacher: TEACHERS.john,
      school: SCHOOLS.westfield,
      consultant: alex,
      days: 4,
      cost: { payRate: 160, chargeRate: 210 },
      sentAt: subDays(now, 18).toISOString(),
      approvedAt: subDays(now, 6).toISOString(),
      approverName: "Neil Cartwright",
      confirmedDays: 4,
      invoiced: true,
      xeroInvoiceId: "xero-inv-demo-old",
      history: [
        transition("h22", "draft", "sent", subDays(now, 18).toISOString(), SYSTEM),
        transition(
          "h23",
          "sent",
          "approved",
          subDays(now, 6).toISOString(),
          SCHOOL_USER(SCHOOLS.westfield),
          { approverName: "Neil Cartwright" },
        ),
      ],
    }),
  ];
}

export function daysSinceSent(sheet: Timesheet, now = new Date()): number | null {
  if (!sheet.sentAt) return null;
  return differenceInCalendarDays(now, new Date(sheet.sentAt));
}
