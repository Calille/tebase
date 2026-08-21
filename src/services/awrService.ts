import { Teacher } from "./teacherService";
import { EmailService } from "./emailService";
import { 
  generateAWRNotificationEmail, 
  generateInternalAWRNotificationEmail 
} from "./emailTemplateService";
import { TeacherWithAWR, School, AWRStatus, AWRHistoryEntry } from "@/types/awr";
import { getDataset } from "@/mocks";

/**
 * Service for handling AWR-related functionality
 */
export class AWRService {
  /**
   * Get all teachers with AWR information
   * @returns Promise with array of teachers with AWR information
   */
  static async getAllTeachersWithAWR(): Promise<TeacherWithAWR[]> {
    try {
      // In a real app, this would fetch from an API or database
      // For now, we'll return mock data
      return Promise.resolve(this.getMockTeachersWithAWR());
    } catch (error) {
      console.error("Error fetching teachers with AWR:", error);
      throw new Error("Failed to fetch teachers with AWR information");
    }
  }

  /**
   * Get a teacher with AWR information by ID
   * @param id The teacher ID
   * @returns Promise with the teacher with AWR information
   */
  static async getTeacherWithAWRById(id: string): Promise<TeacherWithAWR | null> {
    try {
      // In a real app, this would fetch from an API or database
      const teachers = this.getMockTeachersWithAWR();
      const teacher = teachers.find(t => t.id === id) || null;
      return Promise.resolve(teacher);
    } catch (error) {
      console.error(`Error fetching teacher with ID ${id}:`, error);
      throw new Error(`Failed to fetch teacher with ID ${id}`);
    }
  }

  /**
   * Update a teacher's AWR status based on weeks worked
   * @param teacher The teacher to update
   * @param weeksCompleted The number of weeks completed
   * @param daysCompleted The number of days completed in the current week
   * @returns Promise with the updated teacher object
   */
  static async updateAWRStatus(
    teacher: TeacherWithAWR,
    weeksCompleted: number,
    daysCompleted: number
  ): Promise<TeacherWithAWR> {
    try {
      const updatedTeacher = { ...teacher };
      updatedTeacher.awrWeeks = weeksCompleted;
      updatedTeacher.awrDays = daysCompleted;

      // Determine AWR status based on weeks completed
      if (weeksCompleted >= 12) {
        updatedTeacher.awrStatus = "qualified";
        
        // Calculate qualification date if not already set
        if (!updatedTeacher.awrQualificationDate && updatedTeacher.assignmentStartDate) {
          const startDate = new Date(updatedTeacher.assignmentStartDate);
          const qualificationDate = new Date(startDate);
          qualificationDate.setDate(startDate.getDate() + (12 * 7)); // Add 12 weeks
          updatedTeacher.awrQualificationDate = qualificationDate.toISOString();
        }
      } else if (weeksCompleted >= 10) {
        updatedTeacher.awrStatus = "approaching";
      } else if (weeksCompleted > 0) {
        updatedTeacher.awrStatus = "tracking";
      } else {
        updatedTeacher.awrStatus = "not-applicable";
      }

      // In a real app, this would save to an API or database
      return Promise.resolve(updatedTeacher);
    } catch (error) {
      console.error("Error updating AWR status:", error);
      throw new Error("Failed to update AWR status");
    }
  }

  /**
   * Check if a teacher has reached 10 weeks and needs AWR notification
   * @param teacher The teacher to check
   * @param school The school where the teacher is working
   * @returns Promise with boolean indicating if notification was sent
   */
  static async checkAndSendAWRNotification(
    teacher: TeacherWithAWR,
    school: School
  ): Promise<boolean> {
    try {
      // Send notification if teacher has at least 10 weeks completed
      // and notification hasn't been sent yet
      if (
        (teacher.awrWeeks > 10 || (teacher.awrWeeks === 10 && teacher.awrDays >= 0)) && 
        !teacher.awrNotificationSent &&
        teacher.assignmentStartDate
      ) {
        // Calculate qualification date (2 weeks from now)
        const startDate = new Date(teacher.assignmentStartDate);
        const qualificationDate = new Date(startDate);
        qualificationDate.setDate(startDate.getDate() + (12 * 7)); // Add 12 weeks
        
        // Generate and send email to school
        const emailTemplate = generateAWRNotificationEmail(
          teacher,
          school,
          teacher.awrWeeks,
          qualificationDate
        );
        
        const result = await EmailService.sendEmail(emailTemplate);
        await EmailService.logEmailActivity(emailTemplate, result);
        
        // Send internal notification
        const internalEmailTemplate = generateInternalAWRNotificationEmail(
          teacher,
          school,
          teacher.awrWeeks,
          qualificationDate
        );
        
        const internalResult = await EmailService.sendEmail(internalEmailTemplate);
        await EmailService.logEmailActivity(internalEmailTemplate, internalResult);
        
        return result.success && internalResult.success;
      }
      
      return false;
    } catch (error) {
      console.error("Error sending AWR notification:", error);
      throw new Error("Failed to send AWR notification");
    }
  }
  
