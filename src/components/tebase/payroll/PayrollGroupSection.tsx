import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatGbp, type PayrollGroupSummary, type PayrollWorkerLine } from "@/types/payroll";
import { cn } from "@/lib/utils";

interface PayrollGroupSectionProps {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: PayrollGroupSummary;
  lines: PayrollWorkerLine[];
  actions?: ReactNode;
  note: string;
}

function formatRate(line: PayrollWorkerLine): string {
  if (line.cost.payRate == null) return "—";
  const unit = line.rateUnit === "hourly" ? "hr" : "day";
  return `${formatGbp(line.cost.payRate)}/${unit}`;
}

function formatMoneyOrDash(
  line: PayrollWorkerLine,
  value: number,
): string {
  if (line.cost.payRate == null || line.cost.chargeRate == null) return "—";
  return formatGbp(value);
}

const PayrollGroupSection = ({
  title,
  description,
  open,
  onOpenChange,
  summary,
  lines,
  actions,
  note,
}: PayrollGroupSectionProps) => {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <Card className="bg-white">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="-ml-2 h-auto px-2 py-1">
                  <ChevronDown
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0 transition-transform",
                      !open && "-rotate-90",
                    )}
                  />
                  <span className="text-left">
                    <span className="block text-lg font-semibold text-gray-900">
                      {title}
                    </span>
                    <span className="block text-sm font-normal text-gray-500">
                      {description}
                    </span>
                  </span>
                </Button>
              </CollapsibleTrigger>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:pt-1">
              <Badge variant="secondary">
                {summary.workerCount} worker{summary.workerCount === 1 ? "" : "s"}
              </Badge>
              <span className="text-sm font-medium text-gray-700">
                {formatGbp(summary.grossPay)}
              </span>
              {actions}
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <Alert className="border-slate-200 bg-slate-50 text-slate-800">
              <AlertDescription>{note}</AlertDescription>
            </Alert>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Consultant</TableHead>
                    <TableHead>Schools</TableHead>
                    <TableHead className="text-right">Days / hours</TableHead>
                    <TableHead className="text-right">Pay rate</TableHead>
                    <TableHead className="text-right">Gross pay</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                        No workers in this group for the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell className="font-medium">{line.worker.name}</TableCell>
                        <TableCell>{line.consultant.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {line.schools.map((school) => (
                              <Badge key={school.id} variant="outline" className="font-normal">
                                {school.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {line.daysWorked} / {line.hoursWorked}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatRate(line)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {line.cost.payRate == null ? "—" : formatGbp(line.grossPay)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatMoneyOrDash(line, line.marginContribution)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow className="bg-gray-50 font-medium">
                    <TableCell colSpan={3}>
                      Subtotal · {summary.workerCount} worker
                      {summary.workerCount === 1 ? "" : "s"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {summary.daysWorked} / {summary.hoursWorked}
                    </TableCell>
                    <TableCell />
                    <TableCell className="text-right tabular-nums">
                      {formatGbp(summary.grossPay)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatGbp(summary.marginContribution)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default PayrollGroupSection;
