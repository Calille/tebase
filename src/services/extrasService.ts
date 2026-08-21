import { format, subDays } from "date-fns";
import { getDataset } from "@/mocks";
import type {
  SeedAlarm,
  SeedComplaint,
  SeedConsultant,
  SeedNote,
  SeedVacancy,
} from "@/mocks/types";
import { STAFF_ROLE_LABELS } from "@/mocks/data/roles";

export interface HrEmployee {
  id: string;
  name: string;
  position: string;
  department: string;
  status: "active" | "inactive" | "on leave";
  joinDate: string;
  avatar: string;
}

export interface HrApplication {
  id: string;
  name: string;
  position: string;
  status: "pending" | "review" | "interview";
  appliedDate: string;
  experience: string;
  avatar: string;
}

export interface RecruitmentApplicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  status: "pending" | "review" | "interview" | "approved" | "rejected";
  appliedDate: string;
  avatar: string;
  resumeUrl?: string;
}

export interface ComplianceItem {
  id: string;
  name: string;
  status: "compliant" | "attention" | "non-compliant";
  lastReview: string;
  nextReview: string;
  completionRate: number;
  description: string;
}

export interface ComplianceAudit {
  id: string;
  date: string;
  action: string;
  user: string;
  details: string;
  status: "completed" | "attention" | "pending";
}

export interface ItUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  status: "active" | "inactive" | "locked";
  permissions: string[];
}

export interface ItSystemLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  ipAddress: string;
  status: "success" | "error";
}

export interface TeamLeaderCard {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  teamSize: number;
  performance: number;
  status: "active" | "on leave" | "training";
  memberNames: string[];
}

export interface OpsSnapshot {
  teacherCount: number;
  activeTeacherCount: number;
  schoolCount: number;
  bookingCount: number;
  bookingsThisWeek: number;
  bookingsThisMonth: number;
  chargeTotal: number;
  payTotal: number;
  marginGbp: number;
  marginPercent: number;
  outstandingTimesheets: number;
  expiredDbs: number;
  missingReferences: number;
}

