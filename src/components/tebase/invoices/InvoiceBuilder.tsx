import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { enGB } from "date-fns/locale";
import { AlertTriangle, Download, Printer } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { formatWeekEnding } from "@/lib/payWeek";
import { formatGbp } from "@/types/payroll";
import type { PayWeek } from "@/types/payroll";
import type { BillTo } from "@/types/billing";
import {
  INVOICE_GROUPING_LABELS,
  BILL_TO_KIND_LABELS,
} from "@/types/billing";
import type { Invoice, InvoiceValidationIssue, WeekChargeReconciliation } from "@/types/invoice";
import { TEACHER_ROLE_LABELS } from "@/types/timesheet";
import type { PartyRef } from "@/types/party";
import {
  ALL_BILLABLE,
  invoiceService,
  type InvoiceCandidateGroup,
} from "@/services/invoices/invoiceService";
import { validateInvoiceIssue } from "@/services/invoices/invoiceValidation";
import { timesheetService } from "@/services/timesheets/timesheetService";
import { InvoiceDocument } from "./InvoiceDocument";

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

interface InvoiceBuilderProps {
  weeks: PayWeek[];
  periodId: string;
  onPeriodChange: (id: string) => void;
  actor: PartyRef | null;
  onIssued: () => void;
}

const InvoiceBuilder = ({
  weeks,
  periodId,
  onPeriodChange,
  actor,
  onIssued,
}: InvoiceBuilderProps) => {
  const [billTos, setBillTos] = useState<BillTo[]>([]);
  const [billToId, setBillToId] = useState(ALL_BILLABLE);
  const [groups, setGroups] = useState<InvoiceCandidateGroup[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [poByBillTo, setPoByBillTo] = useState<Record<string, string>>({});
  const [recon, setRecon] = useState<WeekChargeReconciliation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Invoice | null>(null);
  const [previewIssues, setPreviewIssues] = useState<InvoiceValidationIssue[]>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    invoiceService.listBillTos().then(setBillTos);
  }, []);

  useEffect(() => {
    if (!periodId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      invoiceService.listCandidateGroups({ periodId, billToId }),
      invoiceService.getWeekReconciliation(periodId),
    ])
      .then(([nextGroups, nextRecon]) => {
        if (cancelled) return;
        setGroups(nextGroups);
        setRecon(nextRecon);
        setSelected(nextGroups.flatMap((group) => group.lines.map((line) => line.id)));
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load billable lines.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [periodId, billToId]);

  const toggleLine = (id: string, checked: boolean) => {
    setSelected((current) =>
      checked ? [...current, id] : current.filter((item) => item !== id),
    );
  };

  const toggleGroup = (group: InvoiceCandidateGroup, checked: boolean) => {
    const ids = group.lines.map((line) => line.id);
    setSelected((current) => {
      const without = current.filter((id) => !ids.includes(id));
      return checked ? [...without, ...ids] : without;
    });
  };

  const loadIssues = async (group: InvoiceCandidateGroup) => {
    const lineIds = group.lines
      .map((line) => line.id)
      .filter((id) => selected.includes(id));
    const lines = group.lines.filter((line) => lineIds.includes(line.id));
    const timesheets = await Promise.all(
      [...new Set(lines.map((line) => line.timesheetId))].map((id) =>
        timesheetService.getById(id),
      ),
    );
    return validateInvoiceIssue({
      billTo: group.billTo,
      poNumber: poByBillTo[group.billTo.id] ?? null,
      lines,
      timesheets: timesheets.filter((sheet): sheet is NonNullable<typeof sheet> => Boolean(sheet)),
    });
  };

  const handlePreview = async (group: InvoiceCandidateGroup) => {
    if (!actor) return;
    setBusyKey(group.key);
    try {
      const lineIds = group.lines
        .map((line) => line.id)
        .filter((id) => selected.includes(id));
      const result = await invoiceService.previewGroup({
        periodId,
        billToId: group.billTo.id,
        lineIds,
        poNumber: poByBillTo[group.billTo.id] ?? null,
        actor,
      });
      setPreview(result.draft);
      setPreviewIssues(result.issues);
    } finally {
      setBusyKey(null);
    }
  };

  const handleIssue = async (group: InvoiceCandidateGroup) => {
    if (!actor) return;
    setBusyKey(group.key);
    try {
      const lineIds = group.lines
        .map((line) => line.id)
        .filter((id) => selected.includes(id));
      const issues = await loadIssues(group);
      if (issues.length > 0) {
        setPreviewIssues(issues);
        await handlePreview(group);
        return;
      }
      const result = await invoiceService.issue({
        periodId,
        billToId: group.billTo.id,
        lineIds,
        poNumber: poByBillTo[group.billTo.id] ?? null,
        actor,
      });
      toastWriteResult("Invoice issued", result);
      if (result.ok && result.data) {
        setPreview(result.data);
        setPreviewIssues([]);
        onIssued();
      }
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-72">
          <Label>Period</Label>
          <Select value={periodId} onValueChange={onPeriodChange}>
            <SelectTrigger>
              <SelectValue placeholder="Week ending" />
            </SelectTrigger>
            <SelectContent>
              {weeks.map((week) => (
                <SelectItem key={week.id} value={week.id}>
                  {week.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-80">
          <Label>Bill to</Label>
          <Select value={billToId} onValueChange={setBillToId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_BILLABLE}>All billable this week</SelectItem>
              {billTos.map((billTo) => (
                <SelectItem key={billTo.id} value={billTo.id}>
                  {billTo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {recon ? (
        <Alert
          className={
            recon.matches
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50"
          }
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {recon.matches
              ? "Weekly Report charge matches invoiced net"
              : "Weekly Report charge does not match invoiced net"}
          </AlertTitle>
          <AlertDescription>
            Week ending {formatWeekEnding(recon.periodId)}: report{" "}
            {formatGbp(recon.weeklyReportCharge)} vs invoiced{" "}
            {formatGbp(recon.invoicedNet)} (delta {formatGbp(recon.delta)}).
            The report figure is still a mock aggregate, so a mismatch here is
            expected until both sides read the same bookings.
          </AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <p className="text-sm text-red-700">{error}</p>
      ) : loading ? (
        <p className="text-sm text-gray-500">Loading approved, uninvoiced lines…</p>
      ) : groups.length === 0 ? (
        <p className="text-sm text-gray-500">
          No approved uninvoiced timesheets for this period and bill-to.
        </p>
      ) : (
        groups.map((group) => {
          const lineIds = group.lines.map((line) => line.id);
          const selectedLines = group.lines.filter((line) => selected.includes(line.id));
          const allChecked =
            lineIds.length > 0 && lineIds.every((id) => selected.includes(id));
          return (
            <Card key={group.key} className="bg-white">
              <CardHeader className="space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">
                      {group.billTo.name}
                      {group.school ? ` · ${group.school.name}` : ""}
                    </CardTitle>
                    <p className="text-xs text-gray-500">
                      {BILL_TO_KIND_LABELS[group.billTo.kind]} ·{" "}
                      {INVOICE_GROUPING_LABELS[group.billTo.grouping]} ·{" "}
                      {group.billTo.paymentTermsDays} day terms
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!actor || selectedLines.length === 0}
                      onClick={() => handlePreview(group)}
                    >
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      disabled={!actor || selectedLines.length === 0 || busyKey === group.key}
                      onClick={() => handleIssue(group)}
                    >
                      Issue
                    </Button>
                  </div>
                </div>
                {group.billTo.poRequired ? (
                  <div className="max-w-xs">
                    <Label htmlFor={`po-${group.billTo.id}`}>PO number (required)</Label>
                    <Input
                      id={`po-${group.billTo.id}`}
                      value={poByBillTo[group.billTo.id] ?? ""}
                      onChange={(event) =>
                        setPoByBillTo((current) => ({
                          ...current,
                          [group.billTo.id]: event.target.value,
                        }))
                      }
                      placeholder="Enter PO"
                    />
                  </div>
                ) : null}
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={allChecked}
                          onCheckedChange={(checked) => toggleGroup(group, !!checked)}
                        />
                      </TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Units</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                      <TableHead className="text-right">VAT</TableHead>
                      <TableHead className="text-right">Gross</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.lines.map((line) => {
                      const blocked = Boolean(
                        line.rateProblem ||
                          line.chargeRate == null ||
                          line.units <= 0 ||
                          (line.net ?? 0) <= 0,
                      );
                      return (
                        <TableRow key={line.id} className={blocked ? "bg-red-50" : undefined}>
                          <TableCell>
                            <Checkbox
                              checked={selected.includes(line.id)}
                              onCheckedChange={(checked) => toggleLine(line.id, !!checked)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{line.teacher.name}</TableCell>
                          <TableCell className="text-xs">
                            {TEACHER_ROLE_LABELS[line.role]}
                          </TableCell>
                          <TableCell>{line.school.name}</TableCell>
                          <TableCell>
                            {format(parseISO(line.dateWorked), "EEE d MMM", { locale: enGB })}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {line.units} {line.unitType === "hour" ? "h" : "d"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {line.chargeRate == null ? (
                              <span className="text-red-700">No rate</span>
                            ) : (
                              formatGbp(line.chargeRate)
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {line.net == null ? "—" : formatGbp(line.net)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {line.vat == null ? "—" : formatGbp(line.vat)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {line.gross == null ? "—" : formatGbp(line.gross)}
                            {blocked ? (
                              <Badge className="ml-2 bg-red-100 text-red-800">Blocked</Badge>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {group.lines.some((line) => line.rateProblem) ? (
                  <ul className="space-y-1 px-4 py-3 text-xs text-red-800">
                    {group.lines
                      .filter((line) => line.rateProblem)
                      .map((line) => (
                        <li key={`${line.id}-problem`}>{line.rateProblem}</li>
                      ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          );
        })
      )}

      <Dialog
        open={Boolean(preview)}
        onOpenChange={(open) => {
          if (!open) {
            setPreview(null);
            setPreviewIssues([]);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader className="no-print">
            <DialogTitle>
              {preview?.number ? `Invoice ${preview.number}` : "Invoice preview"}
            </DialogTitle>
            <DialogDescription>
              Numbers are assigned on issue. Print uses the browser print dialog
              (no generated PDF file).
            </DialogDescription>
          </DialogHeader>
          {previewIssues.length > 0 ? (
            <Alert variant="destructive" className="no-print">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Cannot issue until these are fixed</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 list-disc pl-4">
                  {previewIssues.map((issue, index) => (
                    <li key={`${issue.code}-${issue.lineId ?? index}`}>{issue.message}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          ) : null}
          {preview ? <InvoiceDocument invoice={preview} /> : null}
          <DialogFooter className="no-print">
            {preview ? (
              <Button
                variant="outline"
                onClick={() =>
                  downloadCsv(
                    `${preview.number ?? "draft"}-invoice.csv`,
                    invoiceService.emailCsv(preview),
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
            <Button onClick={() => setPreview(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceBuilder;
