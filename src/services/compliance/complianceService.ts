import { addYears, format, subDays } from "date-fns";
import { enGB } from "date-fns/locale";
import { getDataset, resetDataset } from "@/mocks";
import { stableBucket } from "@/lib/stableBucket";
import { demoCreateResult, type CreateResult, type WriteResult, demoWriteResult } from "@/lib/persistence";
import { courseChaseEmail, documentReminderEmail } from "./emails";
import { nextWeeklySendOn } from "./schedule";
import type {
  AgencyPolicyDocument,
  ComplianceCourse,
  ComplianceCourseDetail,
  ComplianceCourseId,
  ComplianceEmailPreview,
  ComplianceSendRecord,
  ComplianceStaffRow,
  OutstandingDocKind,
  OutstandingDocumentRow,
  WeeklyDocumentReminderSettings,
  WeeklyDocumentReminderState,
} from "./types";

export type {
  AgencyPolicyDocument,
  ComplianceCourse,
  ComplianceCourseDetail,
  ComplianceCourseId,
  ComplianceEmailPreview,
  ComplianceSendRecord,
  ComplianceStaffRow,
  OutstandingDocumentRow,
  WeeklyDocumentReminderSettings,
  WeeklyDocumentReminderState,
};

const WEEKLY_KEY = "tebase.compliance.weeklyReminder";
const SENDS_KEY = "tebase.compliance.sends";

const DEFAULT_WEEKLY: WeeklyDocumentReminderSettings = {
  enabled: true,
  weekday: 1,
  lastSentAt: null,
};

const COURSES: Array<{
  id: ComplianceCourseId;
  name: string;
  description: string;
  renewal: string;
  incompletePercent: number;
}> = [
  {
    id: "safeguarding",
    name: "Safeguarding (KCSIE)",
    description: "Annual Keeping Children Safe in Education refresh for every worker we send into a school.",
    renewal: "annual",
    incompletePercent: 8,
  },
  {
    id: "prevent",
    name: "Prevent duty",
    description: "Home Office Prevent awareness. Required before unsupervised classroom work.",
    renewal: "every 2 years",
    incompletePercent: 12,
  },
  {
    id: "gdpr-staff",
    name: "Data protection for staff",
    description: "Handling pupil and candidate data under UK GDPR.",
    renewal: "annual",
    incompletePercent: 8,
  },
  {
    id: "equality",
    name: "Equality and diversity",
    description: "Equality Act 2010 briefing for supply staff.",
    renewal: "every 2 years",
    incompletePercent: 10,
  },
];

const DOC_KIND_BY_NAME: Record<string, OutstandingDocKind> = {
  "DBS certificate": "dbs",
  "Professional reference 2": "reference",
  "National Insurance number": "ni",
  "Right to work": "right_to_work",
  "Photo ID": "photo_id",
};

function readJson<T>(key: string): T | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function readWeekly(): WeeklyDocumentReminderSettings {
  const parsed = readJson<Partial<WeeklyDocumentReminderSettings>>(WEEKLY_KEY);
  if (!parsed) return { ...DEFAULT_WEEKLY };
  const weekday = parsed.weekday;
  return {
    enabled: parsed.enabled !== false,
    weekday: weekday === 2 || weekday === 3 || weekday === 4 || weekday === 5 ? weekday : 1,
    lastSentAt: typeof parsed.lastSentAt === "string" ? parsed.lastSentAt : null,
  };
}

function readSends(): ComplianceSendRecord[] {
  const parsed = readJson<ComplianceSendRecord[]>(SENDS_KEY);
  return Array.isArray(parsed) ? parsed : [];
}

function consultantName(consultantId: string): string {
  return getDataset().consultants.find((item) => item.id === consultantId)?.name ?? "Unassigned";
}

function toStaffRow(teacher: { id: string; name: string; email: string; consultantId: string }): ComplianceStaffRow {
  return {
    teacherId: teacher.id,
    name: teacher.name,
    email: teacher.email,
    consultantName: consultantName(teacher.consultantId),
  };
}

