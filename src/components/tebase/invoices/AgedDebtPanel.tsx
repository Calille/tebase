import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatGbp } from "@/types/payroll";
import type { XeroAgedDebtSummary } from "@/types/xero";
import { format, parseISO } from "date-fns";
import { enGB } from "date-fns/locale";

const AgedDebtPanel = ({ summary }: { summary: XeroAgedDebtSummary | null }) => {
  if (!summary) {
    return <p className="text-sm text-gray-500">Loading aged debt…</p>;
  }

  return (
    <div className="space-y-4">
      {summary.source === "unavailable" ? (
        <p className="text-sm text-gray-600">
          Aged debt is sourced from Xero, not from a local invoice store. Connect
          Xero and enable status sync to fill these buckets.
        </p>
      ) : null}

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.byBillTo.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-gray-500">
                    No Xero outstanding balances yet.
                  </TableCell>
                </TableRow>
              ) : (
                summary.byBillTo.map((row) => (
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-base">Open in Xero</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Bill to</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Amount due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-gray-500">
                    No Xero invoices synced.
                  </TableCell>
                </TableRow>
              ) : (
                summary.invoices.map((invoice) => (
                  <TableRow key={invoice.xeroInvoiceId}>
                    <TableCell className="font-medium">
                      {invoice.xeroDeepLink ? (
                        <a
                          href={invoice.xeroDeepLink}
                          className="underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {invoice.xeroInvoiceNumber ?? invoice.xeroInvoiceId}
                        </a>
                      ) : (
                        invoice.xeroInvoiceNumber ?? invoice.xeroInvoiceId
                      )}
                    </TableCell>
                    <TableCell>{invoice.billTo.name}</TableCell>
                    <TableCell>{invoice.status}</TableCell>
                    <TableCell className="text-xs">
                      {invoice.dueDate
                        ? format(parseISO(invoice.dueDate), "d MMM yyyy", {
                            locale: enGB,
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatGbp(invoice.amountDue)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgedDebtPanel;