function avatarFor(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

function roleLabel(consultant: SeedConsultant): string {
  if (consultant.role === "director") return "Director";
  if (consultant.role === "team_leader") return "Team Leader";
  return "Consultant";
}

function gbpDate(iso: string): string {
  return iso.slice(0, 10);
}

function snapshotFromDataset(): OpsSnapshot {
  const dataset = getDataset();
  const current = dataset.weeks[0];
  const monthStart = dataset.config.now.toISOString().slice(0, 7);
  const live = dataset.bookings.filter((booking) => booking.status !== "cancelled");
  const chargeTotal = live.reduce((sum, booking) => {
    const units = booking.days.filter((day) => !day.cancelled).reduce((inner, day) => inner + day.units, 0);
    return sum + booking.chargeRate * units;
  }, 0);
  const payTotal = live.reduce((sum, booking) => {
    const units = booking.days.filter((day) => !day.cancelled).reduce((inner, day) => inner + day.units, 0);
    return sum + booking.payRate * units;
  }, 0);
  const bookingsThisWeek = current
    ? live.filter((booking) =>
        booking.days.some(
          (day) => !day.cancelled && day.date >= current.startsOn && day.date <= current.weekEnding,
        ),
      ).length
    : 0;
  const bookingsThisMonth = live.filter((booking) =>
    booking.days.some((day) => !day.cancelled && day.date.startsWith(monthStart)),
  ).length;
  const marginGbp = chargeTotal - payTotal;
  return {
    teacherCount: dataset.teachers.length,
    activeTeacherCount: dataset.teachers.filter((teacher) => teacher.status === "active").length,
    schoolCount: dataset.schools.length,
    bookingCount: live.length,
    bookingsThisWeek,
    bookingsThisMonth,
    chargeTotal: Math.round(chargeTotal),
    payTotal: Math.round(payTotal),
    marginGbp: Math.round(marginGbp),
    marginPercent: chargeTotal > 0 ? Math.round((marginGbp / chargeTotal) * 1000) / 10 : 0,
    outstandingTimesheets: dataset.timesheets.filter(
      (sheet) => sheet.status === "sent" || sheet.status === "overdue" || sheet.status === "queried",
    ).length,
    expiredDbs: dataset.teachers.filter((teacher) => teacher.dbsExpired).length,
    missingReferences: dataset.teachers.filter((teacher) => teacher.missingReference).length,
  };
}

export const extrasService = {
  async getVacancies(): Promise<SeedVacancy[]> {
    return getDataset().vacancies.map((item) => ({ ...item }));
  },
  async getComplaints(): Promise<SeedComplaint[]> {
    return getDataset().complaints.map((item) => ({ ...item }));
  },
  async getAlarms(): Promise<SeedAlarm[]> {
    return getDataset().alarms.map((item) => ({ ...item }));
  },
  async getNotes(entityId: string, entityType: "teacher" | "school"): Promise<SeedNote[]> {
    return getDataset().notes.filter(
      (note) => note.entityId === entityId && note.entityType === entityType,
    );
  },
  async getConsultants() {
    return getDataset().consultants;
  },
  async getAvailability() {
    return getDataset().availability;
  },
  async getOpsSnapshot(): Promise<OpsSnapshot> {
    return snapshotFromDataset();
  },
  async getHrEmployees(): Promise<HrEmployee[]> {
    const dataset = getDataset();
    const teamName = (teamId: string) =>
      dataset.teams.find((team) => team.id === teamId)?.name ?? "Desk";
    return dataset.consultants.map((consultant) => ({
      id: consultant.id,
      name: consultant.name,
      position: roleLabel(consultant),
      department: teamName(consultant.teamId),
      status: consultant.id === dataset.edgeCases.idleConsultantId ? "on leave" : "active",
      joinDate: gbpDate(subDays(dataset.config.now, 400).toISOString()),
      avatar: avatarFor(consultant.id),
    }));
  },
  async getHrApplications(): Promise<HrApplication[]> {
    const dataset = getDataset();
    return dataset.teachers
      .filter((teacher) => teacher.status === "pending" || teacher.blockedFromBookings)
      .map((teacher, index) => ({
        id: `app-${teacher.id}`,
        name: teacher.name,
        position: STAFF_ROLE_LABELS[teacher.role],
        status: (["pending", "review", "interview"] as const)[index % 3],
        appliedDate: gbpDate(subDays(dataset.config.now, 4 + index).toISOString()),
        experience: `${2 + (index % 6)} years`,
        avatar: avatarFor(teacher.id),
      }));
  },
  async getApplicants(): Promise<RecruitmentApplicant[]> {
    const dataset = getDataset();
    const statuses: RecruitmentApplicant["status"][] = [
      "pending",
      "review",
      "interview",
      "approved",
      "rejected",
    ];
    return dataset.teachers
      .filter((teacher) => teacher.status === "pending" || teacher.blockedFromBookings || teacher.status === "inactive")
      .concat(dataset.teachers.filter((teacher) => teacher.status === "active").slice(0, 6))
      .filter((teacher, index, list) => list.findIndex((item) => item.id === teacher.id) === index)
      .slice(0, 12)
      .map((teacher, index) => ({
        id: `app-${teacher.id}`,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        position: STAFF_ROLE_LABELS[teacher.role],
        experience: `${2 + (index % 8)} years`,
        status: teacher.blockedFromBookings ? "pending" : statuses[index % statuses.length]!,
        appliedDate: gbpDate(subDays(dataset.config.now, 3 + index).toISOString()),
        avatar: avatarFor(teacher.id),
        resumeUrl: "#",
      }));
  },
  async getJobPostings() {
    const vacancies = getDataset().vacancies;
    return vacancies.map((vacancy) => ({
      id: vacancy.id,
      title: vacancy.title,
      department: vacancy.subject,
      type: vacancy.type === "part-time" ? "Part-time" : vacancy.type === "temporary" ? "Temporary" : "Full-time",
      location: vacancy.location,
      postedDate: vacancy.postedDate,
      applicants: Math.max(1, vacancy.title.length % 9),
      status: vacancy.status === "open" ? "active" : vacancy.status,
    }));
  },
  async getComplianceItems(): Promise<ComplianceItem[]> {
    const dataset = getDataset();
    const now = dataset.config.now;
    const dbsOk = dataset.teachers.filter((teacher) => !teacher.dbsExpired).length;
    const refsOk = dataset.teachers.filter((teacher) => !teacher.missingReference).length;
    const total = dataset.teachers.length || 1;
    return [
      {
        id: "comp-dbs",
        name: "DBS Checks",
        status: dbsOk === total ? "compliant" : "non-compliant",
        lastReview: gbpDate(subDays(now, 20).toISOString()),
        nextReview: gbpDate(subDays(now, -345).toISOString()),
        completionRate: Math.round((dbsOk / total) * 100),
        description: `${dataset.teachers.filter((t) => t.dbsExpired).map((t) => t.name).join(", ") || "All"} — expired DBS holds bookings`,
      },
      {
        id: "comp-refs",
        name: "Professional references",
        status: refsOk === total ? "compliant" : "attention",
        lastReview: gbpDate(subDays(now, 12).toISOString()),
        nextReview: gbpDate(subDays(now, -30).toISOString()),
        completionRate: Math.round((refsOk / total) * 100),
        description: "Second professional reference required before a teacher can be booked",
      },
      {
        id: "comp-awr",
        name: "AWR tracking",
        status: "attention",
        lastReview: gbpDate(subDays(now, 2).toISOString()),
        nextReview: gbpDate(subDays(now, -5).toISOString()),
        completionRate: 88,
        description: "Teachers approaching 12 weeks at the same school are flagged on the weekly report",
      },
      {
        id: "comp-gdpr",
        name: "Data Protection",
        status: "compliant",
        lastReview: gbpDate(subDays(now, 40).toISOString()),
        nextReview: gbpDate(subDays(now, -140).toISOString()),
        completionRate: 100,
        description: "GDPR retention for candidate files",
      },
      {
        id: "comp-safeguarding",
        name: "Safeguarding Training",
        status: "attention",
        lastReview: gbpDate(subDays(now, 90).toISOString()),
        nextReview: gbpDate(subDays(now, -20).toISOString()),
        completionRate: 92,
        description: "Annual safeguarding refresh",
      },
    ];
  },
  async getComplianceAudits(): Promise<ComplianceAudit[]> {
    const dataset = getDataset();
    const expired = dataset.teachers.find((teacher) => teacher.dbsExpired);
    const missing = dataset.teachers.find((teacher) => teacher.missingReference);
    const officer = dataset.consultants.find((item) => item.role === "director")?.name ?? "Chris Adey";
    return [
      {
        id: "audit-dbs",
        date: gbpDate(subDays(dataset.config.now, 1).toISOString()),
        action: "DBS Check Verification",
        user: officer,
        details: expired
          ? `Hold on ${expired.name} — certificate ${expired.dbsNumber} expired ${expired.dbsExpiry}`
          : "No expired DBS this run",
        status: expired ? "attention" : "completed",
      },
      {
        id: "audit-ref",
        date: gbpDate(subDays(dataset.config.now, 3).toISOString()),
        action: "Reference file review",
        user: officer,
        details: missing
          ? `${missing.name} is blocked until a second reference is on file`
          : "All active teachers have two references",
        status: missing ? "attention" : "completed",
      },
      {
        id: "audit-payroll",
        date: gbpDate(subDays(dataset.config.now, 6).toISOString()),
        action: "Payroll / timesheet reconcile",
        user: dataset.consultants.find((item) => item.role === "team_leader")?.name ?? "Maya Hernández",
        details: "Seed validator checks payroll days against timesheet confirmed days",
        status: "completed",
      },
    ];
  },
  async getItUsers(): Promise<ItUser[]> {
    const dataset = getDataset();
    return dataset.consultants.map((consultant, index) => {
      const permissions =
        consultant.role === "director"
          ? ["view_schools", "view_bookings", "view_reports", "manage_consultants", "system_settings"]
          : consultant.role === "team_leader"
            ? ["view_schools", "edit_schools", "view_bookings", "edit_bookings", "view_reports"]
            : ["view_schools", "view_bookings"];
      return {
        id: consultant.id,
        name: consultant.name,
        email: consultant.email,
        role: roleLabel(consultant),
        lastLogin: format(subDays(dataset.config.now, index % 5), "yyyy-MM-dd HH:mm"),
        status:
          consultant.id === dataset.edgeCases.idleConsultantId
            ? "inactive"
            : index === dataset.consultants.length - 1
              ? "locked"
              : "active",
        permissions,
      };
    });
  },
  async getItLogs(): Promise<ItSystemLog[]> {
    const dataset = getDataset();
    const desks = dataset.consultants.filter((item) => item.role === "consultant");
    return [
      {
        id: "log-backup",
        timestamp: format(subDays(dataset.config.now, 0), "yyyy-MM-dd HH:mm:ss"),
        user: "System",
        action: "Automated dataset rebuild (deterministic seed)",
        ipAddress: "internal",
        status: "success",
      },
      {
        id: "log-idle",
        timestamp: format(subDays(dataset.config.now, 1), "yyyy-MM-dd HH:mm:ss"),
        user: desks[0]?.name ?? "Alex Patel",
        action: `${dataset.consultants.find((c) => c.id === dataset.edgeCases.idleConsultantId)?.name ?? "Idle consultant"} has zero bookings this week`,
        ipAddress: "192.168.1.14",
        status: "success",
      },
      {
        id: "log-dbs",
        timestamp: format(subDays(dataset.config.now, 2), "yyyy-MM-dd HH:mm:ss"),
        user: "System",
        action: "Compliance hold — expired DBS teacher cannot be booked",
        ipAddress: "internal",
        status: "error",
      },
    ];
  },
  async getItStatus() {
    const snapshot = snapshotFromDataset();
    return {
      database: {
        status: "healthy" as const,
        uptime: "99.98%",
        lastBackup: format(getDataset().config.now, "yyyy-MM-dd 03:00:00"),
      },
      server: {
        status: "healthy" as const,
        uptime: "99.95%",
        load: `${Math.min(80, 12 + snapshot.bookingsThisWeek)}%`,
      },
      storage: {
        status: snapshot.bookingCount > 1000 ? ("warning" as const) : ("healthy" as const),
        used: `${Math.min(92, 40 + Math.round(snapshot.bookingCount / 40))}%`,
        total: "500GB",
      },
    };
  },
  async getTeamLeaders(): Promise<TeamLeaderCard[]> {
    const dataset = getDataset();
    const leader =
      dataset.consultants.find((item) => item.role === "team_leader") ?? dataset.consultants[0]!;
    return dataset.teams.map((team) => {
      const members = dataset.consultants.filter(
        (item) => item.teamId === team.id && item.role === "consultant",
      );
      const weekBookings = dataset.bookings.filter(
        (booking) =>
          members.some((member) => member.id === booking.consultantId) &&
          dataset.weeks[0] &&
          booking.days.some(
            (day) =>
              !day.cancelled &&
              day.date >= dataset.weeks[0]!.startsOn &&
              day.date <= dataset.weeks[0]!.weekEnding,
          ),
      ).length;
      return {
        id: team.id,
        name: leader.name,
        role: "Team Leader",
        email: leader.email,
        phone: "07700 900321",
        avatar: avatarFor(leader.id),
        department: team.name,
        teamSize: members.length,
        performance: Math.min(99, 78 + weekBookings),
        status: "active" as const,
        memberNames: members.map((member) => member.name),
      };
    });
  },
};

export function formatGbpCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `£${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `£${Math.round(value / 1000)}k`;
  return `£${value.toLocaleString("en-GB")}`;
}
