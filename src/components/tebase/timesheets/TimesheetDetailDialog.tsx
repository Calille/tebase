import { useState } from "react";
import { format, parseISO } from "date-fns";
import { enGB } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { timesheetService } from "@/services/timesheets/timesheetService";
import { formatGbp } from "@/types/payroll";
import {
  TIMESHEET_QUERY_REASON_LABELS,
  hoursDelta,
  type Timesheet,
} from "@/types/timesheet";
import type { PartyRef } from "@/types/party";

function stamp(iso: string | null): string {
  if (!iso) return "—";
  return format(parseISO(iso), "d MMM yyyy HH:mm", { locale: enGB });
}

interface TimesheetDetailDialogProps {
  sheet: Timesheet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actor: PartyRef | null;
  onChanged: () => void;
}

const TimesheetDetailDialog = ({
  sheet,
  open,
  onOpenChange,
  actor,
  onChanged,
}: TimesheetDetailDialogProps) => {
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  if (!sheet) return null;

  const delta = hoursDelta(sheet);
  const amendment = sheet.query?.amendment;

  const handleReply = async () => {
    if (!actor || !reply.trim()) return;
    setBusy(true);
    try {
      const result = await timesheetService.addQueryReply({
        timesheetId: sheet.id,
        author: actor,
        body: reply.trim(),
      });
      toastWriteResult("Reply recorded", result);
      if (result.ok) {
        setReply("");
        onChanged();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDecision = async (decision: "accepted" | "rejected") => {
    if (!actor) return;
    setBusy(true);
    try {
      const result = await timesheetService.decideAmendment({
        timesheetId: sheet.id,
        decision,
        actor,
      });
      toastWriteResult(
        decision === "accepted" ? "Amendment accepted" : "Amendment rejected",
        result,
      );
      if (result.ok) onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {sheet.teacher.name} · {sheet.school.name}
          </DialogTitle>
          <DialogDescription>
            {sheet.status} · week ending {sheet.periodId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3 rounded-md border p-3">
            <div>
              <p className="text-xs text-gray-500">Expected (from booking)</p>
              <p className="font-medium">
                {sheet.expectedDays} days / {sheet.expectedHours} h
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Confirmed</p>
              <p className="font-medium">
                {sheet.confirmedDays == null
                  ? "Not yet confirmed"
                  : `${sheet.confirmedDays} days / ${sheet.confirmedHours} h`}
              </p>
            </div>
            {delta != null && delta !== 0 && (
              <div className="col-span-2 rounded bg-amber-50 px-2 py-1 text-amber-900">
                Delta vs expected: {delta > 0 ? "+" : ""}
                {delta} h
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">Charge value</p>
              <p className="font-medium">{formatGbp(sheet.chargeValue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Invoice</p>
              <p className="font-medium">
                {sheet.invoiced
                  ? `On invoice ${sheet.invoiceId}`
                  : sheet.status === "approved"
                    ? "Ready to invoice"
                    : "Not approved"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Approver</p>
              <p className="font-medium">
                {sheet.approverName
                  ? `${sheet.approverName} · ${stamp(sheet.approvedAt)}`
                  : "—"}
              </p>
            </div>
          </div>

          {sheet.workedDays.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-gray-500">Days worked</p>
              <ul className="mt-1 space-y-1 text-xs">
                {sheet.workedDays.map((day) => (
                  <li key={day.date}>
                    {day.date}: {day.units} {day.unitType === "hour" ? "h" : "d"}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {sheet.holidayOrInset && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
              {sheet.holidayLabel ?? "Holiday / INSET — not sent"}
            </p>
          )}

          {sheet.query && (
            <div className="space-y-3 rounded-md border p-3">
              <div>
                <p className="font-medium">
                  Query: {TIMESHEET_QUERY_REASON_LABELS[sheet.query.reason]}
                </p>
                <p className="text-gray-600">{sheet.query.freeText}</p>
                <p className="text-xs text-gray-500">
                  Opened {stamp(sheet.query.openedAt)}
                  {sheet.query.resolvedAt
                    ? ` · resolved ${stamp(sheet.query.resolvedAt)} by ${sheet.query.resolvedBy?.name}`
                    : ""}
                </p>
                {sheet.query.whatChanged && (
                  <p className="mt-1 text-xs text-gray-700">
                    What changed: {sheet.query.whatChanged}
                  </p>
                )}
              </div>

              {amendment && (
                <div className="grid grid-cols-2 gap-3 rounded bg-slate-50 p-3">
                  <div>
                    <p className="text-xs text-gray-500">Original</p>
                    <p>
                      {amendment.originalDays} days / {amendment.originalHours} h
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">School proposed</p>
                    <p>
                      {amendment.proposedDays} days / {amendment.proposedHours} h
                    </p>
                  </div>
                  {amendment.status === "pending" && actor && (
                    <div className="col-span-2 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleDecision("accepted")}
                        disabled={busy}
                      >
                        Accept hours
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDecision("rejected")}
                        disabled={busy}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                  {amendment.status !== "pending" && (
                    <p className="col-span-2 text-xs text-gray-600">
                      {amendment.status} by {amendment.decidedBy?.name} ·{" "}
                      {stamp(amendment.decidedAt ?? null)}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {sheet.query.messages.map((message) => (
                  <div key={message.id} className="rounded-md border px-3 py-2">
                    <p className="text-xs text-gray-500">
                      {message.author.name} · {message.authorRole} ·{" "}
                      {stamp(message.at)}
                    </p>
                    <p>{message.body}</p>
                  </div>
                ))}
              </div>

              {sheet.status === "queried" && actor && (
                <div className="space-y-2">
                  <Textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Reply to the school…"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReply}
                    disabled={busy || !reply.trim()}
                  >
                    Record reply
                  </Button>
                </div>
              )}
            </div>
          )}

          <div>
            <p className="mb-2 font-medium">Audit trail</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>From → to</TableHead>
                  <TableHead>Who</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sheet.history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap text-xs">
                      {stamp(item.at)}
                    </TableCell>
                    <TableCell>
                      {item.from ?? "—"} → {item.to}
                    </TableCell>
                    <TableCell>
                      {item.actor.name}
                      {item.approverName ? ` (${item.approverName})` : ""}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {item.note ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export function StatusBadge({ status }: { status: Timesheet["status"] }) {
  const styles: Record<Timesheet["status"], string> = {
    draft: "bg-slate-100 text-slate-800",
    sent: "bg-blue-100 text-blue-800",
    viewed: "bg-indigo-100 text-indigo-800",
    approved: "bg-emerald-100 text-emerald-800",
    queried: "bg-amber-100 text-amber-900",
    resolved: "bg-sky-100 text-sky-800",
    overdue: "bg-red-100 text-red-800",
    void: "bg-gray-200 text-gray-700",
  };
  return <Badge className={styles[status]}>{status}</Badge>;
}

export default TimesheetDetailDialog;
