import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { enGB } from "date-fns/locale";
import { AlertTriangle } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatWeekEnding } from "@/lib/payWeek";
import { formatGbp } from "@/types/payroll";
import type { PayWeek } from "@/types/payroll";
import type { BillTo } from "@/types/billing";
import { BILL_TO_KIND_LABELS, INVOICE_GROUPING_LABELS } from "@/types/billing";
import { TEACHER_ROLE_LABELS } from "@/types/timesheet";
import type {
  WeekChargeReconciliation,
  XeroCandidateGroup,
  XeroConnectionHealth,
  XeroPushValidationIssue,
} from "@/types/xero";
import {
  ALL_BILLABLE,
  xeroService,
} from "@/services/invoices/xeroService";
import { lineCharge } from "@/services/invoices/pushLines";
import { timesheetService } from "@/services/timesheets/timesheetService";
import { validateXeroPush } from "@/services/invoices/pushValidation";

interface ReadyToInvoiceQueueProps {
  weeks: PayWeek[];
  periodId: string;
  onPeriodChange: (id: string) => void;
  connection: XeroConnectionHealth;
}

const ReadyToInvoiceQueue = ({
  weeks,
  periodId,
  onPeriodChange,
  connection,
}: ReadyToInvoiceQueueProps) => {
  const [billTos, setBillTos] = useState<BillTo[]>([]);
  const [billToId, setBillToId] = useState(ALL_BILLABLE);
  const [groups, setGroups] = useState<XeroCandidateGroup[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [poByBillTo, setPoByBillTo] = useState<Record<string, string>>({});
  const [recon, setRecon] = useState<WeekChargeReconciliation | null>(null);
  const [issuesByGroup, setIssuesByGroup] = useState<Record<string, XeroPushValidationIssue[]>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const connected = connection.status !== "disconnected";

  useEffect(() => {
    xeroService.listBillTos().then(setBillTos);
  }, []);

  useEffect(() => {
    if (!periodId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      xeroService.listCandidateGroups({ periodId, billToId }),
      xeroService.getWeekReconciliation(periodId),
    ])
      .then(([nextGroups, nextRecon]) => {
        if (cancelled) return;
        setGroups(nextGroups);
        setRecon(nextRecon);
        setSelected(nextGroups.flatMap((group) => group.lines.map((line) => line.id)));
        setIssuesByGroup({});
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

  const validateGroup = async (group: XeroCandidateGroup) => {
    const lineIds = group.lines
      .map((line) => line.id)
      .filter((id) => selected.includes(id));
    const lines = group.lines.filter((line) => lineIds.includes(line.id));
    const timesheets = [];
    const seen = new Set<string>();
    for (const line of lines) {
      if (seen.has(line.timesheetId)) continue;
      seen.add(line.timesheetId);
      const sheet = await timesheetService.getById(line.timesheetId);
      if (sheet) timesheets.push(sheet);
    }
    const issues = validateXeroPush({
      billTo: group.billTo,
      poNumber: poByBillTo[group.billTo.id] ?? null,
      lines,
      timesheets,
      connected,
    });
    setIssuesByGroup((current) => ({ ...current, [group.key]: issues }));
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
              ? "Weekly Report charge matches pushed timesheet charge"
              : "Weekly Report charge does not match pushed timesheet charge"}
          </AlertTitle>
          <AlertDescription>
            Week ending {formatWeekEnding(recon.periodId)}: report{" "}
            {formatGbp(recon.weeklyReportCharge)} vs already pushed{" "}
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
          const allChecked =
            lineIds.length > 0 && lineIds.every((id) => selected.includes(id));
          const issues = issuesByGroup[group.key] ?? [];
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
                      {INVOICE_GROUPING_LABELS[group.billTo.grouping]}
                      {group.billTo.xeroContactId
                        ? " · mapped to Xero"
                        : " · not mapped to a Xero contact"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => validateGroup(group)}
                    >
                      Validate
                    </Button>
                    <Button size="sm" disabled title="Push lands after contact mapping">
                      Push to Xero
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
                      placeholder="Sent as the Xero Reference"
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
                          onCheckedChange={(checked) => {
                            const ids = group.lines.map((line) => line.id);
                            setSelected((current) => {
                              const without = current.filter((id) => !ids.includes(id));
                              return checked ? [...without, ...ids] : without;
                            });
                          }}
                        />
                      </TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Units</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Charge</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.lines.map((line) => {
                      const blocked = Boolean(
                        line.rateProblem ||
                          line.unitAmount == null ||
                          line.units <= 0,
                      );
                      const charge = lineCharge(line);
                      return (
                        <TableRow key={line.id} className={blocked ? "bg-red-50" : undefined}>
                          <TableCell>
                            <Checkbox
                              checked={selected.includes(line.id)}
                              onCheckedChange={(checked) =>
                                setSelected((current) =>
                                  checked
                                    ? [...current, line.id]
                                    : current.filter((id) => id !== line.id),
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">{line.teacher.name}</TableCell>
                          <TableCell className="text-xs">
                            {TEACHER_ROLE_LABELS[line.role]}
                          </TableCell>
                          <TableCell>{line.school.name}</TableCell>
                          <TableCell>
                            {format(parseISO(line.dateWorked), "EEE d MMM", {
                              locale: enGB,
                            })}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {line.units} {line.unitType === "hour" ? "h" : "d"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {line.unitAmount == null ? (
                              <span className="text-red-700">No rate</span>
                            ) : (
                              formatGbp(line.unitAmount)
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {charge == null ? "—" : formatGbp(charge)}
                            {blocked ? (
                              <Badge className="ml-2 bg-red-100 text-red-800">Blocked</Badge>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {issues.length > 0 ? (
                  <Alert variant="destructive" className="m-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Cannot push until these are fixed</AlertTitle>
                    <AlertDescription>
                      <ul className="mt-2 list-disc pl-4">
                        {issues.map((issue, index) => (
                          <li key={`${issue.code}-${issue.lineId ?? index}`}>
                            {issue.message}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                ) : null}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default ReadyToInvoiceQueue;
