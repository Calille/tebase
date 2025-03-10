-- Add new columns to the bookings table
ALTER TABLE bookings 
ADD COLUMN b_description TEXT,
ADD COLUMN b_requirements TEXT,
ADD COLUMN b_special_instructions TEXT,
ADD COLUMN b_contact_person TEXT,
ADD COLUMN b_contact_email TEXT,
ADD COLUMN b_contact_phone TEXT,
ADD COLUMN b_location TEXT,
ADD COLUMN b_room_number TEXT,
ADD COLUMN b_class_size INTEGER,
ADD COLUMN b_grade_level TEXT,
ADD COLUMN b_materials_provided BOOLEAN DEFAULT false,
ADD COLUMN b_materials_required TEXT[] DEFAULT '{}',
ADD COLUMN b_lesson_plans JSONB[] DEFAULT '{}',
ADD COLUMN b_schedule JSONB DEFAULT '{}',
ADD COLUMN b_recurring_pattern TEXT,
ADD COLUMN b_cancellation_policy TEXT,
ADD COLUMN b_cancellation_notice_days INTEGER DEFAULT 1,
ADD COLUMN b_cancellation_fee NUMERIC DEFAULT 0,
ADD COLUMN b_payment_status TEXT DEFAULT 'pending',
ADD COLUMN b_payment_date DATE,
ADD COLUMN b_invoice_number TEXT,
ADD COLUMN b_invoice_date DATE,
ADD COLUMN b_invoice_due_date DATE,
ADD COLUMN b_payment_method TEXT,
ADD COLUMN b_payment_details JSONB DEFAULT '{}',
ADD COLUMN b_timesheet_submitted BOOLEAN DEFAULT false,
ADD COLUMN b_timesheet_approved BOOLEAN DEFAULT false,
ADD COLUMN b_timesheet_details JSONB DEFAULT '{}',
ADD COLUMN b_feedback_teacher TEXT,
ADD COLUMN b_feedback_school TEXT,
ADD COLUMN b_rating_teacher INTEGER,
ADD COLUMN b_rating_school INTEGER,
ADD COLUMN b_created_by TEXT,
ADD COLUMN b_updated_by TEXT,
ADD COLUMN b_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN b_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Comment on the new columns
COMMENT ON COLUMN bookings.b_description IS 'Detailed description of the booking';
COMMENT ON COLUMN bookings.b_requirements IS 'Specific requirements for the booking';
COMMENT ON COLUMN bookings.b_special_instructions IS 'Special instructions for the teacher';
COMMENT ON COLUMN bookings.b_contact_person IS 'Contact person at the school for this booking';
COMMENT ON COLUMN bookings.b_contact_email IS 'Email of the contact person';
COMMENT ON COLUMN bookings.b_contact_phone IS 'Phone number of the contact person';
COMMENT ON COLUMN bookings.b_location IS 'Specific location within the school';
COMMENT ON COLUMN bookings.b_room_number IS 'Room number for the class';
COMMENT ON COLUMN bookings.b_class_size IS 'Number of students in the class';
COMMENT ON COLUMN bookings.b_grade_level IS 'Grade level of the students';
COMMENT ON COLUMN bookings.b_materials_provided IS 'Whether teaching materials are provided by the school';
COMMENT ON COLUMN bookings.b_materials_required IS 'Array of materials the teacher needs to bring';
COMMENT ON COLUMN bookings.b_lesson_plans IS 'Array of JSON objects with lesson plans';
COMMENT ON COLUMN bookings.b_schedule IS 'JSON object with detailed schedule information';
COMMENT ON COLUMN bookings.b_recurring_pattern IS 'Pattern for recurring bookings (e.g., "weekly", "daily")';
COMMENT ON COLUMN bookings.b_cancellation_policy IS 'Cancellation policy for this booking';
COMMENT ON COLUMN bookings.b_cancellation_notice_days IS 'Number of days notice required for cancellation';
COMMENT ON COLUMN bookings.b_cancellation_fee IS 'Fee charged for late cancellation';
COMMENT ON COLUMN bookings.b_payment_status IS 'Status of payment (pending, paid, overdue)';
COMMENT ON COLUMN bookings.b_payment_date IS 'Date when payment was made';
COMMENT ON COLUMN bookings.b_invoice_number IS 'Invoice number for this booking';
COMMENT ON COLUMN bookings.b_invoice_date IS 'Date when the invoice was issued';
COMMENT ON COLUMN bookings.b_invoice_due_date IS 'Due date for the invoice';
COMMENT ON COLUMN bookings.b_payment_method IS 'Method of payment';
COMMENT ON COLUMN bookings.b_payment_details IS 'JSON object with payment details';
COMMENT ON COLUMN bookings.b_timesheet_submitted IS 'Whether the timesheet has been submitted';
COMMENT ON COLUMN bookings.b_timesheet_approved IS 'Whether the timesheet has been approved';
COMMENT ON COLUMN bookings.b_timesheet_details IS 'JSON object with timesheet details';
COMMENT ON COLUMN bookings.b_feedback_teacher IS 'Feedback from the teacher about the booking';
COMMENT ON COLUMN bookings.b_feedback_school IS 'Feedback from the school about the teacher';
COMMENT ON COLUMN bookings.b_rating_teacher IS 'Rating given to the teacher (1-5)';
COMMENT ON COLUMN bookings.b_rating_school IS 'Rating given to the school (1-5)';
COMMENT ON COLUMN bookings.b_created_by IS 'User who created the booking';
COMMENT ON COLUMN bookings.b_updated_by IS 'User who last updated the booking';
COMMENT ON COLUMN bookings.b_created_at IS 'Timestamp when the booking was created';
COMMENT ON COLUMN bookings.b_updated_at IS 'Timestamp when the booking was last updated'; 