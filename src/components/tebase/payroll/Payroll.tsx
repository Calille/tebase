import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Download,
  Search,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DemoBanner from "@/components/tebase/shared/DemoBanner";
import { useAuth } from "@/contexts/AuthContext";
import { formatWeekEnding } from "@/lib/payWeek";
import { payrollService } from "@/services/payroll/payrollService";
import {
  formatGbp,
  type MainpayExportRecord,
  type PayWeek,
  type PayrollPartyRef,
  type PayrollRun,
  type PayrollType,
} from "@/types/payroll";
import PayrollGroupSection from "./PayrollGroupSection";
import MainpayExportDialog, { formatExportStamp } from "./MainpayExportDialog";

const Payroll = () => {
  const { user } = useAuth();
  const [weeks, setWeeks] = useState<PayWeek[]>([]);
  const [periodId, setPeriodId] = useState<string>("");
  const [run, setRun] = useState<PayrollRun | null>(null);
  const [exports, setExports] = useState<MainpayExportRecord[]>([]);
  const [consultants, setConsultants] = useState<PayrollPartyRef[]>([]);
  const [schools, setSchools] = useState<PayrollPartyRef[]>([]);
  const [consultantId, setConsultantId] = useState("all");
  const [schoolId, setSchoolId] = useState("all");
  const [payrollType, setPayrollType] = useState<PayrollType | "all">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payeOpen, setPayeOpen] = useState(true);
  const [umbrellaOpen, setUmbrellaOpen] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);

  const exportedBy = user
    ? { id: user.id, name: user.name || user.username || user.email }
    : null;

  useEffect(() => {
    let cancelled = false;

    async function loadWeeks() {
      try {
        const [list, current] = await Promise.all([
          payrollService.getPayWeeks(),
          payrollService.getCurrentPayWeek(),
        ]);
        if (cancelled) return;
        setWeeks(list);
        setPeriodId(current.id);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load pay weeks.");
          setLoading(false);
        }
      }
    }

    loadWeeks();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshExports = useCallback(async (id: string) => {
    const records = await payrollService.getMainpayExports(id);
    setExports(records);
  }, []);

  useEffect(() => {
    if (!periodId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function loadRun() {
      try {
        const [payrollRun, options] = await Promise.all([
          payrollService.getPayrollRun(periodId, {
            consultantId: consultantId === "all" ? undefined : consultantId,
            schoolId: schoolId === "all" ? undefined : schoolId,
            payrollType,
            search,
          }),
          payrollService.getFilterOptions(periodId),
          refreshExports(periodId),
        ]);
        if (cancelled) return;
        setRun(payrollRun);
        setConsultants(options.consultants);
        setSchools(options.schools);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load payroll.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRun();
    return () => {
      cancelled = true;
    };
  }, [periodId, consultantId, schoolId, payrollType, search, refreshExports]);

  const latestExport = exports[0] ?? null;
  const selectedWeek = useMemo(
    () => weeks.find((week) => week.id === periodId),
    [weeks, periodId],
  );

  const payeLines = run?.lines.filter((line) => line.payrollType === "paye") ?? [];
  const umbrellaLines =
    run?.lines.filter((line) => line.payrollType === "umbrella") ?? [];

  return (
    <div className="space-y-6">
      <DemoBanner />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <Select value={periodId} onValueChange={setPeriodId} disabled={!periodId}>
            <SelectTrigger className="w-full max-w-xl sm:w-[420px]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                <SelectValue placeholder="Select pay week" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {weeks.map((week, index) => (
                <SelectItem key={week.id} value={week.id}>
                  {index === 0 ? "Current · " : ""}
                  {week.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedWeek && (
            <p className="text-sm text-gray-600">
              Week ending{" "}
              <span className="font-medium text-gray-900">
                {formatWeekEnding(selectedWeek.weekEnding)}
              </span>
            </p>
          )}
        </div>

        {latestExport ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            <p className="font-medium">Mainpay file already sent this week</p>
            <p>
              {formatExportStamp(latestExport.exportedAt)} · {latestExport.rowCount}{" "}
              rows · {latestExport.exportedBy.name}
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <p className="font-medium">Mainpay file not yet sent this week</p>
            <p>Export from the Umbrella section when the week is ready.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search workers, schools…"
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={consultantId} onValueChange={setConsultantId}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Consultant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All consultants</SelectItem>
            {consultants.map((consultant) => (
              <SelectItem key={consultant.id} value={consultant.id}>
                {consultant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={schoolId} onValueChange={setSchoolId}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="School" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All schools</SelectItem>
            {schools.map((school) => (
              <SelectItem key={school.id} value={school.id}>
                {school.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={payrollType}
          onValueChange={(value) => setPayrollType(value as PayrollType | "all")}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Payroll type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">PAYE and Umbrella</SelectItem>
            <SelectItem value="paye">PAYE only</SelectItem>
            <SelectItem value="umbrella">Umbrella only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="pt-6">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
            Total payroll
          </p>
          <p className="mt-1 text-5xl font-bold tracking-tight text-gray-900 tabular-nums">
            {loading || !run ? "…" : formatGbp(run.totalGrossPay)}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Combined PAYE gross and Umbrella assignment totals for this week.
            Margin is charge − pay; employer on-costs are not in this figure.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">PAYE</p>
                <Badge variant="secondary">
                  <Users className="mr-1 h-3 w-3" />
                  {run?.paye.workerCount ?? 0}
                </Badge>
              </div>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
                {run ? formatGbp(run.paye.grossPay) : "—"}
              </p>
              <p className="text-xs text-gray-500">
                {run?.paye.workerCount ?? 0} worker
                {(run?.paye.workerCount ?? 0) === 1 ? "" : "s"} · paid gross by us
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Umbrella</p>
                <Badge variant="secondary">
                  <Users className="mr-1 h-3 w-3" />
                  {run?.umbrella.workerCount ?? 0}
                </Badge>
              </div>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
                {run ? formatGbp(run.umbrella.grossPay) : "—"}
              </p>
              <p className="text-xs text-gray-500">
                {run?.umbrella.workerCount ?? 0} worker
                {(run?.umbrella.workerCount ?? 0) === 1 ? "" : "s"} · assignment
                rate to Mainpay
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {exports.length > 1 && (
        <p className="text-xs text-gray-500">
          Earlier exports this week:{" "}
          {exports
            .slice(1)
            .map(
              (record) =>
                `${formatExportStamp(record.exportedAt)} (${record.rowCount} rows, ${record.exportedBy.name})`,
            )
            .join(" · ")}
        </p>
      )}

      <PayrollGroupSection
        title="PAYE"
        description="Workers paid gross on Keep Education’s payroll"
        open={payeOpen}
        onOpenChange={setPayeOpen}
        summary={run?.paye ?? {
          payrollType: "paye",
          workerCount: 0,
          daysWorked: 0,
          hoursWorked: 0,
          grossPay: 0,
          chargeTotal: 0,
          marginContribution: 0,
        }}
        lines={payeLines}
        note="PAYE workers are paid gross by us. We owe employer NI, holiday accrual and pension on top of the figures below. Those on-costs are modelled on the record but are not included in margin yet (margin is still charge rate − pay rate)."
      />

      <PayrollGroupSection
        title="Umbrella (Mainpay)"
        description="Assignment rate remitted to the umbrella provider"
        open={umbrellaOpen}
        onOpenChange={setUmbrellaOpen}
        summary={run?.umbrella ?? {
          payrollType: "umbrella",
          workerCount: 0,
          daysWorked: 0,
          hoursWorked: 0,
          grossPay: 0,
          chargeTotal: 0,
          marginContribution: 0,
        }}
        lines={umbrellaLines}
        note="Umbrella workers are paid an assignment rate to Mainpay, who operate PAYE at their end. This subtotal is not like-for-like with PAYE gross — it is what we remit to the umbrella, not take-home pay, and it does not include the same employer on-costs."
        actions={
          <Button
            size="sm"
            onClick={() => setExportOpen(true)}
            disabled={!periodId}
          >
            <Download className="mr-1 h-4 w-4" />
            Export for Mainpay
          </Button>
        }
      />

      {periodId && (
        <MainpayExportDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          periodId={periodId}
          exportedBy={exportedBy}
          onExported={() => {
            void refreshExports(periodId);
          }}
        />
      )}
    </div>
  );
};

export default Payroll;
