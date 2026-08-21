import { addDays, differenceInCalendarDays } from "date-fns";
import {
  demoCreateResult,
  demoWriteResult,
  failedCreateResult,
  failedWriteResult,
  type CreateResult,
  type WriteResult,
} from "@/lib/persistence";
import { parseIsoDate, payWeekContaining, toIsoDate, listPayWeeks } from "@/lib/payWeek";
import { roundGbp } from "@/types/payroll";
import type { PartyRef } from "@/types/party";
import type { BillTo } from "@/types/billing";
import type { Timesheet } from "@/types/timesheet";
import {
  AGE_BUCKETS,
  ALLOWED_INVOICE_TRANSITIONS,
  isOpenInvoiceStatus,
  type AgeBucket,
  type AgedDebtSummary,
  type ChaseMethod,
  type CreditNote,
  type Invoice,
  type InvoiceLine,
  type InvoiceStatus,
  type InvoiceValidationIssue,
  type WeekChargeReconciliation,
  type XeroExportRecord,
} from "@/types/invoice";
import { timesheetService, resetTimesheetStoreForTests } from "@/services/timesheets/timesheetService";
import { weeklyReportService } from "@/services/weeklyReport/weeklyReportService";
import { BILL_TOS, billToById, billToForSchoolId } from "@/services/invoices/mockBillTos";
import { buildSeedInvoices } from "@/services/invoices/mockInvoices";
import {
  allocateCreditNoteNumber,
  allocateInvoiceNumber,
  resetNumberingForTests,
} from "@/services/invoices/invoiceNumbering";
import { validateInvoiceIssue } from "@/services/invoices/invoiceValidation";
import {
  buildInvoiceLine,
  emptyMoney,
  netPositionFor,
  schoolSubtotalsFromLines,
  totalsFromLines,
} from "@/services/invoices/invoiceMoney";
import { generateXeroCsv } from "@/services/invoices/xeroFormat";
import { generateInvoiceEmailCsv } from "@/services/invoices/invoiceCsv";

export const ALL_BILLABLE = "all";

export interface InvoiceCandidateGroup {
  key: string;
  billTo: BillTo;
  school: PartyRef | null;
  lines: InvoiceLine[];
}

function cloneInvoice(invoice: Invoice): Invoice {
  return {
    ...invoice,
    billTo: {
      ...invoice.billTo,
      schoolIds: [...invoice.billTo.schoolIds],
      financeContact: invoice.billTo.financeContact
        ? { ...invoice.billTo.financeContact }
        : null,
      billingAddress: invoice.billTo.billingAddress
        ? { ...invoice.billTo.billingAddress }
        : null,
    },
    billingAddress: invoice.billingAddress ? { ...invoice.billingAddress } : null,
    issuedBy: invoice.issuedBy ? { ...invoice.issuedBy } : null,
    lines: invoice.lines.map((line) => ({
      ...line,
      school: { ...line.school },
      teacher: { ...line.teacher },
    })),
    schoolSubtotals: invoice.schoolSubtotals.map((row) => ({
      ...row,
      school: { ...row.school },
    })),
    totals: { ...invoice.totals },
    netPosition: { ...invoice.netPosition },
    credits: invoice.credits.map((credit) => ({
      ...credit,
      createdBy: { ...credit.createdBy },
      totals: { ...credit.totals },
      lines: credit.lines.map((line) => ({
        ...line,
        teacher: { ...line.teacher },
        school: { ...line.school },
      })),
    })),
    history: invoice.history.map((item) => ({
      ...item,
      actor: { ...item.actor },
    })),
    chases: invoice.chases.map((item) => ({
      ...item,
      actor: { ...item.actor },
    })),
  };
}

let invoices: Invoice[] = [];
let xeroExports: XeroExportRecord[] = [];
let seeded = false;
let seedNow = new Date();

function seedIfNeeded() {
  if (seeded) return;
  const weeks = listPayWeeks(seedNow, 8);
  const olderId = weeks[2]?.id ?? weeks[0]?.id ?? toIsoDate(seedNow);
  invoices = buildSeedInvoices(seedNow, olderId);
  xeroExports = [];
  seeded = true;
}

function replaceInvoice(next: Invoice) {
  invoices = invoices.map((item) => (item.id === next.id ? next : item));
}

function ageBucketFor(days: number): AgeBucket {
  if (days <= 30) return "0-30";
  if (days <= 60) return "31-60";
  if (days <= 90) return "61-90";
  return "90+";
}

