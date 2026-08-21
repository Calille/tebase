import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  Calendar,
  Clock,
  Shield,
  Download,
  Upload,
  Search,
  Plus,
  Mail,
  Bell,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DemoBanner from "@/components/tebase/shared/DemoBanner";
import { toastDemoAction, toastWriteResult } from "@/lib/persistence";
import { extrasService, type ComplianceAudit, type ComplianceItem } from "@/services/extrasService";
import {
  complianceService,
  formatComplianceDate,
  type AgencyPolicyDocument,
  type ComplianceCourse,
  type ComplianceCourseId,
  type ComplianceEmailPreview,
  type OutstandingDocumentRow,
  type WeeklyDocumentReminderState,
} from "@/services/compliance/complianceService";
import ChaseEmailDialog from "./ChaseEmailDialog";

const WEEKDAY_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
};

const Compliance = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<ComplianceAudit[]>([]);
  const [courses, setCourses] = useState<ComplianceCourse[]>([]);
  const [outstanding, setOutstanding] = useState<OutstandingDocumentRow[]>([]);
  const [policies, setPolicies] = useState<AgencyPolicyDocument[]>([]);
  const [weekly, setWeekly] = useState<WeeklyDocumentReminderState | null>(null);
  const [chase, setChase] = useState<ComplianceEmailPreview | null>(null);
  const [chaseTitle, setChaseTitle] = useState("");
  const [chaseOpen, setChaseOpen] = useState(false);
  const [chaseKind, setChaseKind] = useState<"course" | "documents">("course");
  const [chaseCourseId, setChaseCourseId] = useState<ComplianceCourseId | null>(null);
  const [sending, setSending] = useState(false);

  const load = async () => {
    const [items, audits, courseList, docs, policyList, reminder] = await Promise.all([
      extrasService.getComplianceItems(),
      extrasService.getComplianceAudits(),
      complianceService.listCourses(),
      complianceService.listOutstandingDocuments(),
      complianceService.listAgencyPolicies(),
      complianceService.getWeeklyReminder(),
    ]);
    setComplianceItems(items);
    setAuditLogs(audits);
    setCourses(courseList);
    setOutstanding(docs);
    setPolicies(policyList);
    setWeekly(reminder);
  };

  useEffect(() => {
    load();
  }, []);

  const overview = useMemo(() => {
    const total = complianceItems.length || 1;
    const avg = Math.round(
      complianceItems.reduce((sum, item) => sum + item.completionRate, 0) / total,
    );
    const counts = {
      compliant: complianceItems.filter((item) => item.status === "compliant").length,
      attention: complianceItems.filter((item) => item.status === "attention").length,
      "non-compliant": complianceItems.filter((item) => item.status === "non-compliant").length,
    };
    const upcoming = [...complianceItems]
      .sort((a, b) => a.nextReview.localeCompare(b.nextReview))
      .slice(0, 3);
    return { avg, counts, upcoming };
  }, [complianceItems]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
      case "completed":
      case "valid":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "attention":
      case "review_soon":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "non-compliant":
      case "expired":
      case "missing":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
        return <Badge className="bg-green-100 text-green-800">Compliant</Badge>;
      case "attention":
        return <Badge className="bg-amber-100 text-amber-800">Needs Attention</Badge>;
      case "non-compliant":
        return <Badge className="bg-red-100 text-red-800">Non-Compliant</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      case "valid":
        return <Badge className="bg-green-100 text-green-800">Valid</Badge>;
      case "review_soon":
        return <Badge className="bg-amber-100 text-amber-800">Review Soon</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case "missing":
        return <Badge className="bg-red-100 text-red-800">Missing</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const openCourseChase = async (courseId: ComplianceCourseId) => {
    const preview = await complianceService.previewCourseChase(courseId);
    if (!preview) return;
    const course = courses.find((item) => item.id === courseId);
    setChaseCourseId(courseId);
    setChaseKind("course");
    setChaseTitle(`Email incomplete — ${course?.name ?? "course"}`);
    setChase(preview);
    setChaseOpen(true);
  };

  const openDocumentChase = async () => {
    const preview = await complianceService.previewDocumentReminders();
    setChaseCourseId(null);
    setChaseKind("documents");
    setChaseTitle("Weekly document reminders");
    setChase(preview);
    setChaseOpen(true);
  };

  const handleQueue = async () => {
    setSending(true);
    try {
      if (chaseKind === "course" && chaseCourseId) {
        const result = await complianceService.queueCourseChase(chaseCourseId);
        if (!result.ok) {
          toastWriteResult("Course chase", result);
          return;
        }
        toastDemoAction(
          `Queued ${result.data?.recipientCount ?? 0} course emails`,
          "Mail is not connected. Nothing was delivered.",
        );
      } else {
        const result = await complianceService.queueWeeklyDocumentReminders();
        if (!result.ok) {
          toastWriteResult("Document reminders", result);
          return;
        }
        toastDemoAction(
          `Queued ${result.data?.recipientCount ?? 0} document reminders`,
          "Mail is not connected. Nothing was delivered.",
        );
      }
      setChaseOpen(false);
      await load();
    } finally {
      setSending(false);
    }
  };

  const handleWeeklyToggle = async (enabled: boolean) => {
    if (!weekly) return;
    const result = await complianceService.saveWeeklyReminder({
      enabled,
      weekday: weekly.weekday,
    });
    toastWriteResult(enabled ? "Weekly reminders on" : "Weekly reminders off", result);
    await load();
  };

  const handleWeekday = async (value: string) => {
    if (!weekly) return;
    const weekday = Number(value) as 1 | 2 | 3 | 4 | 5;
    const result = await complianceService.saveWeeklyReminder({
      enabled: weekly.enabled,
      weekday,
    });
    toastWriteResult("Reminder day saved", result);
    await load();
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
      <DemoBanner message="Compliance emails are queued in this session only. A mail provider is not connected, so staff will not receive anything." />
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Overall Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{overview.avg}%</p>
                    <p className="text-xs text-gray-500">Compliance rate</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={overview.avg} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Compliant</span>
                    </div>
                    <Badge variant="outline">{overview.counts.compliant}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">Needs Attention</span>
                    </div>
                    <Badge variant="outline">{overview.counts.attention}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Non-Compliant</span>
                    </div>
                    <Badge variant="outline">{overview.counts["non-compliant"]}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Upcoming Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overview.upcoming.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatComplianceDate(item.nextReview)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Compliance Summary</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => toastDemoAction("Export compliance report")}
              >
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Review</TableHead>
                    <TableHead>Next Review</TableHead>
                    <TableHead>Completion</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{formatComplianceDate(item.lastReview)}</TableCell>
                      <TableCell>{formatComplianceDate(item.nextReview)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={item.completionRate} className="h-2 w-24" />
                          <span className="text-sm">{item.completionRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setActiveTab(
                              item.id === "comp-safeguarding" || item.id === "comp-gdpr"
                                ? "training"
                                : "documents",
                            )
                          }
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Compliance Requirements</h2>
            <Button
              className="flex items-center gap-1"
              onClick={() => toastDemoAction("Add requirement")}
            >
              <Plus className="h-4 w-4" />
              Add Requirement
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {complianceItems.map((item) => (
              <Card key={item.id} className="bg-white">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      {item.name}
                    </CardTitle>
                    {getStatusBadge(item.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{item.description}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Last Review</p>
                        <p className="text-sm font-medium">
                          {formatComplianceDate(item.lastReview)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Next Review</p>
                        <p className="text-sm font-medium">
                          {formatComplianceDate(item.nextReview)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">Completion Rate</p>
                        <p className="text-xs font-medium">{item.completionRate}%</p>
                      </div>
                      <Progress value={item.completionRate} className="h-2" />
                    </div>

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setActiveTab(
                            item.id === "comp-safeguarding" || item.id === "comp-gdpr"
                              ? "training"
                              : "documents",
                          )
                        }
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => toastDemoAction("Update requirement")}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Update
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Training courses</h2>
              <p className="text-sm text-gray-500">
                Email everyone who has not completed a course. Mail is not live.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="bg-white">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-3">
                    <CardTitle>{course.name}</CardTitle>
                    <Badge variant="outline">{course.renewal}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{course.description}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Completed</span>
                      <span>
                        {course.completeCount} / {course.completeCount + course.incompleteCount} (
                        {course.completionRate}%)
                      </span>
                    </div>
                    <Progress value={course.completionRate} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {course.incompleteCount} staff outstanding
                    </p>
                    <Button
                      size="sm"
                      className="flex items-center gap-1"
                      disabled={course.incompleteCount === 0}
                      onClick={() => openCourseChase(course.id)}
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Email incomplete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card className="bg-white">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Weekly document reminders
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {weekly
                    ? `${weekly.peopleCount} people, ${weekly.outstandingCount} outstanding items. Next send ${formatComplianceDate(weekly.nextSendOn)}.`
                    : "Loading…"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={weekly?.enabled ?? false}
                    onCheckedChange={handleWeeklyToggle}
                    id="weekly-reminders"
                  />
                  <label htmlFor="weekly-reminders" className="text-sm">
                    {weekly?.enabled ? "On" : "Off"}
                  </label>
                </div>
                <Select
                  value={String(weekly?.weekday ?? 1)}
                  onValueChange={handleWeekday}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {([1, 2, 3, 4, 5] as const).map((day) => (
                      <SelectItem key={day} value={String(day)}>
                        {WEEKDAY_LABELS[day]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="flex items-center gap-1"
                  disabled={!weekly || weekly.peopleCount === 0}
                  onClick={openDocumentChase}
                >
                  <Mail className="h-4 w-4" />
                  Send this week now
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                When a mail provider is connected, Tebase would email each person
                with missing or expired documents every {weekly ? WEEKDAY_LABELS[weekly.weekday] : "Monday"}.
                Turning this on only stores the schedule in this session.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Detail</TableHead>
                    <TableHead>Consultant</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstanding.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-medium">{row.teacherName}</div>
                        <div className="text-xs text-gray-500">{row.email}</div>
                      </TableCell>
                      <TableCell>{row.label}</TableCell>
                      <TableCell className="text-gray-600">{row.detail}</TableCell>
                      <TableCell>{row.consultantName}</TableCell>
                      <TableCell>{getStatusBadge(row.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Agency policy files</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => toastDemoAction("Search documents")}
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
              <Button
                className="flex items-center gap-1"
                onClick={() => toastDemoAction("Upload document")}
              >
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
            </div>
          </div>

          <Card className="bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date Uploaded</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{doc.category}</TableCell>
                      <TableCell>{formatComplianceDate(doc.uploadedOn)}</TableCell>
                      <TableCell>{formatComplianceDate(doc.expiryOn)}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => toastDemoAction(`Download ${doc.name}`)}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Compliance Audit Log</h2>
            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => toastDemoAction("Export audit log")}
            >
              <Download className="h-4 w-4" />
              Export Log
            </Button>
          </div>

          <Card className="bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatComplianceDate(log.date)}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.details}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toastDemoAction("View audit details")}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ChaseEmailDialog
        open={chaseOpen}
        onOpenChange={setChaseOpen}
        title={chaseTitle}
        description="Review the list and the draft. Queueing does not send mail."
        subject={chase?.subject ?? ""}
        body={chase?.body ?? ""}
        recipients={chase?.recipients ?? []}
        sending={sending}
        onSend={handleQueue}
      />
    </div>
  );
};

export default Compliance;
