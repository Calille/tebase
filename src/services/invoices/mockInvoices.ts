import { addDays, subDays } from "date-fns";
import type { BillTo } from "@/types/billing";
import type {
  Invoice,
  InvoiceLine,
  InvoiceStatus,
  InvoiceTransition,
} from "@/types/invoice";
import { roundGbp } from "@/types/payroll";
import { DEFAULT_VAT_SERVICE_TYPE } from "@/lib/vat";
import { parseIsoDate, toIsoDate } from "@/lib/payWeek";
import { SCHOOLS, TEACHERS, CONSULTANTS } from "@/services/weeklyReport/mockRefs";
import { billToById } from "@/services/invoices/mockBillTos";
import {
  emptyMoney,
  netPositionFor,
  schoolSubtotalsFromLines,
  totalsFromLines,
} from "@/services/invoices/invoiceMoney";
import { seedSequence } from "@/services/invoices/invoiceNumbering";
import { financialYearFor } from "@/lib/financialYear";
import type { TeacherRole } from "@/types/timesheet";

const SYSTEM = { id: "system", name: "Tebase" };
const ALEX = CONSULTANTS[0];

function isoDate(now: Date, daysAgo: number): string {
  return toIsoDate(subDays(now, daysAgo));
}

function isoStamp(now: Date, daysAgo: number): string {
  return subDays(now, daysAgo).toISOString();
}

function dueOn(issueDate: string, terms: number): string {
  return toIsoDate(addDays(parseIsoDate(issueDate), terms));
}

function supplyLine(input: {
  id: string;
  timesheetId: string;
  school: { id: string; name: string };
  teacher: { id: string; name: string };
  role: TeacherRole;
  dateWorked: string;
  units: number;
  chargeRate: number;
}): InvoiceLine {
  const net = roundGbp(input.chargeRate * input.units);
  const vatRate = 0.2;
  const vat = roundGbp(net * vatRate);
  return {
    id: input.id,
    timesheetId: input.timesheetId,
    school: input.school,
    teacher: input.teacher,
    role: input.role,
    dateWorked: input.dateWorked,
    units: input.units,
    unitType: "day",
    chargeRate: input.chargeRate,
    serviceType: DEFAULT_VAT_SERVICE_TYPE,
    vatRate,
    net,
    vat,
    gross: roundGbp(net + vat),
  };
}

function transition(
  id: string,
  from: InvoiceStatus | null,
  to: InvoiceStatus,
  at: string,
): InvoiceTransition {
  return { id, from, to, at, actor: SYSTEM };
}

function makeInvoice(input: {
  id: string;
  number: string;
  status: InvoiceStatus;
  billTo: BillTo;
  periodId: string;
  poNumber: string | null;
  issueDate: string;
  issuedAt: string;
  lines: InvoiceLine[];
  amountPaid?: number;
  extraHistory?: InvoiceTransition[];
}): Invoice {
  const totals = totalsFromLines(input.lines);
  const dueDate = dueOn(input.issueDate, input.billTo.paymentTermsDays);
  const history: InvoiceTransition[] = [
    transition(`${input.id}-d`, null, "draft", input.issuedAt),
    transition(`${input.id}-i`, "draft", "issued", input.issuedAt),
    ...(input.extraHistory ?? []),
  ];
  return {
    id: input.id,
    number: input.number,
    status: input.status,
    billTo: input.billTo,
    periodId: input.periodId,
    grouping: input.billTo.grouping,
    poNumber: input.poNumber,
    issueDate: input.issueDate,
    dueDate,
    issuedBy: ALEX,
    issuedAt: input.issuedAt,
    billingAddress: input.billTo.billingAddress,
    lines: input.lines,
    schoolSubtotals: schoolSubtotalsFromLines(input.lines),
    totals,
    credits: [],
    netPosition: netPositionFor(totals, []),
    amountPaid: input.amountPaid ?? 0,
    history,
    chases: [],
  };
}

