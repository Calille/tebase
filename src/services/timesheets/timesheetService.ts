import { differenceInCalendarDays } from "date-fns";
import {
  demoCreateResult,
  demoWriteResult,
  type CreateResult,
  type WriteResult,
} from "@/lib/persistence";
import { computeChargeTotal } from "@/types/payroll";
import type { PartyRef } from "@/types/party";
import {
  boardColumnFor,
  isUnapprovedTimesheetStatus,
  type HoursAmendmentStatus,
  type SlowSchool,
  type Timesheet,
  type TimesheetBoardSummary,
  type TimesheetEscalation,
  type TimesheetFilters,
  type TimesheetStatus,
  type UnapprovedTimesheetSummary,
} from "@/types/timesheet";
import { settingsService } from "@/services/settings/settingsService";
import { timesheetPortalService } from "@/services/timesheets/timesheetPortalService";
import type { PortalSendMode, PortalSendResult } from "@/services/timesheets/timesheetPortalService";
import { daysSinceSent } from "@/services/timesheets/mockTimesheets";
import { getDataset, resetDataset } from "@/mocks";

let sheets: Timesheet[] = [];
let seeded = false;

function seedIfNeeded() {
  if (seeded) return;
  sheets = getDataset().timesheets.map(clone);
  seeded = true;
}

function clone(sheet: Timesheet): Timesheet {
  return {
    ...sheet,
    school: { ...sheet.school },
    teacher: { ...sheet.teacher },
    consultant: { ...sheet.consultant },
    cost: { ...sheet.cost },
    workedDays: sheet.workedDays.map((day) => ({ ...day })),
    rateSchedule: sheet.rateSchedule.map((period) => ({ ...period })),
    query: sheet.query
      ? {
          ...sheet.query,
          messages: [...sheet.query.messages],
          amendment: sheet.query.amendment
            ? { ...sheet.query.amendment }
            : undefined,
        }
      : null,
    history: [...sheet.history],
  };
}

function matches(sheet: Timesheet, filters: TimesheetFilters): boolean {
  if (sheet.periodId !== filters.periodId) return false;
  if (filters.schoolId && sheet.school.id !== filters.schoolId) return false;
  if (filters.consultantId && sheet.consultant.id !== filters.consultantId) {
    return false;
  }
  if (filters.teacherId && sheet.teacher.id !== filters.teacherId) return false;
  if (filters.status && filters.status !== "all") {
    if (filters.status === "unapproved") {
      if (!isUnapprovedTimesheetStatus(sheet.status)) return false;
    } else if (sheet.status !== filters.status) {
      return false;
    }
  }
  const search = filters.search?.trim().toLowerCase();
  if (search) {
    const hay = `${sheet.teacher.name} ${sheet.school.name} ${sheet.consultant.name}`.toLowerCase();
    if (!hay.includes(search)) return false;
  }
  return true;
}

function money(sheetsFor: Timesheet[]): number {
  return Math.round(sheetsFor.reduce((sum, item) => sum + item.chargeValue, 0) * 100) / 100;
}

function summariseBoard(rows: Timesheet[]): TimesheetBoardSummary {
  const outstanding = rows.filter((row) => boardColumnFor(row.status) === "outstanding");
  const confirmed = rows.filter((row) => boardColumnFor(row.status) === "confirmed");
  const queried = rows.filter((row) => boardColumnFor(row.status) === "queried");
  const cannot = [...outstanding, ...queried];
  return {
    outstanding: { count: outstanding.length, chargeValue: money(outstanding) },
    confirmed: { count: confirmed.length, chargeValue: money(confirmed) },
    queried: { count: queried.length, chargeValue: money(queried) },
    cannotInvoice: { count: cannot.length, chargeValue: money(cannot) },
  };
}

function uniqueRefs(rows: Timesheet[]) {
  const pick = (get: (row: Timesheet) => PartyRef) => {
    const map = new Map<string, PartyRef>();
    for (const row of rows) map.set(get(row).id, get(row));
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  };
  return {
    schools: pick((row) => row.school),
    consultants: pick((row) => row.consultant),
    teachers: pick((row) => row.teacher),
  };
}

function replaceSheet(next: Timesheet) {
  sheets = sheets.map((item) => (item.id === next.id ? next : item));
}

function appendTransition(
  sheet: Timesheet,
  to: TimesheetStatus,
  actor: PartyRef,
  extra?: { approverName?: string; note?: string },
): Timesheet {
  const at = new Date().toISOString();
  return {
    ...sheet,
    status: to,
    history: [
      ...sheet.history,
      {
        id: `tr-${sheet.id}-${sheet.history.length + 1}`,
        from: sheet.status,
        to,
        at,
        actor,
        approverName: extra?.approverName,
        note: extra?.note,
      },
    ],
  };
}

function applyOverdueFlag(sheet: Timesheet, overdueAfterDays: number, now: Date): Timesheet {
  if (
    (sheet.status === "sent" || sheet.status === "viewed") &&
    sheet.sentAt &&
    differenceInCalendarDays(now, new Date(sheet.sentAt)) >= overdueAfterDays
  ) {
    return { ...sheet, status: "overdue" };
  }
  return sheet;
}

