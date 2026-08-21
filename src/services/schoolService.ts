import {
  CreateResult,
  WriteResult,
  demoCreateResult,
  demoWriteResult,
  failedCreateResult,
  failedWriteResult,
} from "@/lib/persistence";
import { datasetGeneration, getDataset } from "@/mocks";

export interface School {
  id: string;
  name: string;
  type: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  phone: string;
  website: string;
  district: string;
  yearEstablished: number;
  numberOfStudents: number;
  gradeLevels: string[];
  schoolHours: string;
  
  // Primary Contact
  primaryContact: {
    name: string;
    position: string;
    phone: string;
    email: string;
    preferredContactMethod: string;
    notes: string;
    verified: boolean;
    lastContactDate: string;
  };
  
  // Secondary Contact
  secondaryContact: {
    name: string;
    position: string;
    phone: string;
    email: string;
    preferredContactMethod: string;
    notes: string;
    verified: boolean;
    lastContactDate: string;
  };
  
  // Finance Contact
  financeContact: {
    name: string;
    position: string;
    phone: string;
    email: string;
    billingAddress: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    invoicingPreferences: string;
    paymentTerms: string;
    purchaseOrderRequired: boolean;
    verified: boolean;
    lastContactDate: string;
  };
  
  // SENDCO Contact
  sendcoContact: {
    name: string;
    position: string;
    phone: string;
    email: string;
    specializations: string[];
    availability: string;
    notes: string;
    verified: boolean;
    lastContactDate: string;
  };
  
  // Headteacher/Principal Contact
  headteacherContact: {
    name: string;
    position: string;
    phone: string;
    email: string;
    assistantInfo: string;
    bestTimeToContact: string;
    verified: boolean;
    lastContactDate: string;
  };
  
  // Additional Information
  specialPrograms: string[];
  keyDates: {
    name: string;
    date: string;
    description: string;
  }[];
  substituteRequirements: string;
  historicalPlacementNotes: string;
  administrativeNotes: string;
  
  // Documents
  documents: {
    name: string;
    type: string;
    uploadDate: string;
    url: string;
  }[];
  favorite?: boolean;
}

let schoolsStore: School[] | null = null;
let seenGeneration = -1;

function seedSchools(): School[] {
  return getDataset().schoolProfiles.map((school) => ({ ...school }));
}

function getSchoolStore(): School[] {
  const generation = datasetGeneration();
  if (!schoolsStore || seenGeneration !== generation) {
    schoolsStore = seedSchools();
    seenGeneration = generation;
  }
  return schoolsStore;
}

function emptyContact() {
  return {
    name: "",
    position: "",
    phone: "",
    email: "",
    preferredContactMethod: "email",
    notes: "",
    verified: false,
    lastContactDate: "",
  };
}

function schoolFromPartial(
  input: Partial<School> | Record<string, unknown>,
  id: string
): School {
  const partial = input as Partial<School>;
  const record = input as Record<string, unknown>;
  const addressInput = partial.address ?? record.address;
  const address =
    addressInput && typeof addressInput === "object"
      ? (addressInput as School["address"])
      : {
          street: typeof addressInput === "string" ? addressInput : "",
          city: typeof record.city === "string" ? record.city : "",
          state: "",
          zip: "",
          country: "United Kingdom",
        };

  return {
    id,
    name: partial.name || "New School",
    type: partial.type || "primary",
    address,
    phone: partial.phone || "",
    website: partial.website || "",
    district: partial.district || "",
    yearEstablished: partial.yearEstablished || new Date().getFullYear(),
    numberOfStudents: partial.numberOfStudents || 0,
    gradeLevels: partial.gradeLevels || [],
    schoolHours: partial.schoolHours || "",
    primaryContact: partial.primaryContact || {
      ...emptyContact(),
      name: typeof record.contactPerson === "string" ? record.contactPerson : "",
      email: typeof record.email === "string" ? record.email : "",
    },
    secondaryContact: partial.secondaryContact || emptyContact(),
    financeContact: partial.financeContact || {
      ...emptyContact(),
      billingAddress: address,
      invoicingPreferences: "",
      paymentTerms: "",
      purchaseOrderRequired: false,
    },
    sendcoContact: partial.sendcoContact || {
      ...emptyContact(),
      specializations: [],
      availability: "",
    },
    headteacherContact: partial.headteacherContact || {
      ...emptyContact(),
      assistantInfo: "",
      bestTimeToContact: "",
    },
    specialPrograms: partial.specialPrograms || [],
    keyDates: partial.keyDates || [],
    substituteRequirements: partial.substituteRequirements || "",
    historicalPlacementNotes: partial.historicalPlacementNotes || "",
    administrativeNotes: partial.administrativeNotes || "",
    documents: partial.documents || [],
    favorite: Boolean(partial.favorite ?? record.favorite),
  };
}

