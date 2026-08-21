import { useCallback, useEffect, useState } from "react";
import DemoBanner from "@/components/tebase/shared/DemoBanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { xeroService } from "@/services/invoices/xeroService";
import type { BillTo } from "@/types/billing";
import type {
  XeroAgedDebtSummary,
  XeroConnectionHealth,
  XeroPushRecord,
} from "@/types/xero";
import type { PayWeek } from "@/types/payroll";
import ReadyToInvoiceQueue from "./ReadyToInvoiceQueue";
import SentToXero from "./SentToXero";
import AgedDebtPanel from "./AgedDebtPanel";
import XeroConnectionPanel from "./XeroConnectionPanel";

const Invoices = () => {
  const [tab, setTab] = useState("queue");
  const [weeks, setWeeks] = useState<PayWeek[]>([]);
  const [periodId, setPeriodId] = useState("");
  const [health, setHealth] = useState<XeroConnectionHealth | null>(null);
  const [aged, setAged] = useState<XeroAgedDebtSummary | null>(null);
  const [pushes, setPushes] = useState<XeroPushRecord[]>([]);
  const [billTos, setBillTos] = useState<BillTo[]>([]);

  const loadHealth = useCallback(async () => {
    const next = await xeroService.getConnectionHealth();
    setHealth(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      xeroService.getPayWeeks(),
      xeroService.getCurrentPayWeek(),
      xeroService.getAgedDebt(),
      xeroService.listPushes(),
      xeroService.listBillTos(),
      xeroService.getConnectionHealth(),
    ]).then(([list, current, debt, records, tos, connection]) => {
      if (cancelled) return;
      setWeeks(list);
      setPeriodId(current.id);
      setAged(debt);
      setPushes(records);
      setBillTos(tos);
      setHealth(connection);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <DemoBanner message="Xero owns invoices, VAT and payment. Tebase prepares approved timesheets and pushes drafts. Tokens and the Xero API stay on Edge Functions — never in this browser." />

      <p className="text-sm text-gray-600">
        Pipeline: approved timesheet → ready to invoice → Xero draft. Corrections
        after a push are flagged here and finished in Xero; Tebase does not
        issue credit notes.
      </p>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="queue">Ready to invoice</TabsTrigger>
          <TabsTrigger value="sent">Sent to Xero</TabsTrigger>
          <TabsTrigger value="aged">Aged debt</TabsTrigger>
          <TabsTrigger value="connection">Xero connection</TabsTrigger>
        </TabsList>
        <TabsContent value="queue">
          <ReadyToInvoiceQueue
            weeks={weeks}
            periodId={periodId}
            onPeriodChange={setPeriodId}
            connection={
              health ?? {
                status: "disconnected",
                tenantName: null,
                tenantId: null,
                accessTokenExpiresAt: null,
                refreshTokenExpiresAt: null,
                lastError: null,
              }
            }
          />
        </TabsContent>
        <TabsContent value="sent">
          <SentToXero records={pushes} />
        </TabsContent>
        <TabsContent value="aged">
          <AgedDebtPanel summary={aged} />
        </TabsContent>
        <TabsContent value="connection">
          {health ? (
            <XeroConnectionPanel
              health={health}
              billTos={billTos}
              onRefresh={loadHealth}
            />
          ) : (
            <p className="text-sm text-gray-500">Checking connection…</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Invoices;
