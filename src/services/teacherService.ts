import { supabase } from '@/lib/supabase';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  status: 'active' | 'inactive' | 'pending';
  lastBooking: string;
  rating: number;
  favorite: boolean;
  availability: 'full-time' | 'part-time' | 'weekends';
  address?: string;
  website?: string;
  specializations?: string[];
  qualifications?: {
    degree: string;
    institution: string;
    year: string;
  }[];
  experience?: {
    role: string;
    school: string;
    period: string;
  }[];
  preferredLocations?: string[];
  reviews?: number;
  notes?: string;
  documents?: {
    name: string;
    status: string;
    expiryDate: string;
  }[];
  
  // New fields with t_ prefix
  region?: string; // UK county (e.g., Hertfordshire, Bedfordshire, Buckinghamshire)
  certifications?: string[];
  salaryExpectations?: {
    min: number;
    max: number;
    currency: string;
    rate: string;
  };
  availabilitySchedule?: Record<string, any>;
  languages?: string[];
  teachingMethods?: string[];
  performanceRatings?: Record<string, any>;
  employmentHistory?: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  referenceContacts?: Array<{
    name: string;
    relationship: string;
    email: string;
    phone: string;
    company: string;
  }>;
  educationHistory?: Array<{
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
    grade: string;
  }>;
  skills?: string[];
  profileImageUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  visaStatus?: string;
  dbsCheckDate?: string;
  dbsCheckNumber?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    sortCode: string;
    bankName: string;
  };
  taxInformation?: Record<string, any>;
  contractType?: string;
  contractDetails?: Record<string, any>;
  onboardingStatus?: string;
  onboardingCompletedAt?: string;
  lastLogin?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    other?: Record<string, string>;
  };
}