function incompleteTeachers(courseId: ComplianceCourseId) {
  const dataset = getDataset();
  const course = COURSES.find((item) => item.id === courseId)!;
  return dataset.teachers.filter((teacher) => {
    if (courseId === "safeguarding" && teacher.dbsExpired) return true;
    if (courseId === "prevent" && teacher.missingReference) return true;
    return stableBucket(`${teacher.id}:${course.id}`, 100) < course.incompletePercent;
  });
}

function buildCourses(): ComplianceCourse[] {
  const total = getDataset().teachers.length || 1;
  return COURSES.map((course) => {
    const incompleteCount = incompleteTeachers(course.id).length;
    const completeCount = Math.max(0, total - incompleteCount);
    return {
      id: course.id,
      name: course.name,
      description: course.description,
      renewal: course.renewal,
      completeCount,
      incompleteCount,
      completionRate: Math.round((completeCount / total) * 100),
    };
  });
}

function outstandingFromProfiles(): OutstandingDocumentRow[] {
  const dataset = getDataset();
  const rows: OutstandingDocumentRow[] = [];
  for (const teacher of dataset.teachers) {
    const profile = dataset.teacherProfiles.find((item) => item.id === teacher.id);
    const documents = profile?.documents ?? [];
    for (const document of documents) {
      const status = document.status === "expired" || document.status === "missing" ? document.status : null;
      if (!status) continue;
      const kind = DOC_KIND_BY_NAME[document.name];
      if (!kind) continue;
      rows.push({
        id: `${teacher.id}:${kind}`,
        teacherId: teacher.id,
        teacherName: teacher.name,
        email: teacher.email,
        consultantName: consultantName(teacher.consultantId),
        kind,
        label: document.name,
        detail:
          status === "expired" && document.expiryDate
            ? `Expired ${document.expiryDate}`
            : "Not on file",
        status,
      });
    }
  }
  return rows.sort((a, b) => a.teacherName.localeCompare(b.teacherName) || a.label.localeCompare(b.label));
}

function policyDocuments(): AgencyPolicyDocument[] {
  const now = getDataset().config.now;
  const stamp = (daysAgo: number, yearsAhead: number) => ({
    uploadedOn: format(subDays(now, daysAgo), "yyyy-MM-dd"),
    expiryOn: format(addYears(subDays(now, daysAgo), yearsAhead), "yyyy-MM-dd"),
  });
  return [
    {
      id: "policy-dbs",
      name: "DBS Check Policy",
      category: "Background Checks",
      ...stamp(98, 1),
      status: "valid",
    },
    {
      id: "policy-hs",
      name: "Health & Safety Certificate",
      category: "Health & Safety",
      ...stamp(120, 1),
      status: "valid",
    },
    {
      id: "policy-gdpr",
      name: "Data Protection Policy",
      category: "Data Protection",
      ...stamp(160, 1),
      status: "review_soon",
    },
    {
      id: "policy-ins",
      name: "Insurance Certificate",
      category: "Insurance",
      uploadedOn: format(subDays(now, 400), "yyyy-MM-dd"),
      expiryOn: format(subDays(now, 40), "yyyy-MM-dd"),
      status: "expired",
    },
  ];
}

