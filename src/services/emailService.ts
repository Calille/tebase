import { getDataset } from "@/mocks";
import { EmailTemplate, EmailResult } from "@/types/awr";

/**
 * Service for handling email-related functionality
 */
export class EmailService {
  /**
   * Send an email
   * @param emailTemplate The email template to send
   * @returns Promise with the result of the email sending operation
   */
  static async sendEmail(emailTemplate: EmailTemplate): Promise<EmailResult> {
    try {
      // In a real app, this would send an actual email via an API or service
      console.log("Sending email:", emailTemplate);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate successful email sending
      const result: EmailResult = {
        success: true,
        messageId: `email-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      };
      
      return result;
    } catch (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error sending email",
      };
    }
  }

  /**
   * Log email activity for tracking purposes
   * @param emailTemplate The email template that was sent
   * @param result The result of the email sending operation
   * @returns Promise that resolves when the logging is complete
   */
  static async logEmailActivity(
    emailTemplate: EmailTemplate,
    result: EmailResult
  ): Promise<void> {
    try {
      // In a real app, this would log to a database or analytics service
      console.log("Logging email activity:", {
        to: emailTemplate.to,
        subject: emailTemplate.subject,
        timestamp: new Date().toISOString(),
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error("Error logging email activity:", error);
      // We don't throw here to prevent disrupting the main flow if logging fails
    }
  }

  /**
   * Get email sending history
   * @param filters Optional filters for the history (e.g., date range, recipient)
   * @returns Promise with the email sending history
   */
  static async getEmailHistory(filters?: {
    startDate?: Date;
    endDate?: Date;
    recipient?: string;
    subject?: string;
  }): Promise<{
    to: string;
    subject: string;
    timestamp: string;
    success: boolean;
    messageId?: string;
  }[]> {
    try {
      // In a real app, this would fetch from a database or API
      console.log("Fetching email history with filters:", filters);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const dataset = getDataset();
      const awr = dataset.awrTeachers.slice(0, 3);
      return awr.map((teacher, index) => ({
        to: teacher.currentSchool
          ? `office@${teacher.currentSchoolId ?? "school"}.example`
          : "office@school.example",
        subject: `AWR Notification: ${teacher.name}`,
        timestamp: new Date(dataset.config.now.getTime() - (index + 1) * 86400000).toISOString(),
        success: index !== 2,
        messageId: index === 2 ? undefined : `email-awr-${teacher.id}`,
      }));
    } catch (error) {
      console.error("Error fetching email history:", error);
      throw new Error("Failed to fetch email history");
    }
  }

  /**
   * Validate an email address
   * @param email The email address to validate
   * @returns True if the email is valid, false otherwise
   */
  static validateEmail(email: string): boolean {
    try {
      // Basic email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    } catch (error) {
      console.error("Error validating email:", error);
      return false;
    }
  }
} 