export function isSheetOverdue(
  sheet: Timesheet,
  overdueAfterDays: number,
  now = new Date(),
): boolean {
  if (sheet.status === "overdue") return true;
  if (sheet.status !== "sent" && sheet.status !== "viewed") return false;
  const days = daysSinceSent(sheet, now);
  return days != null && days >= overdueAfterDays;
}

function buildEscalation(all: Timesheet[], now: Date): TimesheetEscalation {
  const outstanding = all
    .filter((sheet) => boardColumnFor(sheet.status) === "outstanding")
    .map((sheet) => ({
      sheet,
      days: daysSinceSent(sheet, now) ?? 0,
    }))
    .sort((a, b) => b.days - a.days);

  const bySchool = new Map<string, Timesheet[]>();
  for (const sheet of all) {
    const list = bySchool.get(sheet.school.id) ?? [];
    list.push(sheet);
    bySchool.set(sheet.school.id, list);
  }

  const slowSchools: SlowSchool[] = [...bySchool.entries()]
    .map(([, group]) => {
      const approved = group.filter((item) => item.status === "approved" && item.sentAt && item.approvedAt);
      const avg =
        approved.length === 0
          ? null
          : Math.round(
              (approved.reduce((sum, item) => {
                return (
                  sum +
                  differenceInCalendarDays(
                    new Date(item.approvedAt as string),
                    new Date(item.sentAt as string),
                  )
                );
              }, 0) /
                approved.length) *
                10,
            ) / 10;
      const outstandingGroup = group.filter(
        (item) => boardColumnFor(item.status) === "outstanding",
      );
      const longest = outstandingGroup.reduce((max, item) => {
        const days = daysSinceSent(item, now) ?? 0;
        return Math.max(max, days);
      }, 0);
      return {
        school: group[0].school,
        outstandingCount: outstandingGroup.length,
        averageDaysToApprove: avg,
        longestOutstandingDays: longest,
      };
    })
    .filter((row) => (row.averageDaysToApprove ?? 0) >= 5 || row.outstandingCount > 0)
    .sort(
      (a, b) =>
        (b.averageDaysToApprove ?? 0) - (a.averageDaysToApprove ?? 0) ||
        b.longestOutstandingDays - a.longestOutstandingDays,
    );

  return {
    longestOutstanding: outstanding.slice(0, 8).map((item) => item.sheet),
    slowSchools,
  };
}

/**
 * Timesheet domain service.
 *
 * Weekly Report reads unapproved value from here. The page talks only to
 * this module and timesheetPortalService. Swap the mock in this file later.
 */
