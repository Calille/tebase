import type { ComplianceCourse, ComplianceStaffRow, OutstandingDocumentRow } from "./types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrap(inner: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      ${inner}
      <p>Best regards,<br>Keep Supply compliance<br>
      <a href="mailto:compliance@keep-supply.example">compliance@keep-supply.example</a></p>
      <div style="font-size: 12px; color: #6b7280; margin-top: 24px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
        <p>This is a demo preview. Tebase is not connected to a mail provider, so nothing is delivered.</p>
      </div>
    </div>
  `.trim();
}

export function courseChaseEmail(
  course: ComplianceCourse,
  recipientCount: number,
): { subject: string; body: string } {
  const subject = `Please complete: ${course.name}`;
  const body = wrap(`
    <h2 style="color: #2563eb;">Outstanding training</h2>
    <p>Dear colleague,</p>
    <p>Our records show you have not completed <strong>${escapeHtml(course.name)}</strong>
    (${escapeHtml(course.renewal)}). Please finish the course as soon as you can so we can keep you on assignments.</p>
    <p style="color: #6b7280; font-size: 13px;">This draft would go to ${recipientCount} member${recipientCount === 1 ? "" : "s"} of staff.</p>
  `);
  return { subject, body };
}

export function documentReminderEmail(
  rows: OutstandingDocumentRow[],
  example: ComplianceStaffRow | null,
): { subject: string; body: string } {
  const subject = "Outstanding compliance documents";
  const exampleName = example ? escapeHtml(example.name) : "colleague";
  const labels = [...new Set(rows.map((row) => row.label))];
  const list = labels.map((label) => `<li>${escapeHtml(label)}</li>`).join("");
  const people = new Set(rows.map((row) => row.teacherId)).size;
  const body = wrap(`
    <h2 style="color: #2563eb;">Documents still needed</h2>
    <p>Dear ${exampleName},</p>
    <p>Please upload or renew the following so we can keep your file complete:</p>
    <ul>${list}</ul>
    <p>If you have already sent these, reply to this email and we will update your record.</p>
    <p style="color: #6b7280; font-size: 13px;">Weekly reminder draft — ${people} people, ${rows.length} outstanding item${rows.length === 1 ? "" : "s"}.</p>
  `);
  return { subject, body };
}