export const teacherService = {
  async getTeachers(): Promise<Teacher[]> {
    try {
      // For mock implementation, return some sample teachers
      const mockTeachers: Teacher[] = [
        {
          id: 'teacher-1',
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '07700 900123',
          subjects: ['Mathematics', 'Physics'],
          status: 'active',
          lastBooking: '2023-05-15',
          rating: 4.8,
          favorite: true,
          availability: 'full-time',
          region: 'London',
        },
        {
          id: 'teacher-2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          phone: '07700 900456',
          subjects: ['English', 'History'],
          status: 'active',
          lastBooking: '2023-05-10',
          rating: 4.5,
          favorite: false,
          availability: 'part-time',
          region: 'Manchester',
        },
        {
          id: 'teacher-3',
          name: 'David Williams',
          email: 'david.williams@example.com',
          phone: '07700 900789',
          subjects: ['Chemistry', 'Biology'],
          status: 'inactive',
          lastBooking: '2023-04-20',
          rating: 4.2,
          favorite: false,
          availability: 'weekends',
          region: 'Birmingham',
        },
        {
          id: 'teacher-4',
          name: 'Emma Brown',
          email: 'emma.brown@example.com',
          phone: '07700 900321',
          subjects: ['Art', 'Music'],
          status: 'pending',
          lastBooking: '',
          rating: 0,
          favorite: false,
          availability: 'part-time',
          region: 'Leeds',
        },
      ];
      
      return mockTeachers;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      return [];
    }
  },

  async getTeacherById(id: string): Promise<Teacher | null> {
    try {
      // For mock implementation, return a sample teacher based on ID
      // First check if it's one of our predefined teachers
      const mockTeachers = await this.getTeachers();
      const existingTeacher = mockTeachers.find(teacher => teacher.id === id);
      
      if (existingTeacher) {
        return existingTeacher;
      }
      
      // If not found, create a mock teacher with the given ID
      const mockTeacher: Teacher = {
        id,
        name: `Teacher ${id.split('-')[1] || id}`,
        email: `teacher${id.split('-')[1] || id}@example.com`,
        phone: '07700 900000',
        subjects: ['Subject 1', 'Subject 2'],
        status: 'active',
        lastBooking: '2023-05-01',
        rating: 4.0,
        favorite: false,
        availability: 'full-time',
        region: 'London',
        address: '123 Main St, London',
        website: 'https://example.com',
        specializations: ['Specialization 1', 'Specialization 2'],
        preferredLocations: ['London', 'Manchester'],
        reviews: 10,
        notes: 'Some notes about this teacher',
        certifications: ['Certification 1', 'Certification 2'],
        salaryExpectations: { min: 100, max: 200, currency: 'GBP', rate: 'daily' },
        languages: ['English', 'French'],
        skills: ['Skill 1', 'Skill 2'],
        educationHistory: [
          {
            institution: 'University of Example',
            degree: 'Bachelor of Education',
            field: 'Education',
            startYear: '2015',
            endYear: '2019',
            grade: 'First Class',
          }
        ],
        employmentHistory: [
          {
            company: 'Previous School',
            role: 'Teacher',
            startDate: '2019-09-01',
            endDate: '2022-08-31',
            description: 'Taught various subjects',
          }
        ],
        referenceContacts: [
          {
            name: 'Reference Person',
            relationship: 'Previous Manager',
            email: 'reference@example.com',
            phone: '07700 900999',
            company: 'Previous School',
          }
        ],
      };
      
      return mockTeacher;
    } catch (error) {
      console.error(`Error fetching teacher with ID ${id}:`, error);
      return null;
    }
  },

  async createTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher | null> {
    try {
      // For mock implementation, generate a random ID
      const newTeacher: Teacher = {
        ...teacher,
        id: `teacher-${Date.now()}`,
        status: teacher.status || 'pending',
        subjects: teacher.subjects || [],
        rating: teacher.rating || 0,
        favorite: teacher.favorite || false,
        lastBooking: teacher.lastBooking || '',
      };
      
      console.log('Creating teacher:', newTeacher);
      
      // In a real implementation, this would save to the database
      // For now, just return the new teacher with the generated ID
      return newTeacher;
    } catch (error) {
      console.error('Error creating teacher:', error);
      return null;
    }
  },

  async updateTeacher(id: string, teacher: Partial<Teacher>): Promise<boolean> {
    try {
      console.log(`Updating teacher ${id}:`, teacher);
      
      // In a real implementation, this would update the database
      // For now, just return success
      return true;
    } catch (error) {
      console.error(`Error updating teacher ${id}:`, error);
      return false;
    }
  },

  async deleteTeacher(id: string): Promise<boolean> {
    try {
      console.log(`Deleting teacher ${id}`);
      
      // In a real implementation, this would delete from the database
      // For now, just return success
      return true;
    } catch (error) {
      console.error(`Error deleting teacher ${id}:`, error);
      return false;
    }
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ favorite: isFavorite })
        .eq('id', id);
      
      if (error) {
        console.error(`Error toggling favorite for teacher with ID ${id}:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Exception toggling favorite for teacher with ID ${id}:`, error);
      return false;
    }
  },

  async updateTeacherStatus(id: string, status: 'active' | 'inactive' | 'pending'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ status })
        .eq('id', id);
      
      if (error) {
        console.error(`Error updating teacher status for ID ${id}:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Exception updating teacher status for ID ${id}:`, error);
      return false;
    }
  },

  async updateTeacherOnboardingStatus(id: string, onboardingStatus: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ 
          t_onboarding_status: onboardingStatus,
          t_onboarding_completed_at: onboardingStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', id);
      
      if (error) {
        console.error(`Error updating teacher onboarding status for ID ${id}:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Exception updating teacher onboarding status for ID ${id}:`, error);
      return false;
    }
  },

  async addTeacherDocument(teacherId: string, document: { name: string; status: string; expiryDate: string }): Promise<boolean> {
    try {
      console.log(`Adding document to teacher ${teacherId}:`, document);
      
      // In a real implementation, this would add to the database
      // For now, just return success
      return true;
    } catch (error) {
      console.error(`Error adding document to teacher ${teacherId}:`, error);
      return false;
    }
  },

  async updateTeacherEmploymentHistory(
    teacherId: string, 
    employmentHistory: Array<{
      company: string;
      role: string;
      startDate: string;
      endDate: string;
      description: string;
    }>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ t_employment_history: employmentHistory })
        .eq('id', teacherId);
      
      if (error) {
        console.error(`Error updating teacher employment history for ID ${teacherId}:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Exception updating teacher employment history for ID ${teacherId}:`, error);
      return false;
    }
  },

  async updateTeacherEducationHistory(
    teacherId: string, 
    educationHistory: Array<{
      institution: string;
      degree: string;
      field: string;
      startYear: string;
      endYear: string;
      grade: string;
    }>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ t_education_history: educationHistory })
        .eq('id', teacherId);
      
      if (error) {
        console.error(`Error updating teacher education history for ID ${teacherId}:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Exception updating teacher education history for ID ${teacherId}:`, error);
      return false;
    }
  },

  async getTeachersByRegion(region: string): Promise<Teacher[]> {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('t_region', region);
      
      if (error) {
        console.error(`Error fetching teachers by region ${region}:`, error);
        return [];
      }
      
      // Transform snake_case to camelCase (same as in getTeachers)
      const teachers = data?.map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        subjects: item.subjects || [],
        status: item.status,
        lastBooking: item.last_booking,
        rating: item.rating,
        favorite: item.favorite,
        availability: item.availability,
        address: item.address,
        website: item.website,
        specializations: item.specializations || [],
        preferredLocations: item.preferred_locations || [],
        reviews: item.reviews,
        notes: item.notes,
        
        // New fields with t_ prefix
        region: item.t_region,
        certifications: item.t_certifications || [],
        salaryExpectations: item.t_salary_expectations || { min: 0, max: 0, currency: 'GBP', rate: 'daily' },
        availabilitySchedule: item.t_availability_schedule || {},
        languages: item.t_languages || [],
        teachingMethods: item.t_teaching_methods || [],
        performanceRatings: item.t_performance_ratings || {},
        employmentHistory: item.t_employment_history || [],
        referenceContacts: item.t_reference_contacts || [],
        educationHistory: item.t_education_history || [],
        skills: item.t_skills || [],
        profileImageUrl: item.t_profile_image_url,
        dateOfBirth: item.t_date_of_birth,
        gender: item.t_gender,
        nationality: item.t_nationality,
        visaStatus: item.t_visa_status,
        dbsCheckDate: item.t_dbs_check_date,
        dbsCheckNumber: item.t_dbs_check_number,
        emergencyContact: item.t_emergency_contact || {},
        bankDetails: item.t_bank_details || {},
        taxInformation: item.t_tax_information || {},
        contractType: item.t_contract_type,
        contractDetails: item.t_contract_details || {},
        onboardingStatus: item.t_onboarding_status,
        onboardingCompletedAt: item.t_onboarding_completed_at,
        lastLogin: item.t_last_login,
        socialMedia: item.t_social_media || {}
      })) || [];
      
      return teachers;
    } catch (error) {
      console.error(`Exception fetching teachers by region ${region}:`, error);
      return [];
    }
  },

  async getTeachersByAvailability(availability: 'full-time' | 'part-time' | 'weekends'): Promise<Teacher[]> {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('availability', availability);
      
      if (error) {
        console.error(`Error fetching teachers by availability ${availability}:`, error);
        return [];
      }
      
      // Transform snake_case to camelCase (same as in getTeachers)
      const teachers = data?.map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        subjects: item.subjects || [],
        status: item.status,
        lastBooking: item.last_booking,
        rating: item.rating,
        favorite: item.favorite,
        availability: item.availability,
        address: item.address,
        website: item.website,
        specializations: item.specializations || [],
        preferredLocations: item.preferred_locations || [],
        reviews: item.reviews,
        notes: item.notes,
        
        // New fields with t_ prefix
        region: item.t_region,
        certifications: item.t_certifications || [],
        salaryExpectations: item.t_salary_expectations || { min: 0, max: 0, currency: 'GBP', rate: 'daily' },
        availabilitySchedule: item.t_availability_schedule || {},
        languages: item.t_languages || [],
        teachingMethods: item.t_teaching_methods || [],
        performanceRatings: item.t_performance_ratings || {},
        employmentHistory: item.t_employment_history || [],
        referenceContacts: item.t_reference_contacts || [],
        educationHistory: item.t_education_history || [],
        skills: item.t_skills || [],
        profileImageUrl: item.t_profile_image_url,
        dateOfBirth: item.t_date_of_birth,
        gender: item.t_gender,
        nationality: item.t_nationality,
        visaStatus: item.t_visa_status,
        dbsCheckDate: item.t_dbs_check_date,
        dbsCheckNumber: item.t_dbs_check_number,
        emergencyContact: item.t_emergency_contact || {},
        bankDetails: item.t_bank_details || {},
        taxInformation: item.t_tax_information || {},
        contractType: item.t_contract_type,
        contractDetails: item.t_contract_details || {},
        onboardingStatus: item.t_onboarding_status,
        onboardingCompletedAt: item.t_onboarding_completed_at,
        lastLogin: item.t_last_login,
        socialMedia: item.t_social_media || {}
      })) || [];
      
      return teachers;
    } catch (error) {
      console.error(`Exception fetching teachers by availability ${availability}:`, error);
      return [];
    }
  },

  async searchTeachers(query: string): Promise<Teacher[]> {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`);
      
      if (error) {
        console.error(`Error searching teachers with query ${query}:`, error);
        return [];
      }
      
      // Transform snake_case to camelCase (same as in getTeachers)
      const teachers = data?.map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        subjects: item.subjects || [],
        status: item.status,
        lastBooking: item.last_booking,
        rating: item.rating,
        favorite: item.favorite,
        availability: item.availability,
        address: item.address,
        website: item.website,
        specializations: item.specializations || [],
        preferredLocations: item.preferred_locations || [],
        reviews: item.reviews,
        notes: item.notes,
        
        // New fields with t_ prefix
        region: item.t_region,
        certifications: item.t_certifications || [],
        salaryExpectations: item.t_salary_expectations || { min: 0, max: 0, currency: 'GBP', rate: 'daily' },
        availabilitySchedule: item.t_availability_schedule || {},
        languages: item.t_languages || [],
        teachingMethods: item.t_teaching_methods || [],
        performanceRatings: item.t_performance_ratings || {},
        employmentHistory: item.t_employment_history || [],
        referenceContacts: item.t_reference_contacts || [],
        educationHistory: item.t_education_history || [],
        skills: item.t_skills || [],
        profileImageUrl: item.t_profile_image_url,
        dateOfBirth: item.t_date_of_birth,
        gender: item.t_gender,
        nationality: item.t_nationality,
        visaStatus: item.t_visa_status,
        dbsCheckDate: item.t_dbs_check_date,
        dbsCheckNumber: item.t_dbs_check_number,
        emergencyContact: item.t_emergency_contact || {},
        bankDetails: item.t_bank_details || {},
        taxInformation: item.t_tax_information || {},
        contractType: item.t_contract_type,
        contractDetails: item.t_contract_details || {},
        onboardingStatus: item.t_onboarding_status,
        onboardingCompletedAt: item.t_onboarding_completed_at,
        lastLogin: item.t_last_login,
        socialMedia: item.t_social_media || {}
      })) || [];
      
      return teachers;
    } catch (error) {
      console.error(`Exception searching teachers with query ${query}:`, error);
      return [];
    }
  }
}; 