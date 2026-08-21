import { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";
import DemoBanner from "@/components/tebase/shared/DemoBanner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import {
  invoiceService,
} from "@/services/invoices/invoiceService";
import type { AgedDebtSummary, Invoice } from "@/types/invoice";
import type { PayWeek } from "@/types/payroll";
import InvoiceBuilder from "./InvoiceBuilder";
import InvoiceRegister from "./InvoiceRegister";
import AgedDebtPanel from "./AgedDebtPanel";
import XeroExportDialog from "./XeroExportDialog";

const Invoices = () => {
  const { user } = useAuth();
  const actor = user
    ? { id: user.id, name: user.name || user.username || user.email }
    : null;
  const [tab, setTab] = useState("builder");
  const [weeks, setWeeks] = useState<PayWeek[]>([]);
  const [periodId, setPeriodId] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [aged, setAged] = useState<AgedDebtSummary | null>(null);
  const [xeroOpen, setXeroOpen] = useState(false);

  const load = useCallback(async () => {
    const [list, debt] = await Promise.all([
      invoiceService.listInvoices(),
      invoiceService.getAgedDebt(),
    ]);
    setInvoices(list);
    setAged(debt);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      invoiceService.getPayWeeks(),
      invoiceService.getCurrentPayWeek(),
    ]).then(([list, current]) => {
      if (cancelled) return;
      setWeeks(list);
      setPeriodId(current.id);
    });
    load();
    return () => {
      cancelled = true;
    };
  }, [load]);

  return (
    <div className="space-y-4">
      <DemoBanner message="Invoices are built only from approved timesheets. Sample bill-tos and rates stay in this session — nothing is written to the database. Print uses the browser dialog; there is no generated PDF file." />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Pipeline: approved timesheet → ready to invoice → issued (numbered,
          immutable). Corrections are credit notes.
        </p>
        <Button
          variant="outline"
          disabled={!periodId}
          onClick={() => setXeroOpen(true)}
        >
          <Download className="mr-2 h-4 w-4" />
          Xero CSV
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="register">Issued</TabsTrigger>
          <TabsTrigger value="aged">Aged debt</TabsTrigger>
        </TabsList>
        <TabsContent value="builder">
          <InvoiceBuilder
            weeks={weeks}
            periodId={periodId}
            onPeriodChange={setPeriodId}
            actor={actor}
            onIssued={load}
          />
        </TabsContent>
        <TabsContent value="register">
          <InvoiceRegister invoices={invoices} actor={actor} onChanged={load} />
        </TabsContent>
        <TabsContent value="aged">
          <AgedDebtPanel summary={aged} actor={actor} onChanged={load} />
        </TabsContent>
      </Tabs>

      <XeroExportDialog
        open={xeroOpen}
        onOpenChange={setXeroOpen}
        periodId={periodId}
        exportedBy={actor}
        onExported={load}
      />
    </div>
  );
};

export default Invoices;
