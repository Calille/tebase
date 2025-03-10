import { Teacher } from "@/services/teacherService";

// AWR Status types
export type AWRStatus = "not-applicable" | "tracking" | "approaching" | "qualified" | "paused";

// School interface
export interface School {
  id: string;
  name: string;
  contactName?: string;
  contactEmail?: string;
}

// Extended Teacher interface with AWR information
export interface TeacherWithAWR extends Teacher {
  awrStatus: AWRStatus;
  awrWeeks: number;
  awrDays: number;
  currentSchool?: string;
  currentSchoolId?: string;
  assignmentStartDate?: string;
  pauseReason?: string;
  awrQualificationDate?: string;
  awrNotificationSent?: boolean;
  awrHistory?: AWRHistoryEntry[];
}

// AWR History entry
export interface AWRHistoryEntry {
  schoolId: string;
  schoolName: string;
  startDate: string;
  endDate?: string;
  weeksCompleted: number;
  status: AWRStatus;
  notes?: string;
}

// Email template structure
export interface EmailTemplate {
  to: string;
  from: string;
  subject: string;
  body: string;
  cc?: string[];
  bcc?: string[];
}

// Email sending result
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
} 