export function buildSeedInvoices(now: Date, olderPeriodId: string): Invoice[] {
  const westfield = billToById("bt-westfield");
  const trust = billToById("bt-keep-trust");
  if (!westfield || !trust) return [];

  const olderMonday = toIsoDate(subDays(parseIsoDate(olderPeriodId), 6));

  const fy = financialYearFor(now).code;
  seedSequence(fy, "invoice", 6);
  seedSequence(fy, "credit", 0);

  const invOldLines = [
    supplyLine({
      id: "inv-seed-old:d0",
      timesheetId: "ts-older-slow",
      school: SCHOOLS.westfield,
      teacher: TEACHERS.john,
      role: "supply_teacher",
      dateWorked: olderMonday,
      units: 1,
      chargeRate: 210,
    }),
    supplyLine({
      id: "inv-seed-old:d1",
      timesheetId: "ts-older-slow",
      school: SCHOOLS.westfield,
      teacher: TEACHERS.john,
      role: "supply_teacher",
      dateWorked: toIsoDate(addDays(parseIsoDate(olderMonday), 1)),
      units: 1,
      chargeRate: 210,
    }),
    supplyLine({
      id: "inv-seed-old:d2",
      timesheetId: "ts-older-slow",
      school: SCHOOLS.westfield,
      teacher: TEACHERS.john,
      role: "supply_teacher",
      dateWorked: toIsoDate(addDays(parseIsoDate(olderMonday), 2)),
      units: 1,
      chargeRate: 210,
    }),
    supplyLine({
      id: "inv-seed-old:d3",
      timesheetId: "ts-older-slow",
      school: SCHOOLS.westfield,
      teacher: TEACHERS.john,
      role: "supply_teacher",
      dateWorked: toIsoDate(addDays(parseIsoDate(olderMonday), 3)),
      units: 1,
      chargeRate: 210,
    }),
  ];

  return [
    makeInvoice({
      id: "inv-seed-old",
      number: "KE-2627-0001",
      status: "overdue",
      billTo: westfield,
      periodId: olderPeriodId,
      poNumber: null,
      issueDate: isoDate(now, 20),
      issuedAt: isoStamp(now, 20),
      lines: invOldLines,
      extraHistory: [
        transition("inv-seed-old-s", "issued", "sent", isoStamp(now, 19)),
        transition("inv-seed-old-o", "sent", "overdue", isoStamp(now, 6)),
      ],
    }),
    makeInvoice({
      id: "inv-seed-mid",
      number: "KE-2627-0002",
      status: "overdue",
      billTo: trust,
      periodId: olderPeriodId,
      poNumber: "KAT-8891",
      issueDate: isoDate(now, 45),
      issuedAt: isoStamp(now, 45),
      lines: [
        supplyLine({
          id: "inv-seed-mid:l1",
          timesheetId: "ts-hist-oak-1",
          school: SCHOOLS.oakridge,
          teacher: TEACHERS.michael,
          role: "supply_teacher",
          dateWorked: isoDate(now, 50),
          units: 5,
          chargeRate: 230,
        }),
        supplyLine({
          id: "inv-seed-mid:l2",
          timesheetId: "ts-hist-gf-1",
          school: SCHOOLS.greenfield,
          teacher: TEACHERS.nina,
          role: "teaching_assistant",
          dateWorked: isoDate(now, 50),
          units: 5,
          chargeRate: 145,
        }),
      ],
      extraHistory: [
        transition("inv-seed-mid-s", "issued", "sent", isoStamp(now, 44)),
        transition("inv-seed-mid-o", "sent", "overdue", isoStamp(now, 15)),
      ],
    }),
    makeInvoice({
      id: "inv-seed-late",
      number: "KE-2627-0003",
      status: "overdue",
      billTo: westfield,
      periodId: olderPeriodId,
      poNumber: null,
      issueDate: isoDate(now, 75),
      issuedAt: isoStamp(now, 75),
      lines: [
        supplyLine({
          id: "inv-seed-late:l1",
          timesheetId: "ts-hist-west-2",
          school: SCHOOLS.westfield,
          teacher: TEACHERS.aisha,
          role: "supply_teacher",
          dateWorked: isoDate(now, 80),
          units: 5,
          chargeRate: 240,
        }),
      ],
      extraHistory: [
        transition("inv-seed-late-s", "issued", "sent", isoStamp(now, 74)),
        transition("inv-seed-late-o", "sent", "overdue", isoStamp(now, 60)),
      ],
    }),
    makeInvoice({
      id: "inv-seed-ancient",
      number: "KE-2627-0004",
      status: "overdue",
      billTo: trust,
      periodId: olderPeriodId,
      poNumber: "KAT-7702",
      issueDate: isoDate(now, 100),
      issuedAt: isoStamp(now, 100),
      lines: [
        supplyLine({
          id: "inv-seed-ancient:l1",
          timesheetId: "ts-hist-oak-2",
          school: SCHOOLS.oakridge,
          teacher: TEACHERS.emily,
          role: "supply_teacher",
          dateWorked: isoDate(now, 105),
          units: 4,
          chargeRate: 220,
        }),
      ],
      extraHistory: [
        transition("inv-seed-ancient-s", "issued", "sent", isoStamp(now, 99)),
        transition("inv-seed-ancient-o", "sent", "overdue", isoStamp(now, 69)),
      ],
    }),
    makeInvoice({
      id: "inv-seed-paid",
      number: "KE-2627-0005",
      status: "paid",
      billTo: westfield,
      periodId: olderPeriodId,
      poNumber: null,
      issueDate: isoDate(now, 40),
      issuedAt: isoStamp(now, 40),
      lines: [
        supplyLine({
          id: "inv-seed-paid:l1",
          timesheetId: "ts-hist-west-paid",
          school: SCHOOLS.westfield,
          teacher: TEACHERS.sarah,
          role: "supply_teacher",
          dateWorked: isoDate(now, 45),
          units: 3,
          chargeRate: 205,
        }),
      ],
      amountPaid: roundGbp(3 * 205 * 1.2),
      extraHistory: [
        transition("inv-seed-paid-s", "issued", "sent", isoStamp(now, 39)),
        transition("inv-seed-paid-p", "sent", "paid", isoStamp(now, 25)),
      ],
    }),
    makeInvoice({
      id: "inv-seed-disputed",
      number: "KE-2627-0006",
      status: "disputed",
      billTo: trust,
      periodId: olderPeriodId,
      poNumber: "KAT-9100",
      issueDate: isoDate(now, 18),
      issuedAt: isoStamp(now, 18),
      lines: [
        supplyLine({
          id: "inv-seed-disputed:l1",
          timesheetId: "ts-hist-disp",
          school: SCHOOLS.oakridge,
          teacher: TEACHERS.michael,
          role: "supply_teacher",
          dateWorked: isoDate(now, 22),
          units: 2,
          chargeRate: 250,
        }),
      ],
      extraHistory: [
        transition("inv-seed-disputed-s", "issued", "sent", isoStamp(now, 17)),
        transition("inv-seed-disputed-d", "sent", "disputed", isoStamp(now, 5)),
      ],
    }),
  ];
}

export function emptyDraftTotals() {
  return emptyMoney();
}
