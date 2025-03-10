-- Add new columns to the schools table
ALTER TABLE schools 
ADD COLUMN s_website TEXT,
ADD COLUMN s_logo_url TEXT,
ADD COLUMN s_description TEXT,
ADD COLUMN s_established_year INTEGER,
ADD COLUMN s_student_count INTEGER,
ADD COLUMN s_staff_count INTEGER,
ADD COLUMN s_facilities TEXT[] DEFAULT '{}',
ADD COLUMN s_subjects_offered TEXT[] DEFAULT '{}',
ADD COLUMN s_curriculum TEXT,
ADD COLUMN s_accreditations TEXT[] DEFAULT '{}',
ADD COLUMN s_rating_details JSONB DEFAULT '{}',
ADD COLUMN s_social_media JSONB DEFAULT '{}',
ADD COLUMN s_contact_details JSONB DEFAULT '{}',
ADD COLUMN s_additional_contacts JSONB[] DEFAULT '{}',
ADD COLUMN s_billing_address TEXT,
ADD COLUMN s_billing_contact TEXT,
ADD COLUMN s_payment_terms TEXT,
ADD COLUMN s_contract_details JSONB DEFAULT '{}',
ADD COLUMN s_contract_start_date DATE,
ADD COLUMN s_contract_end_date DATE,
ADD COLUMN s_notes TEXT,
ADD COLUMN s_requirements JSONB DEFAULT '{}',
ADD COLUMN s_preferred_qualifications TEXT[] DEFAULT '{}',
ADD COLUMN s_preferred_experience TEXT[] DEFAULT '{}',
ADD COLUMN s_booking_history JSONB[] DEFAULT '{}',
ADD COLUMN s_financial_details JSONB DEFAULT '{}',
ADD COLUMN s_payment_history JSONB[] DEFAULT '{}',
ADD COLUMN s_special_arrangements TEXT,
ADD COLUMN s_last_contacted DATE,
ADD COLUMN s_next_contact_date DATE;

-- Comment on the new columns
COMMENT ON COLUMN schools.s_website IS 'School website URL';
COMMENT ON COLUMN schools.s_logo_url IS 'URL to the school logo';
COMMENT ON COLUMN schools.s_description IS 'Detailed description of the school';
COMMENT ON COLUMN schools.s_established_year IS 'Year the school was established';
COMMENT ON COLUMN schools.s_student_count IS 'Number of students';
COMMENT ON COLUMN schools.s_staff_count IS 'Number of staff members';
COMMENT ON COLUMN schools.s_facilities IS 'Array of facilities available at the school';
COMMENT ON COLUMN schools.s_subjects_offered IS 'Array of subjects offered by the school';
COMMENT ON COLUMN schools.s_curriculum IS 'Curriculum followed by the school';
COMMENT ON COLUMN schools.s_accreditations IS 'Array of accreditations held by the school';
COMMENT ON COLUMN schools.s_rating_details IS 'JSON object with detailed ratings in different categories';
COMMENT ON COLUMN schools.s_social_media IS 'JSON object with social media profiles';
COMMENT ON COLUMN schools.s_contact_details IS 'JSON object with additional contact details';
COMMENT ON COLUMN schools.s_additional_contacts IS 'Array of JSON objects with additional contact persons';
COMMENT ON COLUMN schools.s_billing_address IS 'Billing address if different from main address';
COMMENT ON COLUMN schools.s_billing_contact IS 'Billing contact person';
COMMENT ON COLUMN schools.s_payment_terms IS 'Payment terms agreed with the school';
COMMENT ON COLUMN schools.s_contract_details IS 'JSON object with contract details';
COMMENT ON COLUMN schools.s_contract_start_date IS 'Start date of the current contract';
COMMENT ON COLUMN schools.s_contract_end_date IS 'End date of the current contract';
COMMENT ON COLUMN schools.s_notes IS 'Additional notes about the school';
COMMENT ON COLUMN schools.s_requirements IS 'JSON object with specific requirements for teachers';
COMMENT ON COLUMN schools.s_preferred_qualifications IS 'Array of preferred qualifications for teachers';
COMMENT ON COLUMN schools.s_preferred_experience IS 'Array of preferred experience types for teachers';
COMMENT ON COLUMN schools.s_booking_history IS 'Array of JSON objects with booking history';
COMMENT ON COLUMN schools.s_financial_details IS 'JSON object with financial details';
COMMENT ON COLUMN schools.s_payment_history IS 'Array of JSON objects with payment history';
COMMENT ON COLUMN schools.s_special_arrangements IS 'Any special arrangements or accommodations';
COMMENT ON COLUMN schools.s_last_contacted IS 'Date when the school was last contacted';
COMMENT ON COLUMN schools.s_next_contact_date IS 'Scheduled date for next contact'; 