export function outstandingAmount(invoice: Invoice): number {
  return roundGbp(
    Math.max(0, invoice.netPosition.gross - invoice.amountPaid),
  );
}

function isOverdueInvoice(invoice: Invoice, now: Date): boolean {
  if (!isOpenInvoiceStatus(invoice.status)) return false;
  if (!invoice.dueDate) return false;
  return differenceInCalendarDays(now, parseIsoDate(invoice.dueDate)) > 0;
}

async function linesFromSheet(sheet: Timesheet): Promise<InvoiceLine[]> {
  return sheet.workedDays.map((day) => buildInvoiceLine(sheet, day));
}

export function splitGroups(
  billTo: BillTo,
  lines: InvoiceLine[],
): InvoiceCandidateGroup[] {
  if (lines.length === 0) return [];
  if (billTo.grouping === "consolidated") {
    return [
      {
        key: `${billTo.id}:all`,
        billTo,
        school: null,
        lines,
      },
    ];
  }
  const bySchool = new Map<string, InvoiceLine[]>();
  for (const line of lines) {
    const list = bySchool.get(line.school.id) ?? [];
    list.push(line);
    bySchool.set(line.school.id, list);
  }
  return [...bySchool.values()].map((schoolLines) => ({
    key: `${billTo.id}:${schoolLines[0].school.id}`,
    billTo,
    school: schoolLines[0].school,
    lines: schoolLines,
  }));
}

function assembleDraft(input: {
  id: string;
  billTo: BillTo;
  periodId: string;
  poNumber: string | null;
  lines: InvoiceLine[];
  actor: PartyRef;
}): Invoice {
  const totals = totalsFromLines(input.lines);
  return {
    id: input.id,
    number: null,
    status: "draft",
    billTo: input.billTo,
    periodId: input.periodId,
    grouping: input.billTo.grouping,
    poNumber: input.poNumber,
    issueDate: null,
    dueDate: null,
    issuedBy: null,
    issuedAt: null,
    billingAddress: input.billTo.billingAddress,
    lines: input.lines,
    schoolSubtotals: schoolSubtotalsFromLines(input.lines),
    totals,
    credits: [],
    netPosition: { ...totals },
    amountPaid: 0,
    history: [
      {
        id: `${input.id}-draft`,
        from: null,
        to: "draft",
        at: new Date().toISOString(),
        actor: input.actor,
      },
    ],
    chases: [],
  };
}

async function sheetsForLines(lines: InvoiceLine[]): Promise<Timesheet[]> {
  const ids = [...new Set(lines.map((line) => line.timesheetId))];
  const found: Timesheet[] = [];
  for (const id of ids) {
    const sheet = await timesheetService.getById(id);
    if (sheet) found.push(sheet);
  }
  return found;
}

