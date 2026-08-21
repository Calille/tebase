import {
  CreateResult,
  WriteResult,
  demoCreateResult,
  demoWriteResult,
  failedCreateResult,
  failedWriteResult,
} from "@/lib/persistence";

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  status: "active" | "inactive" | "pending";
  lastBooking: string;
  rating: number;
  favorite: boolean;
  availability: "full-time" | "part-time" | "weekends";
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
  region?: string;
  certifications?: string[];
  salaryExpectations?: {
    min: number;
    max: number;
    currency: string;
    rate: string;
  };
  availabilitySchedule?: Record<string, unknown>;
  languages?: string[];
  teachingMethods?: string[];
  performanceRatings?: Record<string, unknown>;
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
  taxInformation?: Record<string, unknown>;
  contractType?: string;
  contractDetails?: Record<string, unknown>;
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

export type TeacherPatch = Partial<Teacher>;

/** Teacher record plus form-only section fields used by the profile tabs. */
export type TeacherFormSeed = Omit<Partial<Teacher>, "address"> & {
  address?:
    | string
    | {
        street?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
      };
  firstName?: string;
  middleName?: string;
  lastName?: string;
  secondaryPhone?: string;
  resumeFileName?: string;
  gradeLevels?: string[];
  yearsOfExperience?: number;
  hasResume?: boolean;
  backgroundCheckStatus?: string;
  backgroundCheckDate?: string;
  backgroundCheckReference?: string;
  references?: Array<Record<string, string>>;
  specialSkills?: string;
  accommodationRequired?: boolean;
  accommodationDetails?: string;
  adminNotes?: string;
  maxTravelDistance?: number;
  travelDistanceUnit?: string;
  noticePeriod?: number;
  noticePeriodUnit?: string;
  availabilityNotes?: string;
  paymentMethod?: string;
  paypalEmail?: string;
};


import { datasetGeneration, getDataset } from "@/mocks";

let teachersStore: Teacher[] = [];
let seenGeneration = -1;

function hydrateTeachers() {
  const generation = datasetGeneration();
  if (seenGeneration === generation && teachersStore.length > 0) return;
  teachersStore = getDataset().teacherProfiles.map(cloneTeacher);
  seenGeneration = generation;
}

function cloneTeacher(teacher: Teacher): Teacher {
  return {
    ...teacher,
    subjects: [...(teacher.subjects || [])],
    documents: teacher.documents ? [...teacher.documents] : [],
  };
}

function applyTeacherPatch(teacher: Teacher, patch: TeacherPatch): Teacher {
  const next: Teacher = { ...teacher, ...patch };
  const extra = patch as TeacherPatch & {
    t_bank_details?: Teacher["bankDetails"];
    t_tax_information?: Teacher["taxInformation"];
    t_emergency_contact?: Teacher["emergencyContact"];
    t_profile_image_url?: string;
    t_certifications?: string[];
    t_languages?: string[];
  };

  if (extra.t_bank_details) {
    next.bankDetails = extra.t_bank_details;
  }
  if (extra.t_tax_information) {
    next.taxInformation = extra.t_tax_information;
  }
  if (extra.t_emergency_contact) {
    next.emergencyContact = extra.t_emergency_contact;
  }
  if (typeof extra.t_profile_image_url === "string") {
    next.profileImageUrl = extra.t_profile_image_url;
  }
  if (Array.isArray(extra.t_certifications)) {
    next.certifications = extra.t_certifications;
  }
  if (Array.isArray(extra.t_languages)) {
    next.languages = extra.t_languages;
  }

  return next;
}

function findTeacherIndex(id: string): number {
  return teachersStore.findIndex((teacher) => teacher.id === id);
}

/**
 * Teacher records are session-local sample data until the Supabase schema
 * is aligned with this TypeScript model. Writes update this store only.
 */
