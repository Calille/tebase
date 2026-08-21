import { useState } from "react";
import { Link2, Link2Off } from "lucide-react";
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
import { toastWriteResult } from "@/lib/persistence";
import { payrollService } from "@/services/payroll/payrollService";
import type { MainpayConnectionHealth } from "@/lib/mainpayConnection";

interface MainpayConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  health: MainpayConnectionHealth;
  onChanged: () => void;
}

const MainpayConnectDialog = ({
  open,
  onOpenChange,
  health,
  onChanged,
}: MainpayConnectDialogProps) => {
  const [busy, setBusy] = useState(false);
  const connected = health.status === "connected";

  const handleConnect = async () => {
    setBusy(true);
    try {
      const result = await payrollService.connectMainpayApi();
      toastWriteResult("Mainpay API connected", result);
      onChanged();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnect = async () => {
    setBusy(true);
    try {
      const result = await payrollService.disconnectMainpayApi();
      toastWriteResult("Mainpay API disconnected", result);
      onChanged();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {connected ? "Mainpay API connection" : "Connect to MP API"}
          </DialogTitle>
          <DialogDescription>
            Live Mainpay API credentials are not configured in this environment.
            CSV export remains the real handoff until Keep have an API spec and
            keys. Connecting here only flips a session flag so the payroll
            screen can show a Connected state.
          </DialogDescription>
        </DialogHeader>

        {connected ? (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
            <Link2 className="h-4 w-4" />
            <AlertTitle>Connected (demo)</AlertTitle>
            <AlertDescription>
              Session marked connected
              {health.connectedAt ? ` at ${health.connectedAt}` : ""}. Nothing
              was sent to Mainpay.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-amber-200 bg-amber-50 text-amber-950">
            <Link2Off className="h-4 w-4" />
            <AlertTitle>Not connected</AlertTitle>
            <AlertDescription>
              There is no Edge Function or API key for Mainpay yet. Use Export
              for Mainpay to download the CSV until that exists.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {connected ? (
            <Button variant="destructive" onClick={handleDisconnect} disabled={busy}>
              Disconnect
            </Button>
          ) : (
            <Button onClick={handleConnect} disabled={busy}>
              <Link2 className="mr-2 h-4 w-4" />
              {busy ? "Connecting…" : "Connect (demo)"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MainpayConnectDialog;
