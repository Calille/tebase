import type { PartyRef } from "@/types/party";
import type { Timesheet, TimesheetQuery } from "@/types/timesheet";

/**
 * Integration boundary with the school timesheet portal.
 *
 * That portal already exists outside this app. This is a deliberately
 * small interface — fetch approval status, fetch queries, trigger a send.
 * It is mocked. It is not a guess at the portal’s HTTP API.
 *
 * What we still need from Keep Education (see the end-of-page notes):
 * auth, identifiers, send payload, query webhooks, amendment rules.
 */

export type PortalSendMode = "scheduled" | "manual" | "resend";

export interface PortalApprovalStatus {
  timesheetId: string;
  status: Timesheet["status"];
  viewedAt: string | null;
  approvedAt: string | null;
  approverName: string | null;
}

export interface PortalSendSkip {
  timesheetId: string;
  reason: "no_bookings" | "holiday_inset" | "void" | "already_approved";
}

export interface PortalSendResult {
  /** Always false until a real provider is wired. */
  emailLive: false;
  mode: PortalSendMode;
  queuedIds: string[];
  skipped: PortalSendSkip[];
  recordedAt: string;
  requestedBy: PartyRef;
}

export const timesheetPortalService = {
  async getApprovalStatus(
    sheets: Timesheet[],
  ): Promise<PortalApprovalStatus[]> {
    return sheets.map((sheet) => ({
      timesheetId: sheet.id,
      status: sheet.status,
      viewedAt: sheet.viewedAt,
      approvedAt: sheet.approvedAt,
      approverName: sheet.approverName,
    }));
  },

  async getQueries(sheet: Timesheet): Promise<TimesheetQuery | null> {
    return sheet.query;
  },

  async triggerSend(input: {
    sheets: Timesheet[];
    mode: PortalSendMode;
    requestedBy: PartyRef;
  }): Promise<PortalSendResult> {
    const queuedIds: string[] = [];
    const skipped: PortalSendSkip[] = [];

    for (const sheet of input.sheets) {
      if (sheet.holidayOrInset) {
        skipped.push({ timesheetId: sheet.id, reason: "holiday_inset" });
        continue;
      }
      if (!sheet.hasBookings) {
        skipped.push({ timesheetId: sheet.id, reason: "no_bookings" });
        continue;
      }
      if (sheet.status === "void") {
        skipped.push({ timesheetId: sheet.id, reason: "void" });
        continue;
      }
      if (sheet.status === "approved") {
        skipped.push({ timesheetId: sheet.id, reason: "already_approved" });
        continue;
      }
      queuedIds.push(sheet.id);
    }

    return {
      emailLive: false,
      mode: input.mode,
      queuedIds,
      skipped,
      recordedAt: new Date().toISOString(),
      requestedBy: input.requestedBy,
    };
  },
};
