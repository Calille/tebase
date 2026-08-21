import { School } from "@/types/awr";
import { getDataset } from "@/mocks";

/**
 * Service for handling AWR-related school functionality
 */
export class AWRSchoolService {
  /**
   * Get all schools
   * @returns Promise with array of schools
   */
  static async getAllSchools(): Promise<School[]> {
    try {
      // In a real app, this would fetch from an API or database
      // For now, we'll return mock data
      return Promise.resolve(this.getMockSchools());
    } catch (error) {
      console.error("Error fetching schools:", error);
      throw new Error("Failed to fetch schools");
    }
  }

  /**
   * Get a school by ID
   * @param id The school ID
   * @returns Promise with the school or null if not found
   */
  static async getSchoolById(id: string): Promise<School | null> {
    try {
      // In a real app, this would fetch from an API or database
      const schools = this.getMockSchools();
      const school = schools.find(s => s.id === id) || null;
      return Promise.resolve(school);
    } catch (error) {
      console.error(`Error fetching school with ID ${id}:`, error);
      throw new Error(`Failed to fetch school with ID ${id}`);
    }
  }

  /**
   * Get schools by teacher ID (schools where the teacher has worked)
   * @param teacherId The teacher ID
   * @returns Promise with array of schools
   */
  static async getSchoolsByTeacherId(teacherId: string): Promise<School[]> {
    try {
      // In a real app, this would fetch from an API or database based on teacher assignments
      // For now, we'll return mock data
      const dataset = getDataset();
      return dataset.schools
        .filter((school) =>
          dataset.bookings.some(
            (booking) => booking.teacherId === teacherId && booking.schoolId === school.id,
          ),
        )
        .map((school) => ({
          id: school.id,
          name: school.name,
          contactName: school.contactName,
          contactEmail: school.contactEmail,
        }));
    } catch (error) {
      console.error(`Error fetching schools for teacher ${teacherId}:`, error);
      throw new Error(`Failed to fetch schools for teacher ${teacherId}`);
    }
  }

  /**
   * Update a school's contact information
   * @param school The school to update
   * @returns Promise with the updated school
   */
  static async updateSchoolContact(school: School): Promise<School> {
    try {
      // In a real app, this would save to an API or database
      return Promise.resolve(school);
    } catch (error) {
      console.error("Error updating school contact:", error);
      throw new Error("Failed to update school contact information");
    }
  }

  /**
   * Get mock schools for testing
   * @returns Array of mock schools
   */
  private static getMockSchools(): School[] {
    return getDataset().schools.map((school) => ({
      id: school.id,
      name: school.name,
      contactName: school.contactName,
      contactEmail: school.contactEmail,
    }));
  }
} 