import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Calendar,
  Copy,
  Printer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DemoBanner from "@/components/tebase/shared/DemoBanner";
import { useAuth } from "@/contexts/AuthContext";
import { canViewTeamRollup } from "@/lib/roles";
import { formatWeekEnding } from "@/lib/payWeek";
import { toast } from "@/components/ui/use-toast";
import { weeklyReportService, resolveConsultant } from "@/services/weeklyReport/weeklyReportService";
import { buildWeeklyReportSummary } from "@/services/weeklyReport/summaryText";
import { formatGbp } from "@/types/payroll";
import type { PayWeek } from "@/types/payroll";
import type { WeeklyReport, WeeklyReportScope } from "@/types/weeklyReport";
import ReportStatTiles from "./ReportStatTiles";
import ReportCharts from "./ReportCharts";

const WeeklyReportPageBody = () => {
  const { user } = useAuth();
  const canTeam = canViewTeamRollup(user?.role);
  const myConsultant = useMemo(
    () => resolveConsultant(user ? { id: user.id, name: user.name } : null),
    [user],
  );

  const [weeks, setWeeks] = useState<PayWeek[]>([]);
  const [periodId, setPeriodId] = useState("");
  const [scope, setScope] = useState<WeeklyReportScope>(
    canTeam && !myConsultant ? "team" : "self",
  );
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (!canTeam && scope === "team") setScope("self");
  }, [canTeam, scope]);

  useEffect(() => {
    let cancelled = false;
    async function loadWeeks() {
      try {
        const [list, current] = await Promise.all([
          weeklyReportService.getPayWeeks(),
          weeklyReportService.getCurrentPayWeek(),
        ]);
        if (cancelled) return;
        setWeeks(list);
        setPeriodId(current.id);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load weeks.");
          setLoading(false);
        }
      }
    }
    loadWeeks();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!periodId) return;
    if (scope === "self" && !myConsultant && !canTeam) {
      setReport(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    weeklyReportService
      .getReport({
        periodId,
        scope: scope === "self" && !myConsultant && canTeam ? "team" : scope,
        consultantId: scope === "self" ? myConsultant?.id : undefined,
      })
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load the report.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [periodId, scope, myConsultant, canTeam]);

  const handleCopy = async () => {
    if (!report) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(buildWeeklyReportSummary(report));
      toast({
        title: "Summary copied",
        description: "Paste into Friday’s email.",
      });
    } catch {
      toast({
        title: "Could not copy",
        description: "Clipboard access was blocked. Use Print instead.",
        variant: "destructive",
      });
    } finally {
      setCopying(false);
    }
  };

  const effectiveScope: WeeklyReportScope =
    scope === "self" && !myConsultant && canTeam ? "team" : scope;

  return (
    <div className="space-y-6" id="weekly-report-print">
      <DemoBanner />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Select value={periodId} onValueChange={setPeriodId} disabled={!periodId}>
            <SelectTrigger className="w-full max-w-xl sm:w-[420px]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                <SelectValue placeholder="Select week" />
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
          {report && (
            <p className="text-sm text-gray-600">
              Week ending{" "}
              <span className="font-medium text-gray-900">
                {formatWeekEnding(report.period.weekEnding)}
              </span>
              {" · "}
              {effectiveScope === "team"
                ? "Team roll-up"
                : myConsultant
                  ? myConsultant.name
                  : "My week"}
            </p>
          )}
          {canTeam && (
            <div className="flex items-center gap-2">
              <Switch
                id="team-rollup"
                checked={effectiveScope === "team"}
                onCheckedChange={(checked) =>
                  setScope(checked || !myConsultant ? "team" : "self")
                }
              />
              <Label htmlFor="team-rollup" className="text-sm font-normal">
                Team roll-up
              </Label>
            </div>
          )}
          {scope === "self" && !myConsultant && canTeam && (
            <p className="text-xs text-gray-500">
              Signed-in user is not a consultant in the mock book, so this
              defaults to the team roll-up.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleCopy} disabled={!report || copying}>
            <Copy className="mr-2 h-4 w-4" />
            {copying ? "Copying…" : "Copy Friday summary"}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            disabled={!report}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {loading && !report && (
        <p className="text-sm text-gray-500">Loading this week’s figures…</p>
      )}

      {report && (
        <>
          <ReportStatTiles headlines={report.headlines} />
          <ReportCharts trend={report.marginTrend} />

          <Card className="border-red-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Low margin alerts
              </CardTitle>
              <p className="text-sm font-normal text-gray-500">
                Below {formatGbp(report.thresholds.poundsPerDayFloor)}/day or{" "}
                {report.thresholds.percentFloor}% of charge. Repeat schools are
                grouped.{" "}
                <Link to="/settings" className="underline">
                  Change thresholds in Settings
                </Link>
                .
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {report.lowMargin.length === 0 ? (
                <p className="px-6 py-8 text-sm text-gray-500">
                  Nothing under the floor this week.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School</TableHead>
                      <TableHead>Teachers</TableHead>
                      <TableHead className="text-right">Bookings / days</TableHead>
                      <TableHead className="text-right">Worst £/day</TableHead>
                      <TableHead className="text-right">Worst %</TableHead>
                      <TableHead>Rate pair (worst)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.lowMargin.map((group) => {
                      const worst = group.bookings[0];
                      return (
                        <TableRow key={group.school.id} className="bg-red-50/60">
                          <TableCell className="font-medium">
                            {group.school.name}
                            {group.bookingCount > 1 && (
                              <Badge variant="secondary" className="ml-2">
                                {group.bookingCount} bookings
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {group.teachers.map((t) => t.name).join(", ")}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {group.bookingCount} / {group.days}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-medium text-red-800">
                            {formatGbp(group.worstMarginPerDay)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {group.worstMarginPercent}%
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {worst
                              ? `${formatGbp(worst.payRate)} pay / ${formatGbp(worst.chargeRate)} charge`
                              : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="border-amber-300 bg-amber-50/40">
            <CardHeader>
              <CardTitle className="text-lg">AWR week-12 warnings</CardTitle>
              <p className="text-sm font-normal text-gray-600">
                Teachers who will hit 12 weeks at the same school in the next 3
                weeks. Parity pay is not in the model yet, so margin impact is
                shown as unknown rather than guessed.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {report.awrWarnings.length === 0 ? (
                <p className="px-6 py-8 text-sm text-gray-600">
                  Nobody approaching parity in the next 3 weeks.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Weeks now</TableHead>
                      <TableHead>Until parity</TableHead>
                      <TableHead>Current margin/day</TableHead>
                      <TableHead>Impact at parity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.awrWarnings.map((item) => (
                      <TableRow key={item.teacher.id}>
                        <TableCell className="font-medium">
                          {item.teacher.name}
                        </TableCell>
                        <TableCell>{item.school.name}</TableCell>
                        <TableCell>
                          {item.awrWeeks}w {item.awrDays}d
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-amber-100 text-amber-900">
                            {item.weeksUntilParity} week
                            {item.weeksUntilParity === 1 ? "" : "s"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.currentMarginPerDay == null
                            ? "—"
                            : formatGbp(item.currentMarginPerDay)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          Needs comparable perm rate
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Unapproved timesheets</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-3xl font-bold tabular-nums">
                  {formatGbp(report.unapprovedTimesheets.chargeValue)}
                </p>
                <p className="text-sm text-gray-500">
                  {report.unapprovedTimesheets.count} sheet
                  {report.unapprovedTimesheets.count === 1 ? "" : "s"} this week
                  not yet approved — money you cannot invoice.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link
                  to={`/timesheets?week=${report.period.id}&status=unapproved`}
                >
                  Open those timesheets
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">
                Cancellations & early finishes
              </CardTitle>
              <p className="text-sm font-normal text-gray-500">
                Margin lost this week:{" "}
                <span className="font-medium text-gray-900">
                  {formatGbp(report.interruptionMarginLost)}
                </span>
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {report.interruptions.length === 0 ? (
                <p className="px-6 py-8 text-sm text-gray-500">None this week.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead className="text-right">Days lost</TableHead>
                      <TableHead className="text-right">Margin lost</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.interruptions.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {item.type === "cancellation"
                              ? "Cancellation"
                              : "Early finish"}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.school.name}</TableCell>
                        <TableCell>{item.teacher.name}</TableCell>
                        <TableCell className="text-right">{item.daysLost}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatGbp(item.marginLost)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {item.note}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Fill rate</CardTitle>
              <p className="text-sm font-normal text-gray-500">
                {report.fillRate.filled} filled of {report.fillRate.received}{" "}
                received ({report.fillRate.fillPercent}%).{" "}
                {report.fillRate.lost} lost.
              </p>
            </CardHeader>
            <CardContent>
              {report.fillRate.lossReasons.length === 0 ? (
                <p className="text-sm text-gray-500">No losses recorded.</p>
              ) : (
                <ul className="space-y-2">
                  {report.fillRate.lossReasons.map((item) => (
                    <li
                      key={item.reason}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span>{item.reason}</span>
                      <span className="tabular-nums font-medium">{item.count}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-gray-500">
                Loss reasons are mock labels, not a locked taxonomy.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Dormant schools</CardTitle>
              <p className="text-sm font-normal text-gray-500">
                Regular last half-term, nothing this week. Ordered by what they
                used to be worth.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {report.dormantSchools.length === 0 ? (
                <p className="px-6 py-8 text-sm text-gray-500">None flagged.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School</TableHead>
                      <TableHead>Last half-term</TableHead>
                      <TableHead className="text-right">Weeks active</TableHead>
                      <TableHead className="text-right">Was worth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.dormantSchools.map((item) => (
                      <TableRow key={item.school.id}>
                        <TableCell className="font-medium">
                          {item.school.name}
                        </TableCell>
                        <TableCell>{item.lastHalfTermLabel}</TableCell>
                        <TableCell className="text-right">
                          {item.weeksActiveLastHalfTerm}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatGbp(item.lastHalfTermCharge)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Next week’s forecast</CardTitle>
              <p className="text-sm font-normal text-gray-500">
                Confirmed diary for week ending{" "}
                {formatWeekEnding(report.forecast.period.weekEnding)} —{" "}
                {formatGbp(report.forecast.projectedCharge)} charge,{" "}
                {formatGbp(report.forecast.projectedMargin)} margin.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead className="text-right">Days</TableHead>
                    <TableHead className="text-right">Charge</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.forecast.bookings.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.school.name}</TableCell>
                      <TableCell>{item.teacher.name}</TableCell>
                      <TableCell className="text-right">{item.days}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatGbp(item.chargeTotal)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatGbp(item.marginGbp)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {scope === "self" && !myConsultant && !canTeam && (
        <Alert>
          <AlertTitle>No consultant match</AlertTitle>
          <AlertDescription>
            This login is not in the consultant book, so there is no “my week”
            to show.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default WeeklyReportPageBody;
