-- Fix potential admin privilege escalation vulnerability
-- Ensure is_admin defaults to false at database level and cannot be bypassed

-- Add NOT NULL constraint with default false to is_admin column if not already set
ALTER TABLE public.profiles 
ALTER COLUMN is_admin SET DEFAULT false,
ALTER COLUMN is_admin SET NOT NULL;

-- Drop and recreate INSERT policy to be more restrictive
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id
  AND is_admin = false
);

-- Tighten UPDATE policy to completely prevent is_admin modification by users
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND is_admin = (SELECT p.is_admin FROM public.profiles p WHERE p.user_id = auth.uid())
);