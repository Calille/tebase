# Database Migrations

This directory contains SQL migration files for the Tebase CRM application.

## Migration: Add Username to Profiles

The `add_username_to_profiles.sql` file adds a username field to the profiles table, making it possible for users to log in with a username instead of an email.

### How to Run the Migration

1. Connect to your Supabase project using the SQL Editor.
2. Copy the contents of the `add_username_to_profiles.sql` file.
3. Paste the SQL into the SQL Editor.
4. Run the SQL query.

### What the Migration Does

- Adds a `username` column to the `profiles` table if it doesn't exist.
- Makes the `username` column unique to prevent duplicate usernames.
- Updates existing profiles to have a username based on their email (the part before the @).
- Creates an index on the `username` column for faster lookups.
- Adds an `email` column if it doesn't exist.
- Makes the `email` column unique.

### After Running the Migration

After running the migration, users will be able to log in using either their username or email address. New users will be required to provide a username during registration. 