function recordSend(entry: Omit<ComplianceSendRecord, "id" | "at">): ComplianceSendRecord {
  const now = getDataset().config.now;
  const record: ComplianceSendRecord = {
    id: `send-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: now.toISOString(),
    ...entry,
  };
  writeJson(SENDS_KEY, [record, ...readSends()].slice(0, 20));
  return record;
}

export const complianceService = {
  async listCourses(): Promise<ComplianceCourse[]> {
    return buildCourses();
  },

  async getCourse(courseId: ComplianceCourseId): Promise<ComplianceCourseDetail | null> {
    const course = buildCourses().find((item) => item.id === courseId);
    if (!course) return null;
    return {
      ...course,
      incomplete: incompleteTeachers(courseId).map(toStaffRow),
    };
  },

  async previewCourseChase(courseId: ComplianceCourseId): Promise<ComplianceEmailPreview | null> {
    const detail = await this.getCourse(courseId);
    if (!detail) return null;
    const preview = courseChaseEmail(detail, detail.incomplete.length);
    return {
      ...preview,
      recipients: detail.incomplete,
    };
  },

  async queueCourseChase(
    courseId: ComplianceCourseId,
  ): Promise<CreateResult<{ emailLive: false; recipientCount: number }>> {
    const preview = await this.previewCourseChase(courseId);
    if (!preview || preview.recipients.length === 0) {
      return {
        ok: false,
        persisted: false,
        data: null,
        error: "No incomplete staff for this course.",
      };
    }
    recordSend({
      kind: "course",
      title: COURSES.find((item) => item.id === courseId)?.name ?? courseId,
      subject: preview.subject,
      recipientCount: preview.recipients.length,
      recipientIds: preview.recipients.map((row) => row.teacherId),
    });
    return demoCreateResult({ emailLive: false, recipientCount: preview.recipients.length });
  },

  async listOutstandingDocuments(): Promise<OutstandingDocumentRow[]> {
    return outstandingFromProfiles();
  },

  async getWeeklyReminder(): Promise<WeeklyDocumentReminderState> {
    const settings = readWeekly();
    const outstanding = outstandingFromProfiles();
    const peopleCount = new Set(outstanding.map((row) => row.teacherId)).size;
    return {
      ...settings,
      nextSendOn: nextWeeklySendOn(getDataset().config.now, settings.weekday, settings.lastSentAt),
      outstandingCount: outstanding.length,
      peopleCount,
    };
  },

  async saveWeeklyReminder(
    next: Pick<WeeklyDocumentReminderSettings, "enabled" | "weekday">,
  ): Promise<WriteResult> {
    const current = readWeekly();
    writeJson(WEEKLY_KEY, {
      ...current,
      enabled: next.enabled,
      weekday: next.weekday,
    } satisfies WeeklyDocumentReminderSettings);
    return demoWriteResult();
  },

  async previewDocumentReminders(): Promise<ComplianceEmailPreview> {
    const outstanding = outstandingFromProfiles();
    const people = new Map<string, ComplianceStaffRow>();
    for (const row of outstanding) {
      if (!people.has(row.teacherId)) {
        people.set(row.teacherId, {
          teacherId: row.teacherId,
          name: row.teacherName,
          email: row.email,
          consultantName: row.consultantName,
        });
      }
    }
    const recipients = [...people.values()];
    const preview = documentReminderEmail(outstanding, recipients[0] ?? null);
    return { ...preview, recipients };
  },

  async queueWeeklyDocumentReminders(): Promise<
    CreateResult<{ emailLive: false; recipientCount: number; nextSendOn: string }>
  > {
    const preview = await this.previewDocumentReminders();
    if (preview.recipients.length === 0) {
      return {
        ok: false,
        persisted: false,
        data: null,
        error: "No outstanding documents to chase.",
      };
    }
    recordSend({
      kind: "documents",
      title: "Weekly document reminders",
      subject: preview.subject,
      recipientCount: preview.recipients.length,
      recipientIds: preview.recipients.map((row) => row.teacherId),
    });
    const current = readWeekly();
    const sentAt = getDataset().config.now.toISOString();
    writeJson(WEEKLY_KEY, { ...current, lastSentAt: sentAt } satisfies WeeklyDocumentReminderSettings);
    return demoCreateResult({
      emailLive: false,
      recipientCount: preview.recipients.length,
      nextSendOn: nextWeeklySendOn(getDataset().config.now, current.weekday, sentAt),
    });
  },

  async listAgencyPolicies(): Promise<AgencyPolicyDocument[]> {
    return policyDocuments();
  },

  async listSends(): Promise<ComplianceSendRecord[]> {
    return readSends();
  },
};

export function resetComplianceStoreForTests(now = new Date()) {
  resetDataset({ now });
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(WEEKLY_KEY);
    localStorage.removeItem(SENDS_KEY);
  }
}

export function formatComplianceDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return iso;
  return format(new Date(year, month - 1, day), "d MMM yyyy", { locale: enGB });
}
