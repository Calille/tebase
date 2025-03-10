import { supabase } from '@/lib/supabase';

export interface Booking {
  id: string;
  reference: string;
  school: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  subject: string;
  startDate: string;
  endDate: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  duration: string;
  rate: number;
  notes?: string;
}

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          school:school_id (id, name),
          teacher:teacher_id (id, name)
        `);
      
      if (error) {
        console.error('Error fetching bookings:', error);
        return [];
      }
      
      // Transform the data to match our interface
      const bookings = data?.map(item => ({
        id: item.id,
        reference: item.reference,
        school: item.school,
        teacher: item.teacher,
        subject: item.subject,
        startDate: item.start_date,
        endDate: item.end_date,
        status: item.status,
        duration: item.duration,
        rate: item.rate,
        notes: item.notes
      })) || [];
      
      return bookings;
    } catch (error) {
      console.error('Exception fetching bookings:', error);
      return [];
    }
  },

  async getBookingById(id: string): Promise<Booking | null> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          school:school_id (id, name),
          teacher:teacher_id (id, name)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Error fetching booking with ID ${id}:`, error);
        return null;
      }
      
      if (!data) return null;
      
      // Transform the data to match our interface
      const booking: Booking = {
        id: data.id,
        reference: data.reference,
        school: data.school,
        teacher: data.teacher,
        subject: data.subject,
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status,
        duration: data.duration,
        rate: data.rate,
        notes: data.notes
      };
      
      return booking;
    } catch (error) {
      console.error(`Exception fetching booking with ID ${id}:`, error);
      return null;
    }
  },

  async createBooking(booking: Omit<Booking, 'id'>): Promise<Booking | null> {
    try {
      // Transform the data to match the database schema
      const bookingData = {
        reference: booking.reference,
        school_id: booking.school.id,
        teacher_id: booking.teacher.id,
        subject: booking.subject,
        start_date: booking.startDate,
        end_date: booking.endDate,
        status: booking.status,
        duration: booking.duration,
        rate: booking.rate,
        notes: booking.notes
      };
      
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select(`
          *,
          school:school_id (id, name),
          teacher:teacher_id (id, name)
        `);
      
      if (error) {
        console.error('Error creating booking:', error);
        return null;
      }
      
      if (!data || data.length === 0) return null;
      
      // Transform the response to match our interface
      const newBooking: Booking = {
        id: data[0].id,
        reference: data[0].reference,
        school: data[0].school,
        teacher: data[0].teacher,
        subject: data[0].subject,
        startDate: data[0].start_date,
        endDate: data[0].end_date,
        status: data[0].status,
        duration: data[0].duration,
        rate: data[0].rate,
        notes: data[0].notes
      };
      
      return newBooking;
    } catch (error) {
      console.error('Exception creating booking:', error);
      return null;
    }
  },

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    try {
      // Transform the updates to match the database schema
      const updateData: any = {};
      
      if (updates.reference) updateData.reference = updates.reference;
      if (updates.school) updateData.school_id = updates.school.id;
      if (updates.teacher) updateData.teacher_id = updates.teacher.id;
      if (updates.subject) updateData.subject = updates.subject;
      if (updates.startDate) updateData.start_date = updates.startDate;
      if (updates.endDate) updateData.end_date = updates.endDate;
      if (updates.status) updateData.status = updates.status;
      if (updates.duration) updateData.duration = updates.duration;
      if (updates.rate !== undefined) updateData.rate = updates.rate;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      
      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          school:school_id (id, name),
          teacher:teacher_id (id, name)
        `);
      
      if (error) {
        console.error(`Error updating booking with ID ${id}:`, error);
        return null;
      }
      
      if (!data || data.length === 0) return null;
      
      // Transform the response to match our interface
      const updatedBooking: Booking = {
        id: data[0].id,
        reference: data[0].reference,
        school: data[0].school,
        teacher: data[0].teacher,
        subject: data[0].subject,
        startDate: data[0].start_date,
        endDate: data[0].end_date,
        status: data[0].status,
        duration: data[0].duration,
        rate: data[0].rate,
        notes: data[0].notes
      };
      
      return updatedBooking;
    } catch (error) {
      console.error(`Exception updating booking with ID ${id}:`, error);
      return null;
    }
  },

  async deleteBooking(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Error deleting booking with ID ${id}:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Exception deleting booking with ID ${id}:`, error);
      return false;
    }
  },

  async getBookingsBySchool(schoolId: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          school:school_id (id, name),
          teacher:teacher_id (id, name)
        `)
        .eq('school_id', schoolId);
      
      if (error) {
        console.error(`Error fetching bookings for school ${schoolId}:`, error);
        return [];
      }
      
      // Transform the data to match our interface
      const bookings = data?.map(item => ({
        id: item.id,
        reference: item.reference,
        school: item.school,
        teacher: item.teacher,
        subject: item.subject,
        startDate: item.start_date,
        endDate: item.end_date,
        status: item.status,
        duration: item.duration,
        rate: item.rate,
        notes: item.notes
      })) || [];
      
      return bookings;
    } catch (error) {
      console.error(`Exception fetching bookings for school ${schoolId}:`, error);
      return [];
    }
  },

  async getBookingsByTeacher(teacherId: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          school:school_id (id, name),
          teacher:teacher_id (id, name)
        `)
        .eq('teacher_id', teacherId);
      
      if (error) {
        console.error(`Error fetching bookings for teacher ${teacherId}:`, error);
        return [];
      }
      
      // Transform the data to match our interface
      const bookings = data?.map(item => ({
        id: item.id,
        reference: item.reference,
        school: item.school,
        teacher: item.teacher,
        subject: item.subject,
        startDate: item.start_date,
        endDate: item.end_date,
        status: item.status,
        duration: item.duration,
        rate: item.rate,
        notes: item.notes
      })) || [];
      
      return bookings;
    } catch (error) {
      console.error(`Exception fetching bookings for teacher ${teacherId}:`, error);
      return [];
    }
  }
}; 