/**
 * School records are session-local sample data until the nested TypeScript
 * model is aligned with the Supabase schema. Writes update this store only.
 */
export const schoolService = {
  async getSchools(): Promise<School[]> {
    return getSchoolStore().map((school) => ({ ...school }));
  },

  async getSchoolById(id: string): Promise<School | null> {
    const school = getSchoolStore().find((item) => item.id === id);
    return school ? { ...school } : null;
  },

  async createSchool(
    school: Partial<School> | Record<string, unknown>
  ): Promise<CreateResult<School>> {
    try {
      const newSchool = schoolFromPartial(school, `school-${Date.now()}`);
      getSchoolStore().push(newSchool);
      return demoCreateResult({ ...newSchool });
    } catch (error) {
      console.error("Error creating school:", error);
      return failedCreateResult(
        error instanceof Error ? error.message : "Failed to create school"
      );
    }
  },

  async updateSchool(id: string, school: Partial<School>): Promise<WriteResult> {
    const store = getSchoolStore();
    const index = store.findIndex((item) => item.id === id);
    if (index === -1) {
      return failedWriteResult("School not found");
    }

    store[index] = { ...store[index], ...school };
    return demoWriteResult();
  },

  async deleteSchool(id: string): Promise<WriteResult> {
    const store = getSchoolStore();
    const index = store.findIndex((item) => item.id === id);
    if (index === -1) {
      return failedWriteResult("School not found");
    }

    store.splice(index, 1);
    return demoWriteResult();
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<WriteResult> {
    return this.updateSchool(id, { favorite: isFavorite });
  },

  async addSchoolDocument(
    schoolId: string,
    document: { name: string; type: string; url: string }
  ): Promise<WriteResult> {
    const store = getSchoolStore();
    const index = store.findIndex((item) => item.id === schoolId);
    if (index === -1) {
      return failedWriteResult("School not found");
    }

    const documents = [
      ...(store[index].documents || []),
      {
        ...document,
        uploadDate: new Date().toISOString().slice(0, 10),
      },
    ];
    store[index] = { ...store[index], documents };
    return demoWriteResult();
  },

  async searchSchools(query: string): Promise<School[]> {
    try {
      // For mock implementation, filter the mock schools by name
      const mockSchools = await this.getSchools();
      return mockSchools.filter(school => 
        school.name.toLowerCase().includes(query.toLowerCase()) ||
        school.address.city.toLowerCase().includes(query.toLowerCase()) ||
        school.type.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error(`Error searching schools:`, error);
      return [];
    }
  }
};

/**
 * Service for handling school-related operations
 */
export class SchoolService {
  /**
   * Get a school by ID
   * @param schoolId The ID of the school to retrieve
   * @returns A promise that resolves to the school object or null if not found
   */
  static async getSchoolById(schoolId: string): Promise<{
    id: string;
    name: string;
    contactName: string;
    contactEmail: string;
  } | null> {
    try {
      // In a real application, this would fetch from a database or API
      // For demo purposes, we'll return mock data
      
      // Simulate API call delay
      const school = getDataset().schools.find((item) => item.id === schoolId);
      if (!school) return null;
      return {
        id: school.id,
        name: school.name,
        contactName: school.contactName,
        contactEmail: school.contactEmail,
      };
    } catch (error) {
      console.error("Error fetching school:", error);
      return null;
    }
  }
  
  /**
   * Get all schools
   * @returns A promise that resolves to an array of school objects
   */
  static async getAllSchools(): Promise<Array<{
    id: string;
    name: string;
    contactName: string;
    contactEmail: string;
  }>> {
    try {
      // In a real application, this would fetch from a database or API
      // For demo purposes, we'll return mock data
      
      // Simulate API call delay
      return getDataset().schools.map((school) => ({
        id: school.id,
        name: school.name,
        contactName: school.contactName,
        contactEmail: school.contactEmail,
      }));
    } catch (error) {
      console.error("Error fetching schools:", error);
      return [];
    }
  }
  
} 