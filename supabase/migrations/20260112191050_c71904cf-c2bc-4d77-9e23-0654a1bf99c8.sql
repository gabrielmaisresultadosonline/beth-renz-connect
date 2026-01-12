-- Fix: Add WITH CHECK constraint to profiles UPDATE policy to prevent is_admin modification at RLS level
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  is_admin IS NOT DISTINCT FROM (
    SELECT p.is_admin FROM public.profiles p WHERE p.user_id = auth.uid()
  )
);