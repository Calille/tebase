import { useEffect, useState } from "react";
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
import { downloadCsv } from "@/lib/downloadCsv";
import { toastWriteResult } from "@/lib/persistence";
import { formatWeekEnding } from "@/lib/payWeek";
import { payrollService } from "@/services/payroll/payrollService";
import type { PayeExportPreview } from "@/services/payroll/payrollService";
import { PAYE_COLUMN_MAP } from "@/services/payroll/payeFormat";
import type { PayrollPartyRef } from "@/types/payroll";

const PREVIEW_ROWS = 5;

interface PayeExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodId: string;
  exportedBy: PayrollPartyRef | null;
  onExported: () => void;
}

const PayeExportDialog = ({
  open,
  onOpenChange,
  periodId,
  exportedBy,
  onExported,
}: PayeExportDialogProps) => {
  const [preview, setPreview] = useState<PayeExportPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setPreview(null);

    payrollService
      .previewPayeExport(periodId)
      .then((data) => {
        if (!cancelled) setPreview(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not build the PAYE preview.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, periodId]);

  const issues = preview?.issues ?? [];
  const canDownload = Boolean(
    preview && issues.length === 0 && preview.payeCount > 0 && exportedBy,
  );
  const previewRows = preview?.rows.slice(0, PREVIEW_ROWS) ?? [];

  const handleDownload = async () => {
    if (!preview || !exportedBy || !canDownload) return;
    setDownloading(true);
    try {
      downloadCsv(`paye-week-ending-${preview.weekEnding}.csv`, preview.csv);
      const result = await payrollService.recordPayeExport({
        periodId: preview.periodId,
        rowCount: preview.payeCount,
        exportedBy,
      });
      toastWriteResult("PAYE export recorded", result);
      onExported();
      onOpenChange(false);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Export to PAYE</DialogTitle>
          <DialogDescription>
            PAYE workers for week ending{" "}
            {preview ? formatWeekEnding(preview.weekEnding) : "…"}. Column
            headers are placeholders until the bureau file spec is confirmed —
            see{" "}
            <code className="text-xs">src/services/payroll/payeFormat.ts</code>.
          </DialogDescription>
        </DialogHeader>

        {loading && <p className="text-sm text-gray-500">Building preview…</p>}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Preview failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {preview && (
          <div className="space-y-4">
            {issues.length > 0 ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Cannot export until these are fixed</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    {issues.map((issue) => (
                      <li key={`${issue.lineId}-${issue.code}`}>
                        {issue.workerName}: {issue.message}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            ) : preview.payeCount === 0 ? (
              <Alert>
                <AlertDescription>
                  No PAYE workers in this week — nothing to send to payroll.
                </AlertDescription>
              </Alert>
            ) : (
              <p className="text-sm text-gray-600">
                {preview.payeCount} PAYE row
                {preview.payeCount === 1 ? "" : "s"} ready. This file is the
                full PAYE group for the week, not the filtered table view.
                Employer NI, holiday accrual and pension are included as
                modelled on-costs.
              </p>
            )}

            {previewRows.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Preview (first {previewRows.length} of {preview.rows.length})
                </p>
                <div className="max-h-64 overflow-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {PAYE_COLUMN_MAP.map((column) => (
                          <TableHead
                            key={column.key}
                            className="whitespace-nowrap text-xs"
                          >
                            {column.header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewRows.map((row, index) => (
                        <TableRow key={`${row.payrollNumber}-${index}`}>
                          {PAYE_COLUMN_MAP.map((column) => (
                            <TableCell
                              key={column.key}
                              className="whitespace-nowrap text-xs"
                            >
                              {row[column.key] || "—"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleDownload} disabled={!canDownload || downloading}>
            <Download className="mr-2 h-4 w-4" />
            {downloading ? "Recording…" : "Download CSV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PayeExportDialog;
