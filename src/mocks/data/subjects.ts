export const SECONDARY_SUBJECTS = [
  "Maths",
  "English",
  "Science",
  "MFL",
  "DT",
  "PE",
  "Humanities",
] as const;

export const PRIMARY_KEY_STAGES = ["EYFS", "KS1", "KS2"] as const;

export const PHASES = [
  "infant",
  "junior",
  "primary",
  "secondary",
  "special",
  "sixth_form",
] as const;

export type Phase = (typeof PHASES)[number];
