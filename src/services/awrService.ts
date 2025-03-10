import { Teacher } from "./teacherService";
import { EmailService } from "./emailService";
import { 
  generateAWRNotificationEmail, 
  generateInternalAWRNotificationEmail 
} from "./emailTemplateService";
import { TeacherWithAWR, School, AWRStatus, AWRHistoryEntry } from "@/types/awr";

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
    return [
      {
        id: "t1",
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "(555) 123-4567",
        subjects: ["Mathematics", "Physics"],
        status: "active",
        lastBooking: "2023-06-15",
        rating: 4.8,
        favorite: true,
        availability: "full-time",
        region: "Greater London",
        awrStatus: "qualified",
        awrWeeks: 12,
        awrDays: 0,
        currentSchool: "Oakridge Secondary School",
        currentSchoolId: "s1",
        assignmentStartDate: "2023-03-15",
        awrQualificationDate: "2023-06-07",
        awrHistory: [
          {
            schoolId: "s1",
            schoolName: "Oakridge Secondary School",
            startDate: "2023-03-15",
            weeksCompleted: 12,
            status: "qualified",
            notes: "Continuous assignment as Mathematics teacher"
          }
        ]
      },
      {
        id: "t2",
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        phone: "(555) 987-6543",
        subjects: ["English", "Literature"],
        status: "active",
        lastBooking: "2023-06-10",
        rating: 4.5,
        favorite: false,
        availability: "part-time",
        region: "Hertfordshire",
        awrStatus: "approaching",
        awrWeeks: 10,
        awrDays: 2,
        currentSchool: "Westfield Academy",
        currentSchoolId: "s2",
        assignmentStartDate: "2023-04-01",
        awrNotificationSent: false,
        awrHistory: [
          {
            schoolId: "s2",
            schoolName: "Westfield Academy",
            startDate: "2023-04-01",
            weeksCompleted: 10,
            status: "approaching",
            notes: "Part-time English teacher"
          }
        ]
      },
      {
        id: "t3",
        name: "Michael Chen",
        email: "m.chen@example.com",
        phone: "(555) 456-7890",
        subjects: ["Chemistry", "Biology"],
        status: "active",
        lastBooking: "2023-06-05",
        rating: 4.9,
        favorite: true,
        availability: "full-time",
        region: "Essex",
        awrStatus: "tracking",
        awrWeeks: 6,
        awrDays: 3,
        currentSchool: "Northside Science Academy",
        currentSchoolId: "s3",
        assignmentStartDate: "2023-05-01",
        awrHistory: [
          {
            schoolId: "s3",
            schoolName: "Northside Science Academy",
            startDate: "2023-05-01",
            weeksCompleted: 6,
            status: "tracking",
            notes: "Science department, covering maternity leave"
          }
        ]
      },
      {
        id: "t4",
        name: "Emily Rodriguez",
        email: "emily.r@example.com",
        phone: "(555) 234-5678",
        subjects: ["Art", "History"],
        status: "active",
        lastBooking: "2023-05-28",
        rating: 4.2,
        favorite: false,
        availability: "part-time",
        region: "Surrey",
        awrStatus: "paused",
        awrWeeks: 8,
        awrDays: 1,
        currentSchool: "Creative Arts School",
        currentSchoolId: "s4",
        assignmentStartDate: "2023-04-15",
        pauseReason: "School holiday break",
        awrHistory: [
          {
            schoolId: "s4",
            schoolName: "Creative Arts School",
            startDate: "2023-04-15",
            weeksCompleted: 8,
            status: "paused",
            notes: "Assignment paused due to school holiday"
          }
        ]
      },
      {
        id: "t5",
        name: "David Wilson",
        email: "d.wilson@example.com",
        phone: "(555) 876-5432",
        subjects: ["Physical Education", "Health"],
        status: "active",
        lastBooking: "2023-06-12",
        rating: 4.7,
        favorite: false,
        availability: "full-time",
        region: "Kent",
        awrStatus: "not-applicable",
        awrWeeks: 0,
        awrDays: 0,
        awrHistory: []
      }
    ];
  }
} 