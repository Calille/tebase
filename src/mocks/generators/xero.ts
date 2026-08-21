import { subDays } from "date-fns";
import type { BillTo } from "@/types/billing";
import { AGE_BUCKETS, xeroInvoiceDeepLink, type XeroAgedDebtSummary, type XeroAgedInvoice } from "@/types/xero";
import { IDS } from "../constants";
import type { PayWeek } from "@/types/payroll";

export function generateAgedDebt(input: {
  now: Date;
  billTos: BillTo[];
  weeks: PayWeek[];
}): XeroAgedDebtSummary {
  const { now, billTos } = input;
  const keep = billTos.find((b) => b.id === IDS.billTos.keepTrust)!;
  const westfield = billTos.find((b) => b.id === IDS.billTos.westfield)!;
  const stmarys = billTos.find((b) => b.id === IDS.billTos.stmarys)!;
  const harbour = billTos.find((b) => b.id === IDS.billTos.harbour)!;
  const make = (
    id: string,
    number: string,
    billTo: BillTo,
    amountDue: number,
    daysAgoIssued: number,
    termsDays: number,
    status: XeroAgedInvoice["status"],
  ): XeroAgedInvoice => {
    const issue = subDays(now, daysAgoIssued);
    const due = subDays(now, Math.max(0, daysAgoIssued - termsDays));
    return {
      xeroInvoiceId: id,
      xeroInvoiceNumber: number,
      xeroDeepLink: xeroInvoiceDeepLink(id),
      billTo: { id: billTo.id, name: billTo.name },
      status,
      amountDue,
      issueDate: issue.toISOString().slice(0, 10),
      dueDate: due.toISOString().slice(0, 10),
    };
  };

  const invoices: XeroAgedInvoice[] = [
    make("xero-inv-fresh", "INV-1001", westfield, 1840, 12, 14, "AUTHORISED"),
    make("xero-inv-60", "INV-0988", stmarys, 2610, 45, 30, "AUTHORISED"),
    make("xero-inv-90wait", "INV-0901", keep, 4120, 70, 30, "AUTHORISED"),
    make("xero-inv-90plus", "INV-0812", harbour, 1985, 140, 30, "AUTHORISED"),
    make("xero-inv-paid", "INV-0970", westfield, 0, 40, 14, "PAID"),
    make("xero-inv-part", "INV-0961", keep, 920, 28, 30, "AUTHORISED"),
    make("xero-inv-dispute", "INV-DISPUTE-0888", stmarys, 2400, 55, 30, "AUTHORISED"),
  ];

  const outstanding = invoices.filter((inv) => inv.amountDue > 0);
  const buckets = AGE_BUCKETS.map((bucket) => {
    const match = outstanding.filter((inv) => {
      if (!inv.dueDate) return false;
      const age = Math.max(
        0,
        Math.round((now.getTime() - new Date(inv.dueDate).getTime()) / 86400000),
      );
      if (bucket === "0-30") return age <= 30;
      if (bucket === "31-60") return age >= 31 && age <= 60;
      if (bucket === "61-90") return age >= 61 && age <= 90;
      return age >= 90;
    });
    return {
      bucket,
      count: match.length,
      outstanding: Math.round(match.reduce((sum, inv) => sum + inv.amountDue, 0) * 100) / 100,
    };
  });

  const byBillToMap = new Map<string, XeroAgedDebtSummary["byBillTo"][number]>();
  for (const inv of outstanding) {
    const existing = byBillToMap.get(inv.billTo.id) ?? {
      billTo: inv.billTo,
      invoiceCount: 0,
      outstanding: 0,
      overdue: 0,
      habituallyLate: inv.billTo.id === IDS.billTos.harbour || inv.billTo.id === IDS.billTos.westfield,
    };
    existing.invoiceCount += 1;
    existing.outstanding += inv.amountDue;
    if (inv.dueDate && inv.dueDate < now.toISOString().slice(0, 10)) {
      existing.overdue += inv.amountDue;
    }
    byBillToMap.set(inv.billTo.id, existing);
  }

  const totalOutstanding = outstanding.reduce((sum, inv) => sum + inv.amountDue, 0);
  const totalOverdue = [...byBillToMap.values()].reduce((sum, row) => sum + row.overdue, 0);

  return {
    totalOutstanding: Math.round(totalOutstanding * 100) / 100,
    totalOverdue: Math.round(totalOverdue * 100) / 100,
    buckets,
    byBillTo: [...byBillToMap.values()],
    invoices,
    source: "xero",
  };
}
