import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toastWriteResult } from "@/lib/persistence";
import { formatGbp } from "@/types/payroll";
import type { Invoice } from "@/types/invoice";
import type { PartyRef } from "@/types/party";
import { invoiceService } from "@/services/invoices/invoiceService";

interface CreditNoteDialogProps {
  invoice: Invoice | null;
  actor: PartyRef | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

const CreditNoteDialog = ({
  invoice,
  actor,
  open,
  onOpenChange,
  onChanged,
}: CreditNoteDialogProps) => {
  const [lineIds, setLineIds] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !invoice) return;
    const already = new Set(
      invoice.credits.flatMap((credit) =>
        credit.lines.map((line) => line.invoiceLineId),
      ),
    );
    setLineIds(
      invoice.lines.filter((line) => !already.has(line.id)).map((line) => line.id),
    );
    setReason("");
  }, [open, invoice]);

  const credited = new Set(
    invoice?.credits.flatMap((credit) =>
      credit.lines.map((line) => line.invoiceLineId),
    ) ?? [],
  );
  const available = invoice?.lines.filter((line) => !credited.has(line.id)) ?? [];

  const handleOpen = (next: boolean) => {
    if (next && invoice) {
      setLineIds(available.map((line) => line.id));
      setReason("");
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!invoice || !actor) return;
    setBusy(true);
    try {
      const result = await invoiceService.createCreditNote({
        invoiceId: invoice.id,
        lineIds,
        reason,
        actor,
      });
      toastWriteResult("Credit note recorded", result);
      if (result.ok) {
        onChanged();
        onOpenChange(false);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Credit note · {invoice?.number}</DialogTitle>
          <DialogDescription>
            Issued invoices are not edited. Credit specific lines (full or
            partial by leaving some unselected). Timesheets stay marked invoiced
            — they are not reopened for billing.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          {available.map((line) => (
            <label key={line.id} className="flex items-start gap-2">
              <Checkbox
                checked={lineIds.includes(line.id)}
                onCheckedChange={(checked) =>
                  setLineIds((current) =>
                    checked
                      ? [...current, line.id]
                      : current.filter((id) => id !== line.id),
                  )
                }
              />
              <span>
                {line.teacher.name} · {line.school.name} · {line.dateWorked} ·{" "}
                {formatGbp(line.gross ?? 0)}
              </span>
            </label>
          ))}
          {available.length === 0 ? (
            <p className="text-gray-500">Every line on this invoice is already credited.</p>
          ) : null}
          <div>
            <Label htmlFor="credit-reason">Reason</Label>
            <Textarea
              id="credit-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Why is this being credited?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={busy || !actor || lineIds.length === 0 || !reason.trim()}
            onClick={handleSubmit}
          >
            Issue credit note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreditNoteDialog;
