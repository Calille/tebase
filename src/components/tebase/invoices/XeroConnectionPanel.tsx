import { AlertTriangle, CheckCircle2, Link2Off, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BillTo } from "@/types/billing";
import type { XeroConnectionHealth, XeroConnectionStatus } from "@/types/xero";
import { xeroService } from "@/services/invoices/xeroService";

const STATUS_STYLES: Record<XeroConnectionStatus, string> = {
  connected: "bg-emerald-100 text-emerald-800",
  expiring: "bg-amber-100 text-amber-900",
  disconnected: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<XeroConnectionStatus, string> = {
  connected: "Connected",
  expiring: "Expiring — re-authorise",
  disconnected: "Disconnected",
};

interface XeroConnectionPanelProps {
  health: XeroConnectionHealth;
  billTos: BillTo[];
  onRefresh: () => void;
}

const XeroConnectionPanel = ({
  health,
  billTos,
  onRefresh,
}: XeroConnectionPanelProps) => {
  const authorizeUrl = xeroService.getAuthorizeUrl();

  const handleConnect = () => {
    if (!authorizeUrl) return;
    window.location.assign(authorizeUrl);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Xero connection
            <Badge className={STATUS_STYLES[health.status]}>
              {STATUS_LABELS[health.status]}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Xero does not support talking to it from this SPA. Connect goes to a
            Supabase Edge Function, which holds the client secret and tokens.
            Tokens never reach the browser.
          </p>
          {health.tenantName ? (
            <p>
              Organisation: <span className="font-medium">{health.tenantName}</span>
            </p>
          ) : null}
          {health.lastError ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Connection is not healthy</AlertTitle>
              <AlertDescription>{health.lastError}</AlertDescription>
            </Alert>
          ) : health.status === "connected" ? (
            <Alert className="border-emerald-200 bg-emerald-50">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Connected</AlertTitle>
              <AlertDescription>
                Access token expires{" "}
                {health.accessTokenExpiresAt ?? "unknown"}. Refresh is handled
                server-side before the 30-minute expiry.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-amber-200 bg-amber-50">
              <Link2Off className="h-4 w-4" />
              <AlertTitle>Not connected</AlertTitle>
              <AlertDescription>
                A dead connection must not look fine. Push is blocked until this
                shows Connected.
              </AlertDescription>
            </Alert>
          )}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleConnect} disabled={!authorizeUrl}>
              {health.status === "disconnected" ? "Connect Xero" : "Re-authorise"}
            </Button>
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh health
            </Button>
          </div>
          {!authorizeUrl ? (
            <p className="text-xs text-gray-500">
              Connect needs <code>VITE_SUPABASE_URL</code> so the browser can
              open the Edge Function. It is not set in this session.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-base">Contact mapping</CardTitle>
          <p className="text-sm text-gray-500">
            Next slice — not built yet. Every bill-to must be linked to an
            existing Xero contact, or created explicitly. Tebase will refuse to
            push an unmapped bill-to.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill to</TableHead>
                <TableHead>Xero contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billTos.map((billTo) => (
                <TableRow key={billTo.id}>
                  <TableCell>{billTo.name}</TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {billTo.xeroContactId ?? "Not mapped"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default XeroConnectionPanel;
