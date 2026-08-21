import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { XeroPushRecord } from "@/types/xero";

const SentToXero = ({ records }: { records: XeroPushRecord[] }) => {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-base">Sent to Xero</CardTitle>
        <p className="text-sm text-gray-500">
          Status comes back from Xero. Open the invoice there — Tebase does not
          rebuild the document.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill to</TableHead>
              <TableHead>Xero invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pushed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                  Nothing has been pushed yet. Push and status sync come after
                  OAuth and contact mapping.
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.billTo.name}</TableCell>
                  <TableCell>
                    {record.xeroDeepLink && record.xeroInvoiceNumber ? (
                      <a
                        href={record.xeroDeepLink}
                        className="underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {record.xeroInvoiceNumber}
                      </a>
                    ) : (
                      record.xeroInvoiceId ?? "—"
                    )}
                  </TableCell>
                  <TableCell>{record.xeroStatus ?? record.status}</TableCell>
                  <TableCell className="text-xs">{record.pushedAt}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SentToXero;
