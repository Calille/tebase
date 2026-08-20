import {
  CreateResult,
  WriteResult,
  demoCreateResult,
  demoWriteResult,
  failedCreateResult,
  failedWriteResult,
} from "@/lib/persistence";

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

function seedSchools(): School[] {
  return [
        {
          id: 'school-1',
          name: 'Oakwood Primary School',
          type: 'public',
          address: {
            street: '123 Education Lane',
            city: 'London',
            state: 'Greater London',
            zip: 'SW1A 1AA',
            country: 'United Kingdom'
          },
          phone: '020 7123 4567',
          website: 'https://www.oakwoodprimary.edu.uk',
          district: 'Westminster',
          yearEstablished: 1985,
          numberOfStudents: 450,
          gradeLevels: ['Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'],
          schoolHours: '8:45 AM - 3:15 PM',
          
          primaryContact: {
            name: 'Sarah Johnson',
            position: 'Head of Administration',
            phone: '020 7123 4568',
            email: 'sjohnson@oakwoodprimary.edu.uk',
            preferredContactMethod: 'email',
            notes: 'Prefers to be contacted in the morning',
            verified: true,
            lastContactDate: '2023-05-15'
          },
          
          secondaryContact: {
            name: 'Michael Brown',
            position: 'Deputy Head',
            phone: '020 7123 4569',
            email: 'mbrown@oakwoodprimary.edu.uk',
            preferredContactMethod: 'phone',
            notes: 'Available in the afternoons',
            verified: true,
            lastContactDate: '2023-05-10'
          },
          
          financeContact: {
            name: 'Emma Wilson',
            position: 'Finance Manager',
            phone: '020 7123 4570',
            email: 'ewilson@oakwoodprimary.edu.uk',
            billingAddress: {
              street: '123 Education Lane',
              city: 'London',
              state: 'Greater London',
              zip: 'SW1A 1AA',
              country: 'United Kingdom'
            },
            invoicingPreferences: 'Electronic',
            paymentTerms: 'Net 30',
            purchaseOrderRequired: true,
            verified: true,
            lastContactDate: '2023-05-05'
          },
          
          sendcoContact: {
            name: 'David Taylor',
            position: 'SENDCO',
            phone: '020 7123 4571',
            email: 'dtaylor@oakwoodprimary.edu.uk',
            specializations: ['Dyslexia', 'ADHD', 'Autism'],
            availability: 'Tuesday and Thursday afternoons',
            notes: 'Prefers detailed information about special needs in advance',
            verified: true,
            lastContactDate: '2023-05-12'
          },
          
          headteacherContact: {
            name: 'Jennifer Smith',
            position: 'Headteacher',
            phone: '020 7123 4572',
            email: 'jsmith@oakwoodprimary.edu.uk',
            assistantInfo: 'Lisa Green, lgreen@oakwoodprimary.edu.uk, 020 7123 4573',
            bestTimeToContact: 'Wednesday mornings',
            verified: true,
            lastContactDate: '2023-05-08'
          },
          
          specialPrograms: ['Music Excellence', 'STEM Focus', 'Language Immersion'],
          keyDates: [
            {
              name: 'Summer Term Start',
              date: '2023-04-17',
              description: 'Beginning of summer term'
            },
            {
              name: 'Half Term Break',
              date: '2023-05-29',
              description: 'One week break'
            },
            {
              name: 'Summer Term End',
              date: '2023-07-21',
              description: 'End of academic year'
            }
          ],
          substituteRequirements: 'Must have DBS check and at least 2 years of teaching experience',
          historicalPlacementNotes: 'Typically requires 5-10 substitute teachers per term',
          administrativeNotes: 'School has a strong focus on arts and music',
          
          documents: [
            {
              name: 'School Handbook',
              type: 'PDF',
              uploadDate: '2023-01-15',
              url: 'https://example.com/handbook.pdf'
            },
            {
              name: 'Staff Policies',
              type: 'PDF',
              uploadDate: '2023-02-10',
              url: 'https://example.com/policies.pdf'
            }
          ]
        },
        {
          id: 'school-2',
          name: 'Riverside Secondary School',
          type: 'public',
          address: {
            street: '456 Learning Road',
            city: 'Manchester',
            state: 'Greater Manchester',
            zip: 'M1 1AA',
            country: 'United Kingdom'
          },
          phone: '0161 234 5678',
          website: 'https://www.riversideschool.edu.uk',
          district: 'Manchester City',
          yearEstablished: 1972,
          numberOfStudents: 950,
          gradeLevels: ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13'],
          schoolHours: '8:30 AM - 3:30 PM',
          
          primaryContact: {
            name: 'Robert Davis',
            position: 'School Administrator',
            phone: '0161 234 5679',
            email: 'rdavis@riversideschool.edu.uk',
            preferredContactMethod: 'email',
            notes: 'Very responsive to emails',
            verified: true,
            lastContactDate: '2023-05-18'
          },
          
          secondaryContact: {
            name: 'Amanda White',
            position: 'Office Manager',
            phone: '0161 234 5680',
            email: 'awhite@riversideschool.edu.uk',
            preferredContactMethod: 'phone',
            notes: 'Available 9 AM - 4 PM weekdays',
            verified: true,
            lastContactDate: '2023-05-16'
          },
          
          financeContact: {
            name: 'James Thompson',
            position: 'Finance Director',
            phone: '0161 234 5681',
            email: 'jthompson@riversideschool.edu.uk',
            billingAddress: {
              street: '456 Learning Road',
              city: 'Manchester',
              state: 'Greater Manchester',
              zip: 'M1 1AA',
              country: 'United Kingdom'
            },
            invoicingPreferences: 'Paper and Electronic',
            paymentTerms: 'Net 45',
            purchaseOrderRequired: true,
            verified: true,
            lastContactDate: '2023-05-14'
          },
          
          sendcoContact: {
            name: 'Patricia Harris',
            position: 'Head of SEN Department',
            phone: '0161 234 5682',
            email: 'pharris@riversideschool.edu.uk',
            specializations: ['Visual Impairment', 'Hearing Impairment', 'Physical Disabilities'],
            availability: 'Monday to Thursday, 10 AM - 2 PM',
            notes: 'Requires advance notice for meetings',
            verified: true,
            lastContactDate: '2023-05-11'
          },
          
          headteacherContact: {
            name: 'Richard Wilson',
            position: 'Principal',
            phone: '0161 234 5683',
            email: 'rwilson@riversideschool.edu.uk',
            assistantInfo: 'Mary Johnson, mjohnson@riversideschool.edu.uk, 0161 234 5684',
            bestTimeToContact: 'Friday afternoons',
            verified: true,
            lastContactDate: '2023-05-09'
          },
          
          specialPrograms: ['Advanced Mathematics', 'Sports Excellence', 'Performing Arts'],
          keyDates: [
            {
              name: 'Summer Term Start',
              date: '2023-04-17',
              description: 'Beginning of summer term'
            },
            {
              name: 'Exam Period',
              date: '2023-06-05',
              description: 'GCSE and A-Level examinations'
            },
            {
              name: 'Summer Term End',
              date: '2023-07-21',
              description: 'End of academic year'
            }
          ],
          substituteRequirements: 'Subject specialists preferred, must have QTS and DBS check',
          historicalPlacementNotes: 'High demand for science and mathematics substitutes',
          administrativeNotes: 'School has a strong academic focus with excellent exam results',
          
          documents: [
            {
              name: 'School Prospectus',
              type: 'PDF',
              uploadDate: '2023-03-10',
              url: 'https://example.com/prospectus.pdf'
            },
            {
              name: 'Staff Handbook',
              type: 'PDF',
              uploadDate: '2023-01-20',
              url: 'https://example.com/staff-handbook.pdf'
            }
          ]
        }
      ];
}

