import { useCallback, useEffect, useMemo, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { Link, useSearchParams } from "react-router-dom";
import { Calendar, Mail, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DemoBanner from "@/components/tebase/shared/DemoBanner";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { formatWeekEnding, listPayWeeks, payWeekContaining } from "@/lib/payWeek";
import { isSheetOverdue, timesheetService } from "@/services/timesheets/timesheetService";
import { planFridaySend } from "@/services/timesheets/fridaySend";
import { daysSinceSent } from "@/services/timesheets/mockTimesheets";
import { formatGbp } from "@/types/payroll";
import type { PayWeek } from "@/types/payroll";
import type { PartyRef } from "@/types/party";
import {
  TIMESHEET_QUERY_REASON_LABELS,
  boardColumnFor,
  hoursDelta,
  type Timesheet,
  type TimesheetBoardSummary,
  type TimesheetEscalation,
  type TimesheetStatus,
} from "@/types/timesheet";
import TimesheetDetailDialog, { StatusBadge } from "./TimesheetDetailDialog";

const STATUS_FILTERS: { value: TimesheetStatus | "unapproved" | "all"; label: string }[] =
  [
    { value: "unapproved", label: "Unapproved (not invoiceable)" },
    { value: "all", label: "All statuses" },
    { value: "sent", label: "Sent" },
    { value: "viewed", label: "Viewed" },
    { value: "queried", label: "Queried" },
    { value: "resolved", label: "Resolved" },
    { value: "approved", label: "Approved" },
    { value: "overdue", label: "Overdue" },
    { value: "draft", label: "Draft" },
    { value: "void", label: "Void" },
  ];

function hoursCell(sheet: Timesheet): string {
  const delta = hoursDelta(sheet);
  if (sheet.confirmedHours == null) {
    return `${sheet.expectedDays}d / ${sheet.expectedHours}h expected`;
  }
  const sign = delta != null && delta > 0 ? "+" : "";
  return `${sheet.confirmedDays}d / ${sheet.confirmedHours}h confirmed (${sign}${delta}h vs expected)`;
}

const Timesheets = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const actor: PartyRef | null = user
    ? { id: user.id, name: user.name || user.username || user.email }
    : null;

  const weeks = useMemo(() => listPayWeeks(new Date(), 12), []);
  const defaultWeek = payWeekContaining(new Date()).id;

  const [periodId, setPeriodId] = useState(
    searchParams.get("week") || defaultWeek,
  );
  const [status, setStatus] = useState<TimesheetStatus | "unapproved" | "all">(
    (searchParams.get("status") as TimesheetStatus | "unapproved" | "all") ||
      "unapproved",
  );
  const [schoolId, setSchoolId] = useState("all");
  const [consultantId, setConsultantId] = useState("all");
  const [teacherId, setTeacherId] = useState("all");
  const [search, setSearch] = useState("");
  const [sheets, setSheets] = useState<Timesheet[]>([]);
  const [board, setBoard] = useState<TimesheetBoardSummary | null>(null);
  const [escalation, setEscalation] = useState<TimesheetEscalation | null>(null);
  const [options, setOptions] = useState<{
    schools: PartyRef[];
    consultants: PartyRef[];
    teachers: PartyRef[];
  }>({ schools: [], consultants: [], teachers: [] });
  const [overdueAfterDays, setOverdueAfterDays] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<Timesheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("outstanding");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await timesheetService.list({
        periodId,
        status,
        schoolId: schoolId === "all" ? undefined : schoolId,
        consultantId: consultantId === "all" ? undefined : consultantId,
        teacherId: teacherId === "all" ? undefined : teacherId,
        search,
      });
      setSheets(result.sheets);
      setBoard(result.board);
      setEscalation(result.escalation);
      setOptions(result.options);
      setOverdueAfterDays(result.overdueAfterDays);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load timesheets.");
    } finally {
      setLoading(false);
    }
  }, [periodId, status, schoolId, consultantId, teacherId, search]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.set("week", periodId);
    next.set("status", status);
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only persist week/status
  }, [periodId, status]);

  const outstandingRows = sheets.filter(
    (sheet) => boardColumnFor(sheet.status) === "outstanding",
  );
  const confirmedRows = sheets.filter(
    (sheet) => boardColumnFor(sheet.status) === "confirmed",
  );
  const queriedRows = sheets.filter(
    (sheet) => boardColumnFor(sheet.status) === "queried",
  );

  const toggleAll = (rows: Timesheet[], checked: boolean) => {
    const ids = rows.map((row) => row.id);
    setSelected((current) =>
      checked
        ? [...new Set([...current, ...ids])]
        : current.filter((id) => !ids.includes(id)),
    );
  };

  const handleChase = async () => {
    if (!actor || selected.length === 0) return;
    const result = await timesheetService.chaseSheets({
      ids: selected,
      requestedBy: actor,
    });
    toast({
      title: "Chase recorded — email is not live",
      description: `${result.data?.chasedIds.length ?? 0} sheet(s) marked chased in this session. Nothing was sent to a school.`,
    });
    setSelected([]);
    await load();
  };

  const handleSend = async (mode: "manual" | "resend") => {
    if (!actor) return;
    let ids: string[] = [];
    if (mode === "resend") {
      ids = selected;
    } else {
      const all = await timesheetService.list({ periodId, status: "all" });
      ids = planFridaySend(all.sheets).sendIds;
    }
    if (ids.length === 0) {
      toast({
        title: "Nothing to send",
        description: "Empty weeks and holiday/INSET sheets are skipped.",
      });
      return;
    }
    const result = await timesheetService.sendSheets({
      ids,
      mode,
      requestedBy: actor,
    });
    toast({
      title: "Send recorded — email is not live",
      description: `${result.data?.queuedIds.length ?? 0} queued, ${result.data?.skipped.length ?? 0} skipped. No school email went out.`,
    });
    setSelected([]);
    await load();
  };

  const selectedWeek: PayWeek | undefined = weeks.find((week) => week.id === periodId);

  return (
    <div className="space-y-6">
      <DemoBanner />
      <Alert className="border-amber-200 bg-amber-50 text-amber-950">
        <Mail className="h-4 w-4" />
        <AlertTitle>School email is not live</AlertTitle>
        <AlertDescription>
          Send, resend and chase record the attempt in this session. They do
          not email the school portal. The existing mail helper is still a
          console.log stub.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Select value={periodId} onValueChange={setPeriodId}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <SelectValue />
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
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              className="pl-8"
              placeholder="Search teacher or school"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Select value={schoolId} onValueChange={setSchoolId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="School" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All schools</SelectItem>
              {options.schools.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={consultantId} onValueChange={setConsultantId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Consultant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All consultants</SelectItem>
              {options.consultants.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={teacherId} onValueChange={setTeacherId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teachers</SelectItem>
              {options.teachers.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(value as TimesheetStatus | "unapproved" | "all")
            }
          >
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => handleSend("manual")}>
            Send now (drafts)
          </Button>
          <Button
            variant="outline"
            disabled={selected.length === 0}
            onClick={() => handleSend("resend")}
          >
            Resend selected
          </Button>
          <Button disabled={selected.length === 0} onClick={handleChase}>
            Chase selected
          </Button>
        </div>
      </div>

      {selectedWeek && (
        <p className="text-sm text-gray-600">
          Week ending{" "}
          <span className="font-medium text-gray-900">
            {formatWeekEnding(selectedWeek.weekEnding)}
          </span>
          . Sheets go out with expected hours — Friday 10am is before Friday is
          worked. Overdue after {overdueAfterDays} days
          {" · "}
          <Link to="/settings" className="underline">
            change in Settings
          </Link>
          .
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-amber-200 bg-white md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Cannot invoice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">
              {formatGbp(board?.cannotInvoice.chargeValue ?? 0)}
            </p>
            <p className="text-xs text-gray-500">
              {board?.cannotInvoice.count ?? 0} outstanding + queried
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {formatGbp(board?.outstanding.chargeValue ?? 0)}
            </p>
            <p className="text-xs text-gray-500">
              {board?.outstanding.count ?? 0} sent, not approved
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {formatGbp(board?.confirmed.chargeValue ?? 0)}
            </p>
            <p className="text-xs text-gray-500">
              {board?.confirmed.count ?? 0} approved
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Open queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {formatGbp(board?.queried.chargeValue ?? 0)}
            </p>
            <p className="text-xs text-gray-500">
              {board?.queried.count ?? 0} with a school query
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="outstanding">
            Outstanding ({outstandingRows.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed ({confirmedRows.length})
          </TabsTrigger>
          <TabsTrigger value="queried">
            Open queries ({queriedRows.length})
          </TabsTrigger>
          <TabsTrigger value="escalation">Escalation</TabsTrigger>
        </TabsList>

        <TabsContent value="outstanding">
          <SheetTable
            rows={outstandingRows}
            selected={selected}
            onToggle={(id, checked) =>
              setSelected((current) =>
                checked ? [...current, id] : current.filter((item) => item !== id),
              )
            }
            onToggleAll={(checked) => toggleAll(outstandingRows, checked)}
            onOpen={setDetail}
            overdueAfterDays={overdueAfterDays}
            showOverdue
            loading={loading}
            empty="No outstanding sheets for these filters."
          />
        </TabsContent>
        <TabsContent value="confirmed">
          <SheetTable
            rows={confirmedRows}
            selected={selected}
            onToggle={() => undefined}
            onToggleAll={() => undefined}
            onOpen={setDetail}
            overdueAfterDays={overdueAfterDays}
            showApprover
            loading={loading}
            empty="No approved sheets for these filters."
            hideSelect
          />
        </TabsContent>
        <TabsContent value="queried">
          <SheetTable
            rows={queriedRows}
            selected={selected}
            onToggle={() => undefined}
            onToggleAll={() => undefined}
            onOpen={setDetail}
            overdueAfterDays={overdueAfterDays}
            showQuery
            loading={loading}
            empty="No open queries."
            hideSelect
          />
        </TabsContent>
        <TabsContent value="escalation">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-base">Longest outstanding</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead className="text-right">Days</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(escalation?.longestOutstanding ?? []).map((sheet) => (
                      <TableRow
                        key={sheet.id}
                        className="cursor-pointer"
                        onClick={() => setDetail(sheet)}
                      >
                        <TableCell>{sheet.school.name}</TableCell>
                        <TableCell>{sheet.teacher.name}</TableCell>
                        <TableCell className="text-right">
                          {daysSinceSent(sheet) ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-base">Habitually slow schools</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School</TableHead>
                      <TableHead className="text-right">Avg days to approve</TableHead>
                      <TableHead className="text-right">Still out</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(escalation?.slowSchools ?? []).map((row) => (
                      <TableRow key={row.school.id}>
                        <TableCell>{row.school.name}</TableCell>
                        <TableCell className="text-right">
                          {row.averageDaysToApprove ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.outstandingCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <TimesheetDetailDialog
        sheet={detail}
        open={Boolean(detail)}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
        actor={actor}
        onChanged={async () => {
          if (detail) {
            const fresh = await timesheetService.getById(detail.id);
            if (fresh) setDetail(fresh);
          }
          await load();
        }}
      />
    </div>
  );
};

function SheetTable({
  rows,
  selected,
  onToggle,
  onToggleAll,
  onOpen,
  overdueAfterDays,
  showOverdue,
  showApprover,
  showQuery,
  hideSelect,
  loading,
  empty,
}: {
  rows: Timesheet[];
  selected: string[];
  onToggle: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onOpen: (sheet: Timesheet) => void;
  overdueAfterDays: number;
  showOverdue?: boolean;
  showApprover?: boolean;
  showQuery?: boolean;
  hideSelect?: boolean;
  loading: boolean;
  empty: string;
}) {
  return (
    <Card className="bg-white">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {!hideSelect && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={rows.length > 0 && rows.every((row) => selected.includes(row.id))}
                    onCheckedChange={(checked) => onToggleAll(!!checked)}
                  />
                </TableHead>
              )}
              <TableHead>Teacher</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Consultant</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>Status</TableHead>
              {showOverdue && <TableHead>Age</TableHead>}
              {showApprover && <TableHead>Approver</TableHead>}
              {showQuery && <TableHead>Query</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-gray-500">
                  {loading ? "Loading…" : empty}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((sheet) => {
                const days = daysSinceSent(sheet);
                const overdue = isSheetOverdue(sheet, overdueAfterDays);
                return (
                  <TableRow
                    key={sheet.id}
                    className="cursor-pointer"
                    onClick={() => onOpen(sheet)}
                  >
                    {!hideSelect && (
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                          checked={selected.includes(sheet.id)}
                          onCheckedChange={(checked) => onToggle(sheet.id, !!checked)}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium">{sheet.teacher.name}</TableCell>
                    <TableCell>{sheet.school.name}</TableCell>
                    <TableCell>{sheet.consultant.name}</TableCell>
                    <TableCell className="text-xs">{hoursCell(sheet)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatGbp(sheet.chargeValue)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={sheet.status} />
                    </TableCell>
                    {showOverdue && (
                      <TableCell>
                        {days == null ? "—" : `${days}d`}
                        {overdue ? " · overdue" : ""}
                      </TableCell>
                    )}
                    {showApprover && (
                      <TableCell className="text-xs">
                        {sheet.approverName ?? "—"}
                        {sheet.approvedAt
                          ? ` · ${sheet.approvedAt.slice(0, 16).replace("T", " ")}`
                          : ""}
                      </TableCell>
                    )}
                    {showQuery && (
                      <TableCell className="text-xs">
                        {sheet.query
                          ? `${TIMESHEET_QUERY_REASON_LABELS[sheet.query.reason]} · ${differenceInCalendarDays(new Date(), new Date(sheet.query.openedAt))}d open`
                          : "—"}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default Timesheets;
