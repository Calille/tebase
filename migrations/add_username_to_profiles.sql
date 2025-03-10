-- Add email column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Add username column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Make username unique
ALTER TABLE profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Update existing profiles to have a username based on their email
UPDATE profiles 
SET username = SPLIT_PART(email, '@', 1) 
WHERE username IS NULL AND email IS NOT NULL;

-- Create an index on username for faster lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);

-- Make email unique
ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email); 