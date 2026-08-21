import { useState } from "react";
import { format, parseISO } from "date-fns";
import { enGB } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  CHASE_METHOD_LABELS,
  INVOICE_STATUS_LABELS,
  type AgedDebtSummary,
  type ChaseMethod,
  type Invoice,
} from "@/types/invoice";
import type { PartyRef } from "@/types/party";
import { invoiceService, outstandingAmount } from "@/services/invoices/invoiceService";

interface AgedDebtPanelProps {
  summary: AgedDebtSummary | null;
  actor: PartyRef | null;
  onChanged: () => void;
}

const AgedDebtPanel = ({ summary, actor, onChanged }: AgedDebtPanelProps) => {
  const [chaseFor, setChaseFor] = useState<Invoice | null>(null);
  const [method, setMethod] = useState<ChaseMethod>("email");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChase = async () => {
    if (!chaseFor || !actor) return;
    setBusy(true);
    try {
      const result = await invoiceService.recordChase({
        invoiceId: chaseFor.id,
        method,
        actor,
        note: note.trim() || undefined,
      });
      toastWriteResult("Chase recorded", result);
      if (result.ok) {
        setChaseFor(null);
        setNote("");
        onChanged();
      }
    } finally {
      setBusy(false);
    }
  };

  if (!summary) {
    return <p className="text-sm text-gray-500">Loading aged debt…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">
              {formatGbp(summary.totalOutstanding)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-red-800">
              {formatGbp(summary.totalOverdue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.buckets.map((bucket) => (
          <Card key={bucket.bucket} className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {bucket.bucket} days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold tabular-nums">
                {formatGbp(bucket.outstanding)}
              </p>
              <p className="text-xs text-gray-500">{bucket.count} invoice(s)</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-base">Outstanding by bill-to</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill to</TableHead>
                <TableHead className="text-right">Invoices</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead className="text-right">Overdue</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.byBillTo.map((row) => (
                <TableRow key={row.billTo.id}>
                  <TableCell className="font-medium">
                    {row.billTo.name}
                    {row.habituallyLate ? (
                      <Badge className="ml-2 bg-red-100 text-red-800">
                        Habitually late
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">{row.invoiceCount}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatGbp(row.outstanding)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatGbp(row.overdue)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-base">Open invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Bill to</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead>Last chase</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.invoices.map((invoice) => {
                const lastChase = invoice.chases[invoice.chases.length - 1];
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.number}
                    </TableCell>
                    <TableCell>{invoice.billTo.name}</TableCell>
                    <TableCell>{INVOICE_STATUS_LABELS[invoice.status]}</TableCell>
                    <TableCell className="text-xs">
                      {invoice.dueDate
                        ? format(parseISO(invoice.dueDate), "d MMM yyyy", {
                            locale: enGB,
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatGbp(outstandingAmount(invoice))}
                    </TableCell>
                    <TableCell className="text-xs">
                      {lastChase
                        ? `${format(parseISO(lastChase.at), "d MMM", { locale: enGB })} · ${CHASE_METHOD_LABELS[lastChase.method]} · ${lastChase.actor.name}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!actor}
                        onClick={() => setChaseFor(invoice)}
                      >
                        Record chase
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(chaseFor)}
        onOpenChange={(open) => {
          if (!open) setChaseFor(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record chase · {chaseFor?.number}</DialogTitle>
            <DialogDescription>
              Records that a chase happened. Email is not sent from this screen.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Method</Label>
              <Select
                value={method}
                onValueChange={(value) => setMethod(value as ChaseMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CHASE_METHOD_LABELS) as ChaseMethod[]).map(
                    (item) => (
                      <SelectItem key={item} value={item}>
                        {CHASE_METHOD_LABELS[item]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="chase-note">Note</Label>
              <Textarea
                id="chase-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Who you spoke to, what they said"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChaseFor(null)}>
              Cancel
            </Button>
            <Button disabled={busy || !actor} onClick={handleChase}>
              Save chase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgedDebtPanel;
