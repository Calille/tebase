import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ComplianceStaffRow } from "@/services/compliance/complianceService";

interface ChaseEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  subject: string;
  body: string;
  recipients: ComplianceStaffRow[];
  sending: boolean;
  onSend: () => void;
}

const ChaseEmailDialog = ({
  open,
  onOpenChange,
  title,
  description,
  subject,
  body,
  recipients,
  sending,
  onSend,
}: ChaseEmailDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Mail is not connected. Queueing records the attempt in this session
            and does not deliver messages.
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">
              Recipients ({recipients.length})
            </p>
            <div className="max-h-40 overflow-auto rounded-md border text-sm">
              {recipients.length === 0 ? (
                <p className="p-3 text-gray-500">Nobody is outstanding.</p>
              ) : (
                <ul className="divide-y">
                  {recipients.map((row) => (
                    <li key={row.teacherId} className="px-3 py-2">
                      <span className="font-medium">{row.name}</span>
                      <span className="text-gray-500"> · {row.email}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500">Subject</p>
            <p className="font-medium">{subject}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Preview</p>
            <div
              className="max-h-56 overflow-auto rounded-md border bg-gray-50 p-3 text-sm"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSend} disabled={sending || recipients.length === 0}>
            <Send className="h-4 w-4 mr-2" />
            {sending ? "Queueing…" : `Queue to ${recipients.length} staff`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChaseEmailDialog;
