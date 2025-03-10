-- Update the first teacher with additional data
UPDATE teachers
SET 
  t_certifications = ARRAY['PGCE', 'QTS', 'TEFL'],
  t_salary_expectations = '{"min": 150, "max": 250, "currency": "GBP", "rate": "daily"}'::jsonb,
  t_languages = ARRAY['English', 'French', 'Spanish'],
  t_teaching_methods = ARRAY['Traditional', 'Montessori', 'Project-based'],
  t_skills = ARRAY['Curriculum Development', 'Student Assessment', 'Classroom Management'],
  t_profile_image_url = 'https://randomuser.me/api/portraits/men/1.jpg',
  t_nationality = 'British',
  t_visa_status = 'Citizen',
  t_dbs_check_date = '2023-01-15',
  t_dbs_check_number = 'DBS123456789',
  t_contract_type = 'Freelance',
  t_onboarding_status = 'Completed',
  t_employment_history = ARRAY[
    '{
      "company": "Oakridge Secondary School",
      "role": "Mathematics Teacher",
      "startDate": "2018-09",
      "endDate": "2022-07",
      "description": "Taught mathematics to students in grades 9-12."
    }'::jsonb,
    '{
      "company": "Westfield Academy",
      "role": "Head of Mathematics",
      "startDate": "2015-01",
      "endDate": "2018-06",
      "description": "Led the mathematics department and developed curriculum."
    }'::jsonb,
    '{
      "company": "Riverside College",
      "role": "Mathematics Lecturer",
      "startDate": "2012-09",
      "endDate": "2014-12",
      "description": "Taught advanced mathematics courses to college students."
    }'::jsonb
  ],
  t_education_history = ARRAY[
    '{
      "institution": "University of Cambridge",
      "degree": "Master of Education",
      "field": "Mathematics Education",
      "startYear": "2010",
      "endYear": "2011",
      "grade": "Distinction"
    }'::jsonb,
    '{
      "institution": "University of Manchester",
      "degree": "Bachelor of Science",
      "field": "Mathematics",
      "startYear": "2007",
      "endYear": "2010",
      "grade": "First Class Honours"
    }'::jsonb
  ]
WHERE id = (SELECT id FROM teachers ORDER BY created_at LIMIT 1);

-- Update the second teacher with additional data
UPDATE teachers
SET 
  t_certifications = ARRAY['QTS', 'CELTA', 'DELTA'],
  t_salary_expectations = '{"min": 120, "max": 200, "currency": "GBP", "rate": "daily"}'::jsonb,
  t_languages = ARRAY['English', 'German'],
  t_teaching_methods = ARRAY['Flipped Classroom', 'Inquiry-based', 'Differentiated Instruction'],
  t_skills = ARRAY['Special Education', 'Behavior Management', 'Educational Technology'],
  t_profile_image_url = 'https://randomuser.me/api/portraits/women/1.jpg',
  t_nationality = 'German',
  t_visa_status = 'Settled Status',
  t_dbs_check_date = '2022-11-05',
  t_dbs_check_number = 'DBS987654321',
  t_contract_type = 'Permanent',
  t_onboarding_status = 'Completed',
  t_employment_history = ARRAY[
    '{
      "company": "Greenwood Primary School",
      "role": "English Teacher",
      "startDate": "2019-01",
      "endDate": "2023-07",
      "description": "Taught English to primary school students."
    }'::jsonb,
    '{
      "company": "Berlin International School",
      "role": "ESL Teacher",
      "startDate": "2016-08",
      "endDate": "2018-12",
      "description": "Taught English as a second language to international students."
    }'::jsonb
  ],
  t_education_history = ARRAY[
    '{
      "institution": "University of Berlin",
      "degree": "Master of Arts",
      "field": "TESOL",
      "startYear": "2014",
      "endYear": "2016",
      "grade": "Magna Cum Laude"
    }'::jsonb,
    '{
      "institution": "University of Hamburg",
      "degree": "Bachelor of Arts",
      "field": "English Literature",
      "startYear": "2010",
      "endYear": "2014",
      "grade": "Cum Laude"
    }'::jsonb
  ]
WHERE id = (SELECT id FROM teachers ORDER BY created_at OFFSET 1 LIMIT 1);

-- Update the third teacher with additional data
UPDATE teachers
SET 
  t_certifications = ARRAY['QTS', 'National Board Certification'],
  t_salary_expectations = '{"min": 180, "max": 280, "currency": "GBP", "rate": "daily"}'::jsonb,
  t_languages = ARRAY['English', 'Mandarin'],
  t_teaching_methods = ARRAY['STEM-focused', 'Hands-on Learning', 'Collaborative Learning'],
  t_skills = ARRAY['Laboratory Management', 'Research Supervision', 'Curriculum Design'],
  t_profile_image_url = 'https://randomuser.me/api/portraits/men/2.jpg',
  t_nationality = 'American',
  t_visa_status = 'Tier 2 Work Visa',
  t_dbs_check_date = '2023-03-22',
  t_dbs_check_number = 'DBS456789123',
  t_contract_type = 'Fixed Term',
  t_onboarding_status = 'In Progress',
  t_employment_history = ARRAY[
    '{
      "company": "Boston Science Academy",
      "role": "Science Department Head",
      "startDate": "2017-08",
      "endDate": "2023-06",
      "description": "Led the science department and taught advanced physics courses."
    }'::jsonb,
    '{
      "company": "MIT High School Outreach",
      "role": "Physics Instructor",
      "startDate": "2015-01",
      "endDate": "2017-06",
      "description": "Taught physics to gifted high school students in an outreach program."
    }'::jsonb,
    '{
      "company": "New York Science High School",
      "role": "Physics Teacher",
      "startDate": "2012-08",
      "endDate": "2014-12",
      "description": "Taught physics to high school students and supervised science fair projects."
    }'::jsonb
  ],
  t_education_history = ARRAY[
    '{
      "institution": "Massachusetts Institute of Technology",
      "degree": "PhD",
      "field": "Physics",
      "startYear": "2008",
      "endYear": "2012",
      "grade": "Summa Cum Laude"
    }'::jsonb,
    '{
      "institution": "California Institute of Technology",
      "degree": "Bachelor of Science",
      "field": "Physics",
      "startYear": "2004",
      "endYear": "2008",
      "grade": "Highest Honors"
    }'::jsonb
  ]
WHERE id = (SELECT id FROM teachers ORDER BY created_at OFFSET 2 LIMIT 1); 