export const teacherService = {
  async getTeachers(): Promise<Teacher[]> {
    hydrateTeachers();
    return teachersStore.map(cloneTeacher);
  },

  async getTeacherById(id: string): Promise<Teacher | null> {
    hydrateTeachers();
    const teacher = teachersStore.find((item) => item.id === id);
    return teacher ? cloneTeacher(teacher) : null;
  },

  async createTeacher(
    teacher: Partial<Teacher> & { name: string; email: string }
  ): Promise<CreateResult<Teacher>> {
    hydrateTeachers();
    try {
      const newTeacher: Teacher = {
        phone: teacher.phone || "",
        subjects: teacher.subjects || [],
        status: teacher.status || "pending",
        lastBooking: teacher.lastBooking || "",
        rating: teacher.rating || 0,
        favorite: teacher.favorite || false,
        availability: teacher.availability || "part-time",
        ...teacher,
        id: `teacher-${Date.now()}`,
        name: teacher.name,
        email: teacher.email,
        documents: teacher.documents || [],
      };

      teachersStore.push(newTeacher);
      return demoCreateResult(cloneTeacher(newTeacher));
    } catch (error) {
      console.error("Error creating teacher:", error);
      return failedCreateResult(
        error instanceof Error ? error.message : "Failed to create teacher"
      );
    }
  },

  async updateTeacher(id: string, patch: TeacherPatch): Promise<WriteResult> {
    hydrateTeachers();
    const index = findTeacherIndex(id);
    if (index === -1) {
      return failedWriteResult("Teacher not found");
    }

    teachersStore[index] = applyTeacherPatch(teachersStore[index], patch);
    return demoWriteResult();
  },

  async deleteTeacher(id: string): Promise<WriteResult> {
    hydrateTeachers();
    const index = findTeacherIndex(id);
    if (index === -1) {
      return failedWriteResult("Teacher not found");
    }

    teachersStore.splice(index, 1);
    return demoWriteResult();
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<WriteResult> {
    return this.updateTeacher(id, { favorite: isFavorite });
  },

  async updateTeacherStatus(
    id: string,
    status: "active" | "inactive" | "pending"
  ): Promise<WriteResult> {
    return this.updateTeacher(id, { status });
  },

  async updateTeacherOnboardingStatus(
    id: string,
    onboardingStatus: string
  ): Promise<WriteResult> {
    return this.updateTeacher(id, {
      onboardingStatus,
      onboardingCompletedAt:
        onboardingStatus === "completed" ? new Date().toISOString() : undefined,
    });
  },

  async addTeacherDocument(
    teacherId: string,
    document: { name: string; status: string; expiryDate: string }
  ): Promise<WriteResult> {
    hydrateTeachers();
    const index = findTeacherIndex(teacherId);
    if (index === -1) {
      return failedWriteResult("Teacher not found");
    }

    const documents = [...(teachersStore[index].documents || []), document];
    teachersStore[index] = { ...teachersStore[index], documents };
    return demoWriteResult();
  },

  async updateTeacherEmploymentHistory(
    teacherId: string,
    employmentHistory: Teacher["employmentHistory"]
  ): Promise<WriteResult> {
    return this.updateTeacher(teacherId, { employmentHistory });
  },

  async updateTeacherEducationHistory(
    teacherId: string,
    educationHistory: Teacher["educationHistory"]
  ): Promise<WriteResult> {
    return this.updateTeacher(teacherId, { educationHistory });
  },

  async getTeachersByRegion(region: string): Promise<Teacher[]> {
    hydrateTeachers();
    return teachersStore
      .filter((teacher) => teacher.region === region)
      .map(cloneTeacher);
  },

  async getTeachersByAvailability(
    availability: "full-time" | "part-time" | "weekends"
  ): Promise<Teacher[]> {
    hydrateTeachers();
    return teachersStore
      .filter((teacher) => teacher.availability === availability)
      .map(cloneTeacher);
  },

  async searchTeachers(query: string): Promise<Teacher[]> {
    hydrateTeachers();
    const needle = query.toLowerCase();
    return teachersStore
      .filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(needle) ||
          teacher.email.toLowerCase().includes(needle) ||
          teacher.phone.toLowerCase().includes(needle)
      )
      .map(cloneTeacher);
  },
};
