-- Add new columns to the teachers table
ALTER TABLE teachers 
ADD COLUMN t_certifications TEXT[] DEFAULT '{}',
ADD COLUMN t_salary_expectations JSONB DEFAULT '{"min": 0, "max": 0, "currency": "GBP", "rate": "daily"}',
ADD COLUMN t_availability_schedule JSONB DEFAULT '{}',
ADD COLUMN t_languages TEXT[] DEFAULT '{}',
ADD COLUMN t_teaching_methods TEXT[] DEFAULT '{}',
ADD COLUMN t_performance_ratings JSONB DEFAULT '{}',
ADD COLUMN t_employment_history JSONB[] DEFAULT '{}',
ADD COLUMN t_reference_contacts JSONB[] DEFAULT '{}',
ADD COLUMN t_education_history JSONB[] DEFAULT '{}',
ADD COLUMN t_skills TEXT[] DEFAULT '{}',
ADD COLUMN t_profile_image_url TEXT,
ADD COLUMN t_date_of_birth DATE,
ADD COLUMN t_gender TEXT,
ADD COLUMN t_nationality TEXT,
ADD COLUMN t_visa_status TEXT,
ADD COLUMN t_dbs_check_date DATE,
ADD COLUMN t_dbs_check_number TEXT,
ADD COLUMN t_emergency_contact JSONB DEFAULT '{}',
ADD COLUMN t_bank_details JSONB DEFAULT '{}',
ADD COLUMN t_tax_information JSONB DEFAULT '{}',
ADD COLUMN t_contract_type TEXT,
ADD COLUMN t_contract_details JSONB DEFAULT '{}',
ADD COLUMN t_onboarding_status TEXT DEFAULT 'pending',
ADD COLUMN t_onboarding_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN t_last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN t_social_media JSONB DEFAULT '{}';

-- Comment on the new columns
COMMENT ON COLUMN teachers.t_certifications IS 'Array of teaching certifications';
COMMENT ON COLUMN teachers.t_salary_expectations IS 'JSON object with min, max, currency, and rate type';
COMMENT ON COLUMN teachers.t_availability_schedule IS 'JSON object with availability for each day of the week';
COMMENT ON COLUMN teachers.t_languages IS 'Array of languages spoken';
COMMENT ON COLUMN teachers.t_teaching_methods IS 'Array of preferred teaching methods/styles';
COMMENT ON COLUMN teachers.t_performance_ratings IS 'JSON object with ratings in different categories';
COMMENT ON COLUMN teachers.t_employment_history IS 'Array of JSON objects with previous employment details';
COMMENT ON COLUMN teachers.t_reference_contacts IS 'Array of JSON objects with reference contact details';
COMMENT ON COLUMN teachers.t_education_history IS 'Array of JSON objects with education details';
COMMENT ON COLUMN teachers.t_skills IS 'Array of additional skills';
COMMENT ON COLUMN teachers.t_profile_image_url IS 'URL to the teacher''s profile image';
COMMENT ON COLUMN teachers.t_date_of_birth IS 'Teacher''s date of birth';
COMMENT ON COLUMN teachers.t_gender IS 'Teacher''s gender';
COMMENT ON COLUMN teachers.t_nationality IS 'Teacher''s nationality';
COMMENT ON COLUMN teachers.t_visa_status IS 'Teacher''s visa/right to work status';
COMMENT ON COLUMN teachers.t_dbs_check_date IS 'Date of the most recent DBS check';
COMMENT ON COLUMN teachers.t_dbs_check_number IS 'DBS certificate number';
COMMENT ON COLUMN teachers.t_emergency_contact IS 'JSON object with emergency contact details';
COMMENT ON COLUMN teachers.t_bank_details IS 'JSON object with bank account details (encrypted)';
COMMENT ON COLUMN teachers.t_tax_information IS 'JSON object with tax-related information';
COMMENT ON COLUMN teachers.t_contract_type IS 'Type of contract (permanent, temporary, etc.)';
COMMENT ON COLUMN teachers.t_contract_details IS 'JSON object with contract details';
COMMENT ON COLUMN teachers.t_onboarding_status IS 'Status of the onboarding process';
COMMENT ON COLUMN teachers.t_onboarding_completed_at IS 'Timestamp when onboarding was completed';
COMMENT ON COLUMN teachers.t_last_login IS 'Timestamp of the last login';
COMMENT ON COLUMN teachers.t_social_media IS 'JSON object with social media profiles'; 