  /**
   * Get the projected AWR qualification date for a teacher
   * @param teacher The teacher to calculate for
   * @returns The projected qualification date or null if not applicable
   */
  static getProjectedQualificationDate(teacher: TeacherWithAWR): Date | null {
    try {
      if (
        teacher.awrStatus === "qualified" || 
        teacher.awrStatus === "not-applicable" || 
        !teacher.assignmentStartDate
      ) {
        return null;
      }
      
      const startDate = new Date(teacher.assignmentStartDate);
      const remainingDays = (12 - teacher.awrWeeks) * 5 - teacher.awrDays;
      
      // Add remaining business days
      const qualificationDate = this.addBusinessDays(startDate, teacher.awrWeeks * 5 + teacher.awrDays + remainingDays);
      
      return qualificationDate;
    } catch (error) {
      console.error("Error calculating projected qualification date:", error);
      return null;
    }
  }

  /**
   * Add a new AWR history entry for a teacher
   * @param teacher The teacher to update
   * @param entry The AWR history entry to add
   * @returns Promise with the updated teacher
   */
  static async addAWRHistoryEntry(
    teacher: TeacherWithAWR,
    entry: AWRHistoryEntry
  ): Promise<TeacherWithAWR> {
    try {
      const updatedTeacher = { ...teacher };
      
      // Initialize history array if it doesn't exist
      if (!updatedTeacher.awrHistory) {
        updatedTeacher.awrHistory = [];
      }
      
      // Add the new entry
      updatedTeacher.awrHistory.push(entry);
      
      // In a real app, this would save to an API or database
      return Promise.resolve(updatedTeacher);
    } catch (error) {
      console.error("Error adding AWR history entry:", error);
      throw new Error("Failed to add AWR history entry");
    }
  }

  /**
   * Pause AWR tracking for a teacher
   * @param teacher The teacher to update
   * @param reason The reason for pausing
   * @returns Promise with the updated teacher
   */
  static async pauseAWRTracking(
    teacher: TeacherWithAWR,
    reason: string
  ): Promise<TeacherWithAWR> {
    try {
      const updatedTeacher = { ...teacher };
      
      // Update status and reason
      updatedTeacher.awrStatus = "paused";
      updatedTeacher.pauseReason = reason;
      
      // In a real app, this would save to an API or database
      return Promise.resolve(updatedTeacher);
    } catch (error) {
      console.error("Error pausing AWR tracking:", error);
      throw new Error("Failed to pause AWR tracking");
    }
  }

  /**
   * Resume AWR tracking for a teacher
   * @param teacher The teacher to update
   * @returns Promise with the updated teacher
   */
  static async resumeAWRTracking(
    teacher: TeacherWithAWR
  ): Promise<TeacherWithAWR> {
    try {
      const updatedTeacher = { ...teacher };
      
      // Determine new status based on weeks completed
      if (updatedTeacher.awrWeeks >= 12) {
        updatedTeacher.awrStatus = "qualified";
      } else if (updatedTeacher.awrWeeks >= 10) {
        updatedTeacher.awrStatus = "approaching";
      } else if (updatedTeacher.awrWeeks > 0) {
        updatedTeacher.awrStatus = "tracking";
      } else {
        updatedTeacher.awrStatus = "not-applicable";
      }
      
      // Clear pause reason
      updatedTeacher.pauseReason = undefined;
      
      // In a real app, this would save to an API or database
      return Promise.resolve(updatedTeacher);
    } catch (error) {
      console.error("Error resuming AWR tracking:", error);
      throw new Error("Failed to resume AWR tracking");
    }
  }
  
  /**
   * Add business days to a date (excluding weekends)
   * @param date The starting date
   * @param days The number of business days to add
   * @returns The new date after adding business days
   */
  private static addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date);
    let daysAdded = 0;
    
    while (daysAdded < days) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++;
      }
    }
    
    return result;
  }

  /**
   * Get mock teachers with AWR information for testing
   * @returns Array of mock teachers with AWR information
   */
  private static getMockTeachersWithAWR(): TeacherWithAWR[] {
    return getDataset().awrTeachers.map((item) => ({ ...item }));
  }
} 