import { School } from "@/types/awr";

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
      const schools = this.getMockSchools();
      
      // Simulate filtering schools by teacher ID
      // In a real app, this would be based on actual teacher assignments
      const filteredSchools = schools.filter((_, index) => index % 2 === 0);
      
      return Promise.resolve(filteredSchools);
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
    return [
      {
        id: "s1",
        name: "Oakridge Secondary School",
        contactName: "Principal Johnson",
        contactEmail: "principal@oakridge.edu"
      },
      {
        id: "s2",
        name: "Westfield Academy",
        contactName: "Dr. Sarah Williams",
        contactEmail: "swilliams@westfield.edu"
      },
      {
        id: "s3",
        name: "Northside Science Academy",
        contactName: "Mark Thompson",
        contactEmail: "mthompson@northsidescience.edu"
      },
      {
        id: "s4",
        name: "Creative Arts School",
        contactName: "Lisa Chen",
        contactEmail: "lchen@creativearts.edu"
      },
      {
        id: "s5",
        name: "Riverside Elementary",
        contactName: "Robert Davis",
        contactEmail: "rdavis@riverside.edu"
      }
    ];
  }
} 