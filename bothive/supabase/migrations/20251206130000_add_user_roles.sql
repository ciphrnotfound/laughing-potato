-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('developer', 'business', 'enterprise', 'admin');

-- Add role column to users table
ALTER TABLE public.users 
ADD COLUMN role user_role DEFAULT 'business';

-- Update existing users to have a default role
UPDATE public.users SET role = 'business' WHERE role IS NULL;
