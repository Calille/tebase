import { TeacherWithAWR, School, EmailTemplate } from "@/types/awr";

/**
 * Service for generating email templates
 */
export class EmailTemplateService {
  /**
   * Generate an AWR notification email to send to a school
   * @param teacher The teacher approaching AWR qualification
   * @param school The school where the teacher is working
   * @param weeksCompleted The number of weeks the teacher has completed
   * @param qualificationDate The projected qualification date
   * @returns The email template
   */
  static generateAWRNotificationEmail(
    teacher: TeacherWithAWR,
    school: School,
    weeksCompleted: number,
    qualificationDate: Date
  ): EmailTemplate {
    try {
      const formattedDate = qualificationDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const subject = `AWR Notification: ${teacher.name} approaching qualification`;

      const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Agency Workers Regulations (AWR) Notification</h2>
          
          <p>Dear ${school.contactName || "School Administrator"},</p>
          
          <p>This is to inform you that <strong>${teacher.name}</strong>, who is currently working at <strong>${school.name}</strong>, is approaching AWR qualification.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #4b5563;">AWR Status Details</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>Teacher:</strong> ${teacher.name}</li>
              <li><strong>Assignment Start Date:</strong> ${teacher.assignmentStartDate ? new Date(teacher.assignmentStartDate).toLocaleDateString("en-GB") : "N/A"}</li>
              <li><strong>Weeks Completed:</strong> ${weeksCompleted}</li>
              <li><strong>Projected Qualification Date:</strong> ${formattedDate}</li>
            </ul>
          </div>
          
          <p>Under the Agency Workers Regulations 2010, after a 12-week qualifying period, temporary workers are entitled to the same basic working and employment conditions as if they had been recruited directly by the hirer.</p>
          
          <p>Please review your obligations under AWR and ensure that appropriate arrangements are in place by the qualification date. If you have any questions or need further information, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>
          Tebase CRM Team<br>
          <a href="mailto:support@tebase.com">support@tebase.com</a><br>
          <a href="tel:+441234567890">+44 123 456 7890</a></p>
          
          <div style="font-size: 12px; color: #6b7280; margin-top: 30px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
            <p>This is an automated notification from the Tebase CRM system. Please do not reply directly to this email.</p>
          </div>
        </div>
      `;

      return {
        to: school.contactEmail || "school@example.com",
        from: "notifications@tebase.com",
        subject,
        body,
        cc: ["awr-compliance@tebase.com"],
      };
    } catch (error) {
      console.error("Error generating AWR notification email:", error);
      throw new Error("Failed to generate AWR notification email");
    }
  }

  /**
   * Generate an internal AWR notification email for the compliance team
   * @param teacher The teacher approaching AWR qualification
   * @param school The school where the teacher is working
   * @param weeksCompleted The number of weeks the teacher has completed
   * @param qualificationDate The projected qualification date
   * @returns The email template
   */
  static generateInternalAWRNotificationEmail(
    teacher: TeacherWithAWR,
    school: School,
    weeksCompleted: number,
    qualificationDate: Date
  ): EmailTemplate {
    try {
      const formattedDate = qualificationDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const subject = `[INTERNAL] AWR Alert: ${teacher.name} at ${school.name}`;

      const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Internal AWR Notification</h2>
          
          <p>This is an internal notification that an AWR alert has been sent to a school.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #4b5563;">AWR Details</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>Teacher:</strong> ${teacher.name} (ID: ${teacher.id})</li>
              <li><strong>School:</strong> ${school.name} (ID: ${school.id})</li>
              <li><strong>School Contact:</strong> ${school.contactName || "N/A"} (${school.contactEmail || "N/A"})</li>
              <li><strong>Assignment Start Date:</strong> ${teacher.assignmentStartDate ? new Date(teacher.assignmentStartDate).toLocaleDateString("en-GB") : "N/A"}</li>
              <li><strong>Weeks Completed:</strong> ${weeksCompleted}</li>
              <li><strong>Projected Qualification Date:</strong> ${formattedDate}</li>
            </ul>
          </div>
          
          <p>An AWR notification email has been sent to the school. Please follow up with the school to ensure they understand their obligations and to answer any questions they may have.</p>
          
          <p>The AWR status for this teacher has been updated in the system.</p>
          
          <p>Tebase CRM System</p>
        </div>
      `;

      return {
        to: "awr-compliance@tebase.com",
        from: "system@tebase.com",
        subject,
        body,
        cc: ["management@tebase.com"],
      };
    } catch (error) {
      console.error("Error generating internal AWR notification email:", error);
      throw new Error("Failed to generate internal AWR notification email");
    }
  }

  /**
   * Generate an AWR qualification confirmation email
   * @param teacher The teacher who has qualified for AWR
   * @param school The school where the teacher is working
   * @param qualificationDate The qualification date
   * @returns The email template
   */
  static generateAWRQualificationEmail(
    teacher: TeacherWithAWR,
    school: School,
    qualificationDate: Date
  ): EmailTemplate {
    try {
      const formattedDate = qualificationDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const subject = `AWR Qualification Confirmation: ${teacher.name}`;

      const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">AWR Qualification Confirmation</h2>
          
          <p>Dear ${school.contactName || "School Administrator"},</p>
          
          <p>This is to confirm that <strong>${teacher.name}</strong>, who is currently working at <strong>${school.name}</strong>, has now qualified for equal treatment under the Agency Workers Regulations 2010.</p>
          
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="margin-top: 0; color: #166534;">AWR Qualification Details</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>Teacher:</strong> ${teacher.name}</li>
              <li><strong>Assignment Start Date:</strong> ${teacher.assignmentStartDate ? new Date(teacher.assignmentStartDate).toLocaleDateString("en-GB") : "N/A"}</li>
              <li><strong>Qualification Date:</strong> ${formattedDate}</li>
            </ul>
          </div>
          
          <p>Under the Agency Workers Regulations 2010, now that the 12-week qualifying period has been completed, ${teacher.name} is entitled to the same basic working and employment conditions as if they had been recruited directly by your school.</p>
          
          <p>Please ensure that all necessary arrangements are in place to comply with AWR requirements. If you have any questions or need further information, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>
          Tebase CRM Team<br>
          <a href="mailto:support@tebase.com">support@tebase.com</a><br>
          <a href="tel:+441234567890">+44 123 456 7890</a></p>
          
          <div style="font-size: 12px; color: #6b7280; margin-top: 30px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
            <p>This is an automated notification from the Tebase CRM system. Please do not reply directly to this email.</p>
          </div>
        </div>
      `;

      return {
        to: school.contactEmail || "school@example.com",
        from: "notifications@tebase.com",
        subject,
        body,
        cc: ["awr-compliance@tebase.com"],
      };
    } catch (error) {
      console.error("Error generating AWR qualification email:", error);
      throw new Error("Failed to generate AWR qualification email");
    }
  }
}

// Export the individual functions for convenience
export const {
  generateAWRNotificationEmail,
  generateInternalAWRNotificationEmail,
  generateAWRQualificationEmail,
} = EmailTemplateService; 