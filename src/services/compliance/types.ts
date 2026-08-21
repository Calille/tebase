export type ComplianceCourseId = "safeguarding" | "prevent" | "gdpr-staff" | "equality";

export interface ComplianceCourse {
  id: ComplianceCourseId;
  name: string;
  description: string;
  renewal: string;
  completeCount: number;
  incompleteCount: number;
  completionRate: number;
}

export interface ComplianceStaffRow {
  teacherId: string;
  name: string;
  email: string;
  consultantName: string;
}

export interface ComplianceCourseDetail extends ComplianceCourse {
  incomplete: ComplianceStaffRow[];
}

export type OutstandingDocKind =
  | "dbs"
  | "reference"
  | "ni"
  | "right_to_work"
  | "photo_id";

export interface OutstandingDocumentRow {
  id: string;
  teacherId: string;
  teacherName: string;
  email: string;
  consultantName: string;
  kind: OutstandingDocKind;
  label: string;
  detail: string;
  status: "missing" | "expired";
}

export interface WeeklyDocumentReminderSettings {
  enabled: boolean;
  /** ISO weekday: 1 = Monday … 5 = Friday. */
  weekday: 1 | 2 | 3 | 4 | 5;
  lastSentAt: string | null;
}

export interface WeeklyDocumentReminderState extends WeeklyDocumentReminderSettings {
  nextSendOn: string;
  outstandingCount: number;
  peopleCount: number;
}

export interface ComplianceEmailPreview {
  subject: string;
  body: string;
  recipients: ComplianceStaffRow[];
}

export interface ComplianceSendRecord {
  id: string;
  at: string;
  kind: "course" | "documents";
  title: string;
  subject: string;
  recipientCount: number;
  recipientIds: string[];
}

export interface AgencyPolicyDocument {
  id: string;
  name: string;
  category: string;
  uploadedOn: string;
  expiryOn: string;
  status: "valid" | "review_soon" | "expired";
}