export const invoiceService = {
  async listBillTos(): Promise<BillTo[]> {
    seedIfNeeded();
    return BILL_TOS.map((item) => ({
      ...item,
      schoolIds: [...item.schoolIds],
      financeContact: item.financeContact ? { ...item.financeContact } : null,
      billingAddress: item.billingAddress ? { ...item.billingAddress } : null,
    }));
  },

  async getBillTo(id: string): Promise<BillTo | null> {
    const found = billToById(id);
    return found ? { ...found, schoolIds: [...found.schoolIds] } : null;
  },

  async getPayWeeks() {
    return listPayWeeks(new Date(), 12);
  },

  async getCurrentPayWeek() {
    return payWeekContaining(new Date());
  },

  async listCandidateGroups(input: {
    periodId: string;
    billToId: string;
  }): Promise<InvoiceCandidateGroup[]> {
    seedIfNeeded();
    const ready = await timesheetService.listReadyToInvoice(input.periodId);
    const billTos =
      input.billToId === ALL_BILLABLE
        ? BILL_TOS
        : BILL_TOS.filter((item) => item.id === input.billToId);

    const groups: InvoiceCandidateGroup[] = [];
    for (const billTo of billTos) {
      const sheets = ready.filter((sheet) =>
        billTo.schoolIds.includes(sheet.school.id),
      );
      const lines = (await Promise.all(sheets.map(linesFromSheet))).flat();
      groups.push(...splitGroups(billTo, lines));
    }
    return groups;
  },

  async previewGroup(input: {
    periodId: string;
    billToId: string;
    lineIds: string[];
    poNumber?: string | null;
    actor: PartyRef;
  }): Promise<{
    draft: Invoice | null;
    issues: InvoiceValidationIssue[];
  }> {
    seedIfNeeded();
    const billTo = billToById(input.billToId);
    if (!billTo) {
      return {
        draft: null,
        issues: [
          {
            code: "no_lines",
            message: "Unknown bill-to.",
          },
        ],
      };
    }
    const groups = await this.listCandidateGroups({
      periodId: input.periodId,
      billToId: input.billToId,
    });
    const selected = groups
      .flatMap((group) => group.lines)
      .filter((line) => input.lineIds.includes(line.id));
    const timesheets = await sheetsForLines(selected);
    const issues = validateInvoiceIssue({
      billTo,
      poNumber: input.poNumber ?? null,
      lines: selected,
      timesheets,
    });
    const draft = assembleDraft({
      id: `draft-${input.billToId}-${input.periodId}`,
      billTo,
      periodId: input.periodId,
      poNumber: input.poNumber?.trim() || null,
      lines: selected,
      actor: input.actor,
    });
    return { draft, issues };
  },

  async issue(input: {
    periodId: string;
    billToId: string;
    lineIds: string[];
    poNumber?: string | null;
    actor: PartyRef;
  }): Promise<CreateResult<Invoice>> {
    seedIfNeeded();
    const { draft, issues } = await this.previewGroup(input);
    if (!draft || issues.length > 0) {
      return failedCreateResult(
        issues.map((issue) => issue.message).join(" ") || "Cannot issue this invoice.",
      );
    }

    const timesheets = await sheetsForLines(draft.lines);
    for (const sheet of timesheets) {
      if (sheet.invoiced || sheet.invoiceId) {
        return failedCreateResult(
          `${sheet.teacher.name} is already on another invoice.`,
        );
      }
    }

    const issuedAt = new Date();
    const issueDate = toIsoDate(issuedAt);
    const number = allocateInvoiceNumber(issuedAt);
    const id = `inv-${number.toLowerCase()}`;
    const issued: Invoice = {
      ...draft,
      id,
      number,
      status: "issued",
      issueDate,
      dueDate: toIsoDate(
        addDays(parseIsoDate(issueDate), draft.billTo.paymentTermsDays),
      ),
      issuedBy: input.actor,
      issuedAt: issuedAt.toISOString(),
      history: [
        ...draft.history,
        {
          id: `${id}-issued`,
          from: "draft",
          to: "issued",
          at: issuedAt.toISOString(),
          actor: input.actor,
          note: `Issued as ${number}`,
        },
      ],
    };

    invoices = [issued, ...invoices];
    await timesheetService.markInvoiced(
      [...new Set(issued.lines.map((line) => line.timesheetId))],
      issued.id,
    );
    return demoCreateResult(cloneInvoice(issued));
  },

  async listInvoices(): Promise<Invoice[]> {
    seedIfNeeded();
    return invoices.map(cloneInvoice);
  },

  async getInvoice(id: string): Promise<Invoice | null> {
    seedIfNeeded();
    const found = invoices.find((item) => item.id === id);
    return found ? cloneInvoice(found) : null;
  },

  async transitionStatus(input: {
    invoiceId: string;
    to: InvoiceStatus;
    actor: PartyRef;
    note?: string;
  }): Promise<WriteResult> {
    seedIfNeeded();
    const current = invoices.find((item) => item.id === input.invoiceId);
    if (!current) return failedWriteResult("Invoice not found.");
    const allowed = ALLOWED_INVOICE_TRANSITIONS[current.status];
    if (!allowed.includes(input.to)) {
      return failedWriteResult(
        `Cannot move a ${current.status} invoice to ${input.to}.`,
      );
    }
    const at = new Date().toISOString();
    const next: Invoice = {
      ...current,
      status: input.to,
      history: [
        ...current.history,
        {
          id: `tr-${current.id}-${current.history.length + 1}`,
          from: current.status,
          to: input.to,
          at,
          actor: input.actor,
          note: input.note,
        },
      ],
    };
    if (input.to === "void" && current.status !== "draft") {
      await timesheetService.clearInvoiceLink(
        [...new Set(current.lines.map((line) => line.timesheetId))],
      );
    }
    if (input.to === "paid") {
      next.amountPaid = next.netPosition.gross;
    }
    replaceInvoice(next);
    return demoWriteResult();
  },

  async recordChase(input: {
    invoiceId: string;
    method: ChaseMethod;
    actor: PartyRef;
    note?: string;
  }): Promise<WriteResult> {
    seedIfNeeded();
    const current = invoices.find((item) => item.id === input.invoiceId);
    if (!current) return failedWriteResult("Invoice not found.");
    if (!isOpenInvoiceStatus(current.status)) {
      return failedWriteResult("Chase is only recorded on outstanding invoices.");
    }
    const at = new Date().toISOString();
    const next: Invoice = {
      ...current,
      chases: [
        ...current.chases,
        {
          id: `chase-${current.id}-${current.chases.length + 1}`,
          at,
          method: input.method,
          actor: input.actor,
          note: input.note,
        },
      ],
      history: [
        ...current.history,
        {
          id: `tr-chase-${current.id}-${current.history.length + 1}`,
          from: current.status,
          to: current.status,
          at,
          actor: input.actor,
          note: `Chase recorded (${input.method})`,
        },
      ],
    };
    replaceInvoice(next);
    return demoWriteResult();
  },

  async createCreditNote(input: {
    invoiceId: string;
    lineIds: string[];
    reason: string;
    actor: PartyRef;
  }): Promise<CreateResult<CreditNote>> {
    seedIfNeeded();
    const current = invoices.find((item) => item.id === input.invoiceId);
    if (!current) return failedCreateResult("Invoice not found.");
    if (current.status === "draft" || current.status === "void") {
      return failedCreateResult("Credit notes apply to issued invoices only.");
    }
    if (!current.number) {
      return failedCreateResult("Cannot credit an unnumbered invoice.");
    }
    if (!input.reason.trim()) {
      return failedCreateResult("A reason is required.");
    }
    const alreadyCredited = new Set(
      current.credits.flatMap((credit) =>
        credit.lines.map((line) => line.invoiceLineId),
      ),
    );
    const selected = current.lines.filter(
      (line) => input.lineIds.includes(line.id) && !alreadyCredited.has(line.id),
    );
    if (selected.length === 0) {
      return failedCreateResult("Select at least one uncredited line.");
    }

    const at = new Date();
    const credit: CreditNote = {
      id: `cn-${current.id}-${current.credits.length + 1}`,
      number: allocateCreditNoteNumber(at),
      invoiceId: current.id,
      createdAt: at.toISOString(),
      createdBy: input.actor,
      reason: input.reason.trim(),
      lines: selected.map((line) => ({
        invoiceLineId: line.id,
        dateWorked: line.dateWorked,
        teacher: { ...line.teacher },
        school: { ...line.school },
        net: line.net ?? 0,
        vat: line.vat ?? 0,
        gross: line.gross ?? 0,
      })),
      totals: selected.reduce(
        (acc, line) => ({
          net: roundGbp(acc.net + (line.net ?? 0)),
          vat: roundGbp(acc.vat + (line.vat ?? 0)),
          gross: roundGbp(acc.gross + (line.gross ?? 0)),
        }),
        emptyMoney(),
      ),
    };

    const credits = [...current.credits, credit];
    const netPosition = netPositionFor(
      current.totals,
      credits.map((item) => item.totals),
    );
    const fullyCredited = netPosition.gross <= 0;
    const next: Invoice = {
      ...current,
      credits,
      netPosition,
      status: fullyCredited ? "credited" : current.status,
      history: [
        ...current.history,
        {
          id: `tr-cn-${credit.id}`,
          from: current.status,
          to: fullyCredited ? "credited" : current.status,
          at: credit.createdAt,
          actor: input.actor,
          note: `${credit.number}: ${credit.reason}`,
        },
      ],
    };
    replaceInvoice(next);
    return demoCreateResult(credit);
  },

  async getAgedDebt(now = new Date()): Promise<AgedDebtSummary> {
    seedIfNeeded();
    const open = invoices.filter(
      (invoice) =>
        isOpenInvoiceStatus(invoice.status) && outstandingAmount(invoice) > 0,
    );
    const buckets = AGE_BUCKETS.map((bucket) => ({
      bucket,
      count: 0,
      outstanding: 0,
    }));
    const byBillTo = new Map<
      string,
      { billTo: PartyRef; outstanding: number; overdue: number; invoiceCount: number; lateCount: number }
    >();

    let totalOutstanding = 0;
    let totalOverdue = 0;

    for (const invoice of open) {
      const amount = outstandingAmount(invoice);
      totalOutstanding = roundGbp(totalOutstanding + amount);
      const days = invoice.issueDate
        ? differenceInCalendarDays(now, parseIsoDate(invoice.issueDate))
        : 0;
      const bucket = ageBucketFor(days);
      const slot = buckets.find((item) => item.bucket === bucket);
      if (slot) {
        slot.count += 1;
        slot.outstanding = roundGbp(slot.outstanding + amount);
      }
      const overdue = isOverdueInvoice(invoice, now) || invoice.status === "overdue";
      if (overdue) totalOverdue = roundGbp(totalOverdue + amount);

      const rollup = byBillTo.get(invoice.billTo.id) ?? {
        billTo: { id: invoice.billTo.id, name: invoice.billTo.name },
        outstanding: 0,
        overdue: 0,
        invoiceCount: 0,
        lateCount: 0,
      };
      rollup.invoiceCount += 1;
      rollup.outstanding = roundGbp(rollup.outstanding + amount);
      if (overdue) {
        rollup.overdue = roundGbp(rollup.overdue + amount);
        rollup.lateCount += 1;
      }
      byBillTo.set(invoice.billTo.id, rollup);
    }

    const rollups = [...byBillTo.values()]
      .map((row) => ({
        billTo: row.billTo,
        invoiceCount: row.invoiceCount,
        outstanding: row.outstanding,
        overdue: row.overdue,
        habituallyLate: row.lateCount >= 2,
      }))
      .sort((a, b) => b.outstanding - a.outstanding);

    return {
      totalOutstanding,
      totalOverdue,
      buckets,
      byBillTo: rollups,
      invoices: open.map(cloneInvoice),
    };
  },

  async getWeekReconciliation(
    periodId: string,
  ): Promise<WeekChargeReconciliation> {
    seedIfNeeded();
    const report = await weeklyReportService.getReport({
      periodId,
      scope: "team",
    });
    const weeklyReportCharge = report.headlines.charge.current;
    const invoicedNet = roundGbp(
      invoices
        .filter(
          (invoice) =>
            invoice.periodId === periodId &&
            invoice.status !== "draft" &&
            invoice.status !== "void",
        )
        .reduce((sum, invoice) => sum + invoice.totals.net, 0),
    );
    const delta = roundGbp(weeklyReportCharge - invoicedNet);
    return {
      periodId,
      weeklyReportCharge,
      invoicedNet,
      delta,
      matches: Math.abs(delta) < 0.005,
    };
  },

  async getXeroExports(periodId: string): Promise<XeroExportRecord[]> {
    seedIfNeeded();
    return xeroExports
      .filter((item) => item.periodId === periodId)
      .map((item) => ({ ...item, exportedBy: { ...item.exportedBy } }));
  },

  async previewXeroExport(periodId: string): Promise<{
    csv: string;
    invoices: Invoice[];
    alreadyExported: XeroExportRecord[];
  }> {
    seedIfNeeded();
    const rows = invoices.filter(
      (invoice) =>
        invoice.periodId === periodId &&
        invoice.number &&
        invoice.status !== "void" &&
        invoice.status !== "draft",
    );
    return {
      csv: generateXeroCsv(rows),
      invoices: rows.map(cloneInvoice),
      alreadyExported: await this.getXeroExports(periodId),
    };
  },

  async recordXeroExport(input: {
    periodId: string;
    exportedBy: PartyRef;
  }): Promise<CreateResult<{ csv: string; record: XeroExportRecord }>> {
    seedIfNeeded();
    const preview = await this.previewXeroExport(input.periodId);
    if (preview.invoices.length === 0) {
      return failedCreateResult("No issued invoices in this week to export.");
    }
    const record: XeroExportRecord = {
      id: `xero-${input.periodId}-${xeroExports.length + 1}`,
      exportedAt: new Date().toISOString(),
      periodId: input.periodId,
      weekEnding: input.periodId,
      invoiceCount: preview.invoices.length,
      exportedBy: input.exportedBy,
    };
    xeroExports = [record, ...xeroExports];
    return demoCreateResult({ csv: preview.csv, record });
  },

  emailCsv(invoice: Invoice): string {
    return generateInvoiceEmailCsv(invoice);
  },

  billToForSchool: billToForSchoolId,
};

export function resetInvoiceStoreForTests(now = new Date()) {
  seedNow = now;
  seeded = false;
  invoices = [];
  xeroExports = [];
  resetNumberingForTests();
  resetTimesheetStoreForTests(now);
  seedIfNeeded();
}
