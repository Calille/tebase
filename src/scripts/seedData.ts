import { supabase } from '../lib/supabase';

// Sample teacher data
const teachers = [
  {
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "(555) 123-4567",
    subjects: ["Mathematics", "Physics"],
    status: "active",
    last_booking: "2023-06-15",
    rating: 4.8,
    favorite: true,
    availability: "full-time",
    address: "123 Teacher Lane, Manchester, M1 1AA",
    website: "https://www.johnsmith-education.com",
    specializations: ["Algebra", "Calculus", "Statistics"],
    preferred_locations: ["Manchester", "Liverpool", "Leeds"],
    reviews: 24,
    notes: "Experienced mathematics teacher with a strong background in advanced topics."
  },
  {
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "(555) 987-6543",
    subjects: ["English", "Literature"],
    status: "active",
    last_booking: "2023-06-10",
    rating: 4.5,
    favorite: false,
    availability: "part-time",
    address: "456 Education Street, Liverpool, L1 2BB",
    specializations: ["Creative Writing", "Poetry", "Shakespeare"],
    preferred_locations: ["Liverpool", "Manchester"],
    reviews: 18,
    notes: "Passionate about literature and creative writing."
  },
  {
    name: "Michael Chen",
    email: "m.chen@example.com",
    phone: "(555) 456-7890",
    subjects: ["Chemistry", "Biology"],
    status: "active",
    last_booking: "2023-06-05",
    rating: 4.9,
    favorite: true,
    availability: "full-time",
    address: "789 Science Road, Leeds, LS1 3CC",
    website: "https://www.chenscience.edu",
    specializations: ["Organic Chemistry", "Molecular Biology", "Genetics"],
    preferred_locations: ["Leeds", "York", "Sheffield"],
    reviews: 32,
    notes: "PhD in Chemistry with 10+ years of teaching experience."
  }
];

// Sample school data
const schools = [
  {
    name: "Westfield High School",
    address: "123 Education Ave",
    city: "Manchester",
    contact_person: "Jane Wilson",
    email: "j.wilson@westfield.edu",
    phone: "(555) 123-4567",
    type: "secondary",
    status: "active",
    last_booking: "2023-06-15",
    rating: 4.8,
    favorite: true,
    teachers_needed: 3
  },
  {
    name: "Oakridge Elementary",
    address: "456 Learning Lane",
    city: "Birmingham",
    contact_person: "Robert Brown",
    email: "r.brown@oakridge.edu",
    phone: "(555) 987-6543",
    type: "primary",
    status: "active",
    last_booking: "2023-06-10",
    rating: 4.5,
    favorite: false,
    teachers_needed: 2
  },
  {
    name: "Riverside College",
    address: "789 Academic Blvd",
    city: "Liverpool",
    contact_person: "Sarah Chen",
    email: "s.chen@riverside.edu",
    phone: "(555) 456-7890",
    type: "college",
    status: "active",
    last_booking: "2023-06-05",
    rating: 4.9,
    favorite: true,
    teachers_needed: 5
  }
];

// Function to seed the database
export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Insert teachers
    console.log('Inserting teachers...');
    const { data: teachersData, error: teachersError } = await supabase
      .from('teachers')
      .insert(teachers)
      .select();
    
    if (teachersError) {
      throw new Error(`Error inserting teachers: ${teachersError.message}`);
    }
    
    console.log(`Successfully inserted ${teachersData.length} teachers`);
    
    // Insert schools
    console.log('Inserting schools...');
    const { data: schoolsData, error: schoolsError } = await supabase
      .from('schools')
      .insert(schools)
      .select();
    
    if (schoolsError) {
      throw new Error(`Error inserting schools: ${schoolsError.message}`);
    }
    
    console.log(`Successfully inserted ${schoolsData.length} schools`);
    
    // Create bookings using the inserted teachers and schools
    if (teachersData && schoolsData && teachersData.length > 0 && schoolsData.length > 0) {
      console.log('Inserting bookings...');
      
      const bookings = [
        {
          reference: "TB-2023-001",
          school_id: schoolsData[0].id,
          teacher_id: teachersData[0].id,
          subject: "Mathematics",
          start_date: "2023-06-15",
          end_date: "2023-06-30",
          status: "confirmed",
          duration: "2 weeks",
          rate: 150,
          notes: "Covering for Mrs. Johnson who is on maternity leave"
        },
        {
          reference: "TB-2023-002",
          school_id: schoolsData[1].id,
          teacher_id: teachersData[1].id,
          subject: "English",
          start_date: "2023-06-20",
          end_date: "2023-07-10",
          status: "pending",
          duration: "3 weeks",
          rate: 130,
          notes: "Temporary position for summer school program"
        },
        {
          reference: "TB-2023-003",
          school_id: schoolsData[2].id,
          teacher_id: teachersData[2].id,
          subject: "Chemistry",
          start_date: "2023-06-01",
          end_date: "2023-06-10",
          status: "completed",
          duration: "2 weeks",
          rate: 175,
          notes: "Advanced placement chemistry course"
        }
      ];
      
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .insert(bookings)
        .select();
      
      if (bookingsError) {
        throw new Error(`Error inserting bookings: ${bookingsError.message}`);
      }
      
      console.log(`Successfully inserted ${bookingsData.length} bookings`);
    }
    
    console.log('Database seeding completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Export a function to run the seeding
export const runSeed = async () => {
  const result = await seedDatabase();
  return result;
};