export const timesheetService = {
  async list(filters: TimesheetFilters): Promise<{
    sheets: Timesheet[];
    board: TimesheetBoardSummary;
    options: ReturnType<typeof uniqueRefs>;
    escalation: TimesheetEscalation;
    overdueAfterDays: number;
  }> {
    seedIfNeeded();
    const { overdueAfterDays } = await settingsService.getTimesheetChaseSettings();
    const now = new Date();
    const periodRows = sheets
      .filter((sheet) => sheet.periodId === filters.periodId)
      .map((sheet) => applyOverdueFlag(clone(sheet), overdueAfterDays, now));
    const rows = periodRows.filter((sheet) => matches(sheet, filters));
    const allForEscalation = sheets.map((sheet) =>
      applyOverdueFlag(clone(sheet), overdueAfterDays, now),
    );

    return {
      sheets: rows,
      board: summariseBoard(rows),
      options: uniqueRefs(periodRows),
      escalation: buildEscalation(allForEscalation, now),
      overdueAfterDays,
    };
  },

  async getById(id: string): Promise<Timesheet | null> {
    seedIfNeeded();
    const found = sheets.find((sheet) => sheet.id === id);
    return found ? clone(found) : null;
  },

  async getUnapprovedSummary(
    periodId: string,
    consultantId?: string,
  ): Promise<UnapprovedTimesheetSummary> {
    const { sheets: rows } = await this.list({
      periodId,
      consultantId,
      status: "unapproved",
    });
    const billable = rows.filter((row) => row.hasBookings && row.chargeValue > 0);
    return {
      periodId,
      count: billable.length,
      chargeValue: money(billable),
      timesheetIds: billable.map((row) => row.id),
    };
  },

  async sendSheets(input: {
    ids: string[];
    mode: PortalSendMode;
    requestedBy: PartyRef;
  }): Promise<CreateResult<PortalSendResult>> {
    seedIfNeeded();
    const targets = sheets.filter((sheet) => input.ids.includes(sheet.id));
    const result = await timesheetPortalService.triggerSend({
      sheets: targets,
      mode: input.mode,
      requestedBy: input.requestedBy,
    });

    for (const id of result.queuedIds) {
      const current = sheets.find((sheet) => sheet.id === id);
      if (!current) continue;
      const next = appendTransition(
        current,
        current.status === "draft" ? "sent" : current.status,
        input.requestedBy,
        {
          note:
            input.mode === "resend"
              ? "Resend recorded (email not live)"
              : "Send recorded (email not live)",
        },
      );
      next.sentAt = next.sentAt ?? result.recordedAt;
      if (current.status === "draft") {
        next.status = "sent";
      }
      replaceSheet(next);
    }

    return demoCreateResult(result);
  },

  async chaseSheets(input: {
    ids: string[];
    requestedBy: PartyRef;
  }): Promise<CreateResult<{ emailLive: false; chasedIds: string[] }>> {
    seedIfNeeded();
    const chasedIds: string[] = [];
    const at = new Date().toISOString();
    for (const id of input.ids) {
      const current = sheets.find((sheet) => sheet.id === id);
      if (!current) continue;
      if (boardColumnFor(current.status) !== "outstanding") continue;
      const next: Timesheet = {
        ...current,
        lastChasedAt: at,
        chaseCount: current.chaseCount + 1,
        history: [
          ...current.history,
          {
            id: `tr-chase-${id}-${current.chaseCount + 1}`,
            from: current.status,
            to: current.status,
            at,
            actor: input.requestedBy,
            note: "Chase recorded (email not live)",
          },
        ],
      };
      replaceSheet(next);
      chasedIds.push(id);
    }
    return demoCreateResult({ emailLive: false, chasedIds });
  },

  async addQueryReply(input: {
    timesheetId: string;
    author: PartyRef;
    body: string;
  }): Promise<WriteResult> {
    seedIfNeeded();
    const current = sheets.find((sheet) => sheet.id === input.timesheetId);
    if (!current?.query) return { ok: false, persisted: false, error: "No open query" };
    const next: Timesheet = {
      ...current,
      query: {
        ...current.query,
        messages: [
          ...current.query.messages,
          {
            id: `msg-${current.query.messages.length + 1}`,
            author: input.author,
            authorRole: "consultant",
            body: input.body,
            at: new Date().toISOString(),
          },
        ],
      },
    };
    replaceSheet(next);
    return demoWriteResult();
  },

  async decideAmendment(input: {
    timesheetId: string;
    decision: HoursAmendmentStatus;
    actor: PartyRef;
  }): Promise<WriteResult> {
    seedIfNeeded();
    const current = sheets.find((sheet) => sheet.id === input.timesheetId);
    if (!current?.query?.amendment) {
      return { ok: false, persisted: false, error: "No proposed hours" };
    }
    if (input.decision === "pending") {
      return { ok: false, persisted: false, error: "Pick accept or reject" };
    }

    const amendment = {
      ...current.query.amendment,
      status: input.decision,
      decidedBy: input.actor,
      decidedAt: new Date().toISOString(),
    };

    let next = clone(current);
    next.query = {
      ...current.query,
      amendment,
      messages: [
        ...current.query.messages,
        {
          id: `msg-decision-${input.decision}`,
          author: input.actor,
          authorRole: "consultant",
          body:
            input.decision === "accepted"
              ? `Accepted amended hours (${amendment.proposedDays} days / ${amendment.proposedHours}h).`
              : "Rejected the proposed hours — original figures stand.",
          at: amendment.decidedAt as string,
        },
      ],
    };

    if (input.decision === "accepted") {
      next.confirmedDays = amendment.proposedDays;
      next.confirmedHours = amendment.proposedHours;
      next.chargeValue = computeChargeTotal(next.cost, amendment.proposedDays);
      next.query.resolvedAt = amendment.decidedAt;
      next.query.resolvedBy = input.actor;
      next.query.resolutionNote = "Consultant accepted school’s proposed hours";
      next.query.whatChanged = `Days ${amendment.originalDays} → ${amendment.proposedDays}; hours ${amendment.originalHours} → ${amendment.proposedHours}`;
      next = appendTransition(next, "resolved", input.actor, {
        note: next.query.whatChanged,
      });
    }

    replaceSheet(next);
    return demoWriteResult();
  },

  async listReadyToInvoice(periodId?: string): Promise<Timesheet[]> {
    seedIfNeeded();
    return sheets
      .filter((sheet) => {
        if (sheet.status !== "approved") return false;
        if (sheet.invoiced || sheet.xeroInvoiceId) return false;
        if (periodId && sheet.periodId !== periodId) return false;
        return true;
      })
      .map(clone);
  },

  async markInvoiced(ids: string[], xeroInvoiceId: string): Promise<WriteResult> {
    seedIfNeeded();
    for (const id of ids) {
      const current = sheets.find((sheet) => sheet.id === id);
      if (!current) continue;
      replaceSheet({ ...current, invoiced: true, xeroInvoiceId });
    }
    return demoWriteResult();
  },

  async clearInvoiceLink(ids: string[]): Promise<WriteResult> {
    seedIfNeeded();
    for (const id of ids) {
      const current = sheets.find((sheet) => sheet.id === id);
      if (!current) continue;
      replaceSheet({ ...current, invoiced: false, xeroInvoiceId: null });
    }
    return demoWriteResult();
  },
};

export function resetTimesheetStoreForTests(now = new Date()) {
  resetDataset({ now });
  seeded = false;
  sheets = [];
  seedIfNeeded();
}
