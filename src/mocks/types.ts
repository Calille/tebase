import type { AcademicCalendar } from "@/lib/academicCalendar";
import type { BillTo } from "@/types/billing";
import type { PartyRef } from "@/types/party";
import type { PayWeek, PayrollWorkerLine } from "@/types/payroll";
import type { Timesheet } from "@/types/timesheet";
import type { WeeklyReport } from "@/types/weeklyReport";
import type { XeroAgedDebtSummary, XeroPushRecord } from "@/types/xero";
import type { TeacherWithAWR } from "@/types/awr";
import type { Teacher } from "@/services/teacherService";
import type { School } from "@/services/schoolService";
import type { Booking } from "@/services/bookingService";
import type { SeedScenario } from "./constants";
import type { StaffRole } from "./data/roles";
import type { Phase } from "./data/subjects";
import type { RegionArea } from "./data/postcodes";

export type { SeedScenario };

export interface SeedConfig {
  seed: number;
  scenario: SeedScenario;
  now: Date;
}

export interface SeedTeam {
  id: string;
  name: string;
  leaderId: string;
}

export interface SeedConsultant {
  id: string;
  name: string;
  email: string;
  teamId: string;
  role: "consultant" | "team_leader" | "director";
}

export interface SeedTeacher {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  niNumber: string | null;
  payrollNumber: string | null;
  payrollType: "paye" | "umbrella";
  umbrellaProvider: string | null;
  dbsNumber: string;
  dbsExpiry: string;
  dbsExpired: boolean;
  missingReference: boolean;
  subjects: string[];
  keyStages: string[];
  role: StaffRole;
  phase: Phase | "mixed";
  status: "active" | "inactive" | "pending";
  consultantId: string;
  region: string;
  postcode: string;
  address: string;
  payRate: number | null;
  chargeRate: number | null;
  lastBookingDate: string | null;
  blockedFromBookings: boolean;
}

export interface SeedSchool {
  id: string;
  name: string;
  phase: Phase;
  urn: string;
  postcode: string;
  city: string;
  region: string;
  area: RegionArea;
  address: string;
  phone: string;
  website: string;
  matId: string | null;
  matName: string | null;
  standalone: boolean;
  billToId: string;
  thinMargin: boolean;
  droppedMargin: boolean;
  dormant: boolean;
  slowTimesheets: boolean;
  longName: boolean;
  contactName: string;
  contactEmail: string;
}

export interface SeedBookingDay {
  date: string;
  units: number;
  cancelled: boolean;
  cancelReason?: string;
  sameMorningCancel?: boolean;
  earlyFinish?: boolean;
}

export interface SeedBooking {
  id: string;
  reference: string;
  teacherId: string;
  schoolId: string;
  consultantId: string;
  role: StaffRole;
  subject: string;
  keyStage: string | null;
  startDate: string;
  endDate: string;
  days: SeedBookingDay[];
  payRate: number;
  chargeRate: number;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  longTerm: boolean;
  notes?: string;
}

export interface SeedVacancy {
  id: string;
  title: string;
  schoolId: string;
  schoolName: string;
  location: string;
  subject: string;
  type: "full-time" | "part-time" | "temporary";
  startDate: string;
  endDate?: string;
  rate: number;
  status: "open" | "filled" | "closed";
  description: string;
  requirements: string[];
  postedDate: string;
}

export interface SeedComplaint {
  id: string;
  title: string;
  description: string;
  schoolId: string;
  schoolName: string;
  teacherId?: string;
  teacherName?: string;
  status: "open" | "investigating" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  date: string;
}

export interface SeedAlarm {
  id: string;
  title: string;
  description: string;
  type: "system" | "booking" | "teacher" | "school";
  priority: "low" | "medium" | "high" | "critical";
  status: "active" | "acknowledged" | "resolved";
  date: string;
  entityName?: string;
}

export interface SeedNote {
  id: string;
  entityId: string;
  entityType: "teacher" | "school";
  content: string;
  createdAt: string;
  createdByName: string;
}

export type SeedJobGroup = "teacher" | "ta" | "cover_supervisor";

export interface SeedAvailabilityDay {
  status: "available" | "booked" | "off";
  start?: string;
  end?: string;
}

export interface SeedAvailabilityTeacher {
  id: string;
  name: string;
  subject: string;
  jobGroup: SeedJobGroup;
  days: SeedAvailabilityDay[];
}

export interface SeedEdgeCases {
  negativeMarginBookingId: string;
  thinMarginSchoolId: string;
  droppedMarginSchoolId: string;
  idleConsultantId: string;
  emptyWeekStart: string;
  longSchoolNameId: string;
  longTeacherNameId: string;
  specialCharTeacherIds: string[];
  expiredDbsTeacherId: string;
  missingRefTeacherId: string;
  dormantSchoolId: string;
  longTermBookingId: string;
  sameMorningCancelBookingId: string;
  unmappedBillToId: string;
  poRequiredBillToId: string;
  consolidatedTrustBillToId: string;
  awr: {
    week4: string;
    week10: string;
    week11: string;
    week12: string;
    week13: string;
    breakInService: string;
  };
  timesheets: {
    freshOutstanding: string;
    overdue: string;
    approved: string;
    openQuery: string;
    queryWithAmendment: string;
    resolvedThenApproved: string;
    inset: string;
    draftLate: string;
  };
  invoices: {
    aged90: string;
    paid: string;
    partPaid: string;
    dispute: string;
  };
}

export interface SeedDataset {
  config: SeedConfig;
  generatedAt: string;
  calendar: AcademicCalendar;
  weeks: PayWeek[];
  operatingWeek: PayWeek;
  emptyWeek: PayWeek;
  teams: SeedTeam[];
  consultants: SeedConsultant[];
  teachers: SeedTeacher[];
  schools: SeedSchool[];
  billTos: BillTo[];
  bookings: SeedBooking[];
  timesheets: Timesheet[];
  payrollByPeriod: Record<string, PayrollWorkerLine[]>;
  weeklyReports: Record<string, WeeklyReport>;
  awrTeachers: TeacherWithAWR[];
  agedDebt: XeroAgedDebtSummary;
  xeroPushes: XeroPushRecord[];
  vacancies: SeedVacancy[];
  complaints: SeedComplaint[];
  alarms: SeedAlarm[];
  notes: SeedNote[];
  availability: SeedAvailabilityTeacher[];
  teacherProfiles: Teacher[];
  schoolProfiles: School[];
  listBookings: Booking[];
  edgeCases: SeedEdgeCases;
}

export function party(id: string, name: string): PartyRef {
  return { id, name };
}