function getSchoolStore(): School[] {
  if (!schoolsStore) {
    schoolsStore = seedSchools();
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
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Find the school in our mock data
      const school = this.mockSchools.find(s => s.id === schoolId);
      
      return school || null;
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
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return this.mockSchools;
    } catch (error) {
      console.error("Error fetching schools:", error);
      return [];
    }
  }
  
  /**
   * Mock school data for demonstration purposes
   */
  private static mockSchools: Array<{
    id: string;
    name: string;
    contactName: string;
    contactEmail: string;
  }> = [
    {
      id: "s1",
      name: "Oakridge Secondary School",
      contactName: "James Wilson",
      contactEmail: "j.wilson@oakridge.edu",
    },
    {
      id: "s2",
      name: "Westfield Academy",
      contactName: "Sarah Thompson",
      contactEmail: "s.thompson@westfield-academy.org",
    },
    {
      id: "s3",
      name: "Northside Science Academy",
      contactName: "David Chen",
      contactEmail: "d.chen@northsidescience.edu",
    },
    {
      id: "s4",
      name: "Creative Arts School",
      contactName: "Emily Rodriguez",
      contactEmail: "e.rodriguez@creative-arts.org",
    },
    {
      id: "s5",
      name: "St. Mary's Primary School",
      contactName: "Michael Johnson",
      contactEmail: "m.johnson@stmarys.edu",
    },
    {
      id: "s6",
      name: "Riverside Elementary",
      contactName: "Lisa Brown",
      contactEmail: "l.brown@riverside-elem.org",
    },
    {
      id: "s7",
      name: "Greenwood High School",
      contactName: "Robert Smith",
      contactEmail: "r.smith@greenwood.edu",
    },
    {
      id: "s8",
      name: "Tech Innovation Institute",
      contactName: "Jennifer Lee",
      contactEmail: "j.lee@techinnovation.org",
    },
  ];
} 