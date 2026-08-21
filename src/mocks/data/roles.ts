import type { TeacherRole } from "@/types/timesheet";

export const STAFF_ROLES = [
  "supply_teacher",
  "cover_supervisor",
  "teaching_assistant",
  "hlta",
  "sen_ta",
  "nursery_nurse",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  supply_teacher: "Supply Teacher",
  cover_supervisor: "Cover Supervisor",
  teaching_assistant: "Teaching Assistant",
  hlta: "HLTA",
  sen_ta: "SEN TA",
  nursery_nurse: "Nursery Nurse",
};

export function toTimesheetRole(role: StaffRole): TeacherRole {
  if (role === "sen_ta") return "teaching_assistant";
  return role;
}

export const RATE_BANDS: Record<
  StaffRole | "long_term",
  { pay: [number, number]; charge: [number, number] }
> = {
  teaching_assistant: { pay: [75, 95], charge: [105, 135] },
  sen_ta: { pay: [80, 100], charge: [110, 140] },
  nursery_nurse: { pay: [75, 95], charge: [105, 135] },
  cover_supervisor: { pay: [85, 105], charge: [120, 150] },
  hlta: { pay: [95, 120], charge: [130, 170] },
  supply_teacher: { pay: [110, 160], charge: [150, 230] },
  long_term: { pay: [140, 200], charge: [190, 280] },
};
