import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { enGB } from "date-fns/locale";
import { AlertTriangle, Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toastWriteResult } from "@/lib/persistence";
import { formatWeekEnding } from "@/lib/payWeek";
import { invoiceService } from "@/services/invoices/invoiceService";
import { XERO_COLUMN_MAP } from "@/services/invoices/xeroFormat";
import type { Invoice, XeroExportRecord } from "@/types/invoice";
import type { PartyRef } from "@/types/party";

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface XeroExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodId: string;
  exportedBy: PartyRef | null;
  onExported: () => void;
}

const XeroExportDialog = ({
  open,
  onOpenChange,
  periodId,
  exportedBy,
  onExported,
}: XeroExportDialogProps) => {
  const [csv, setCsv] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [already, setAlready] = useState<XeroExportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    invoiceService
      .previewXeroExport(periodId)
      .then((preview) => {
        if (cancelled) return;
        setCsv(preview.csv);
        setInvoices(preview.invoices);
        setAlready(preview.alreadyExported);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not preview export.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, periodId]);

  const handleExport = async () => {
    if (!exportedBy) return;
    setBusy(true);
    try {
      const result = await invoiceService.recordXeroExport({
        periodId,
        exportedBy,
      });
      toastWriteResult("Xero export recorded", result);
      if (result.ok && result.data) {
        downloadCsv(`xero-${periodId}.csv`, result.data.csv);
        onExported();
        onOpenChange(false);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Xero export · week ending {formatWeekEnding(periodId)}</DialogTitle>
          <DialogDescription>
            Column headers live in one config file, same pattern as Mainpay.
            Recording an export is what stops a period being silently exported
            twice — you can still download again, but it is logged.
          </DialogDescription>
        </DialogHeader>
        {already.length > 0 ? (
          <Alert className="border-amber-200 bg-amber-50 text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>This week has already been exported</AlertTitle>
            <AlertDescription>
              Last export{" "}
              {format(parseISO(already[0].exportedAt), "d MMM yyyy HH:mm", {
                locale: enGB,
              })}{" "}
              by {already[0].exportedBy.name} ({already[0].invoiceCount} invoices).
            </AlertDescription>
          </Alert>
        ) : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {loading ? (
          <p className="text-sm text-gray-500">Building preview…</p>
        ) : (
          <>
            <p className="text-xs text-gray-500">
              {invoices.length} issued invoice(s). Headers:{" "}
              {XERO_COLUMN_MAP.map((column) => column.header).join(", ")}
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Bill to</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.number}</TableCell>
                    <TableCell>{invoice.billTo.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {invoice.totals.gross.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={busy || !exportedBy || invoices.length === 0}
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Download and record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default XeroExportDialog;
