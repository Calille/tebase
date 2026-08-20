import { supabase } from "@/lib/supabase";

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
  status: "confirmed" | "pending" | "completed" | "cancelled";
  duration: string;
  rate: number;
  notes?: string;
}

type BookingRow = {
  id: string;
  reference: string;
  school: Booking["school"];
  teacher: Booking["teacher"];
  subject: string;
  start_date: string;
  end_date: string;
  status: Booking["status"];
  duration: string;
  rate: number;
  notes?: string;
};

type BookingUpdateRow = {
  reference?: string;
  school_id?: string;
  teacher_id?: string;
  subject?: string;
  start_date?: string;
  end_date?: string;
  status?: Booking["status"];
  duration?: string;
  rate?: number;
  notes?: string;
};

const BOOKING_SELECT = `
  *,
  school:school_id (id, name),
  teacher:teacher_id (id, name)
`;

function mapBooking(item: BookingRow): Booking {
  return {
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
    notes: item.notes,
  };
}

function throwIfError(error: { message: string } | null, fallback: string) {
  if (error) {
    throw new Error(error.message || fallback);
  }
}

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select(BOOKING_SELECT);

    throwIfError(error, "Failed to fetch bookings");
    return (data as BookingRow[] | null)?.map(mapBooking) || [];
  },

  async getBookingById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from("bookings")
      .select(BOOKING_SELECT)
      .eq("id", id)
      .maybeSingle();

    throwIfError(error, `Failed to fetch booking ${id}`);
    return data ? mapBooking(data as BookingRow) : null;
  },

  async createBooking(booking: Omit<Booking, "id">): Promise<Booking> {
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
      notes: booking.notes,
    };

    const { data, error } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select(BOOKING_SELECT);

    throwIfError(error, "Failed to create booking");
    if (!data || data.length === 0) {
      throw new Error("No booking returned after create");
    }
    return mapBooking(data[0] as BookingRow);
  },

  async updateBooking(
    id: string,
    updates: Partial<Booking>
  ): Promise<Booking> {
    const updateData: BookingUpdateRow = {};

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
      .from("bookings")
      .update(updateData)
      .eq("id", id)
      .select(BOOKING_SELECT);

    throwIfError(error, `Failed to update booking ${id}`);
    if (!data || data.length === 0) {
      throw new Error(`No booking returned after update ${id}`);
    }
    return mapBooking(data[0] as BookingRow);
  },

  async deleteBooking(id: string): Promise<void> {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    throwIfError(error, `Failed to delete booking ${id}`);
  },

  async getBookingsBySchool(schoolId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select(BOOKING_SELECT)
      .eq("school_id", schoolId);

    throwIfError(error, `Failed to fetch bookings for school ${schoolId}`);
    return (data as BookingRow[] | null)?.map(mapBooking) || [];
  },

  async getBookingsByTeacher(teacherId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select(BOOKING_SELECT)
      .eq("teacher_id", teacherId);

    throwIfError(error, `Failed to fetch bookings for teacher ${teacherId}`);
    return (data as BookingRow[] | null)?.map(mapBooking) || [];
  },
};
