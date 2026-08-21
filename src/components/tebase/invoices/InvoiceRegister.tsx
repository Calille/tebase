import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { enGB } from "date-fns/locale";
import { Download, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { formatGbp } from "@/types/payroll";
import {
  ALLOWED_INVOICE_TRANSITIONS,
  INVOICE_STATUS_LABELS,
  type Invoice,
  type InvoiceStatus,
} from "@/types/invoice";
import type { PartyRef } from "@/types/party";
import { invoiceService } from "@/services/invoices/invoiceService";
import { InvoiceDocument } from "./InvoiceDocument";
import CreditNoteDialog from "./CreditNoteDialog";

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

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: "bg-slate-100 text-slate-800",
  issued: "bg-blue-100 text-blue-800",
  sent: "bg-indigo-100 text-indigo-800",
  "part-paid": "bg-amber-100 text-amber-900",
  paid: "bg-emerald-100 text-emerald-800",
  overdue: "bg-red-100 text-red-800",
  disputed: "bg-orange-100 text-orange-900",
  resolved: "bg-sky-100 text-sky-800",
  credited: "bg-purple-100 text-purple-800",
  void: "bg-gray-200 text-gray-700",
};

interface InvoiceRegisterProps {
  invoices: Invoice[];
  actor: PartyRef | null;
  onChanged: () => void;
}

const InvoiceRegister = ({ invoices, actor, onChanged }: InvoiceRegisterProps) => {
  const [open, setOpen] = useState<Invoice | null>(null);
  const [creditFor, setCreditFor] = useState<Invoice | null>(null);
  const [busy, setBusy] = useState(false);

  const rows = useMemo(
    () =>
      [...invoices].sort((a, b) =>
        (b.issueDate ?? "").localeCompare(a.issueDate ?? ""),
      ),
    [invoices],
  );

  const handleTransition = async (invoice: Invoice, to: InvoiceStatus) => {
    if (!actor) return;
    setBusy(true);
    try {
      const result = await invoiceService.transitionStatus({
        invoiceId: invoice.id,
        to,
        actor,
      });
      toastWriteResult(`Marked ${INVOICE_STATUS_LABELS[to].toLowerCase()}`, result);
      if (result.ok) onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Card className="bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Bill to</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Net position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-gray-500">
                    No invoices yet.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((invoice) => {
                  const next = ALLOWED_INVOICE_TRANSITIONS[invoice.status];
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <button
                          type="button"
                          className="text-left underline-offset-2 hover:underline"
                          onClick={() => setOpen(invoice)}
                        >
                          {invoice.number ?? "Draft"}
                        </button>
                      </TableCell>
                      <TableCell>{invoice.billTo.name}</TableCell>
                      <TableCell className="text-xs">
                        {invoice.issueDate
                          ? format(parseISO(invoice.issueDate), "d MMM yyyy", {
                              locale: enGB,
                            })
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {invoice.dueDate
                          ? format(parseISO(invoice.dueDate), "d MMM yyyy", {
                              locale: enGB,
                            })
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatGbp(invoice.totals.gross)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatGbp(invoice.netPosition.gross)}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_STYLES[invoice.status]}>
                          {INVOICE_STATUS_LABELS[invoice.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-1 text-right">
                        {next.includes("sent") ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busy || !actor}
                            onClick={() => handleTransition(invoice, "sent")}
                          >
                            Mark sent
                          </Button>
                        ) : null}
                        {invoice.status !== "draft" && invoice.status !== "void" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!actor}
                            onClick={() => setCreditFor(invoice)}
                          >
                            Credit
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={Boolean(open)} onOpenChange={(value) => !value && setOpen(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader className="no-print">
            <DialogTitle>{open?.number ?? "Invoice"}</DialogTitle>
            <DialogDescription>
              Issued invoices are immutable. Use a credit note to correct them.
            </DialogDescription>
          </DialogHeader>
          {open ? <InvoiceDocument invoice={open} /> : null}
          {open && open.history.length > 0 ? (
            <div className="no-print mt-4 text-xs">
              <p className="mb-2 font-medium">Audit trail</p>
              <ul className="space-y-1 text-gray-600">
                {open.history.map((item) => (
                  <li key={item.id}>
                    {item.at.slice(0, 16).replace("T", " ")} · {item.actor.name}:{" "}
                    {item.from ?? "—"} → {item.to}
                    {item.note ? ` — ${item.note}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <DialogFooter className="no-print">
            {open?.number ? (
              <Button
                variant="outline"
                onClick={() =>
                  downloadCsv(
                    `${open.number}-invoice.csv`,
                    invoiceService.emailCsv(open),
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print / PDF
            </Button>
            <Button onClick={() => setOpen(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreditNoteDialog
        invoice={creditFor}
        actor={actor}
        open={Boolean(creditFor)}
        onOpenChange={(value) => {
          if (!value) setCreditFor(null);
        }}
        onChanged={onChanged}
      />
    </>
  );
};

export default InvoiceRegister;
