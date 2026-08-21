import { roundGbp } from "@/types/payroll";
import type { PartyRef } from "@/types/party";
import type { BillTo } from "@/types/billing";
import {
  AGE_BUCKETS,
  type WeekChargeReconciliation,
  type XeroAgedDebtSummary,
  type XeroCandidateGroup,
  type XeroConnectionHealth,
  type XeroPushRecord,
  type XeroPushValidationIssue,
} from "@/types/xero";
import { listPayWeeks, payWeekContaining } from "@/lib/payWeek";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { timesheetService } from "@/services/timesheets/timesheetService";
import { weeklyReportService } from "@/services/weeklyReport/weeklyReportService";
import { BILL_TOS, billToById, billToForSchoolId } from "@/services/invoices/mockBillTos";
import { linesFromSheet, splitGroups } from "@/services/invoices/pushLines";
import { validateXeroPush } from "@/services/invoices/pushValidation";

export const ALL_BILLABLE = "all";

const DISCONNECTED: XeroConnectionHealth = {
  status: "disconnected",
  tenantName: null,
  tenantId: null,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: null,
  lastError: null,
};

function cloneBillTo(billTo: BillTo): BillTo {
  return {
    ...billTo,
    schoolIds: [...billTo.schoolIds],
    financeContact: billTo.financeContact ? { ...billTo.financeContact } : null,
    billingAddress: billTo.billingAddress ? { ...billTo.billingAddress } : null,
  };
}

function emptyAgedDebt(): XeroAgedDebtSummary {
  return {
    totalOutstanding: 0,
    totalOverdue: 0,
    buckets: AGE_BUCKETS.map((bucket) => ({
      bucket,
      count: 0,
      outstanding: 0,
    })),
    byBillTo: [],
    invoices: [],
    source: "unavailable",
  };
}

async function invokeHealth(): Promise<XeroConnectionHealth | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.functions.invoke("xero-token-refresh", {
    body: { action: "health" },
  });
  if (error || !data) return null;
  return data as XeroConnectionHealth;
}

export const xeroService = {
  async getConnectionHealth(): Promise<XeroConnectionHealth> {
    const fromEdge = await invokeHealth();
    if (fromEdge) return fromEdge;
    return {
      ...DISCONNECTED,
      lastError: isSupabaseConfigured
        ? "Could not reach the Xero health function."
        : "Xero lives on Supabase Edge Functions. This session has no Supabase config, so the connection is disconnected.",
    };
  },

  /**
   * Browser never talks to Xero. Connect sends the user to our Edge Function,
   * which redirects to Xero's authorize URL.
   */
  getAuthorizeUrl(): string | null {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    if (!url?.startsWith("https://")) return null;
    return `${url.replace(/\/$/, "")}/functions/v1/xero-oauth-callback`;
  },

  async listBillTos(): Promise<BillTo[]> {
    return BILL_TOS.map(cloneBillTo);
  },

  async getBillTo(id: string): Promise<BillTo | null> {
    const found = billToById(id);
    return found ? cloneBillTo(found) : null;
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
  }): Promise<XeroCandidateGroup[]> {
    const ready = await timesheetService.listReadyToInvoice(input.periodId);
    const billTos =
      input.billToId === ALL_BILLABLE
        ? BILL_TOS
        : BILL_TOS.filter((item) => item.id === input.billToId);

    const groups: XeroCandidateGroup[] = [];
    for (const billTo of billTos) {
      const sheets = ready.filter((sheet) =>
        billTo.schoolIds.includes(sheet.school.id),
      );
      const lines = sheets.flatMap(linesFromSheet);
      groups.push(...splitGroups(cloneBillTo(billTo), lines));
    }
    return groups;
  },

  async validateGroup(input: {
    billToId: string;
    lineIds: string[];
    poNumber?: string | null;
    groups: XeroCandidateGroup[];
    connected: boolean;
  }): Promise<XeroPushValidationIssue[]> {
    const billTo = billToById(input.billToId);
    if (!billTo) {
      return [
        {
          code: "unmapped_bill_to",
          message: "Unknown bill-to.",
          billToId: input.billToId,
        },
      ];
    }
    const lines = input.groups
      .filter((group) => group.billTo.id === input.billToId)
      .flatMap((group) => group.lines)
      .filter((line) => input.lineIds.includes(line.id));
    const timesheets = [];
    const seen = new Set<string>();
    for (const line of lines) {
      if (seen.has(line.timesheetId)) continue;
      seen.add(line.timesheetId);
      const sheet = await timesheetService.getById(line.timesheetId);
      if (sheet) timesheets.push(sheet);
    }
    return validateXeroPush({
      billTo,
      poNumber: input.poNumber ?? null,
      lines,
      timesheets,
      connected: input.connected,
    });
  },

  async listPushes(): Promise<XeroPushRecord[]> {
    return [];
  },

  async getAgedDebt(): Promise<XeroAgedDebtSummary> {
    return emptyAgedDebt();
  },

  async getWeekReconciliation(
    periodId: string,
  ): Promise<WeekChargeReconciliation> {
    const report = await weeklyReportService.getReport({
      periodId,
      scope: "team",
    });
    const weeklyReportCharge = report.headlines.charge.current;
    const ready = await timesheetService.list({
      periodId,
      status: "all",
    });
    const invoicedNet = roundGbp(
      ready.sheets
        .filter((sheet) => sheet.invoiced || sheet.xeroInvoiceId)
        .reduce((sum, sheet) => sum + sheet.chargeValue, 0),
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

  billToForSchool: billToForSchoolId,

  connectionActorPlaceholder(): PartyRef {
    return { id: "xero", name: "Xero" };
  },
};
