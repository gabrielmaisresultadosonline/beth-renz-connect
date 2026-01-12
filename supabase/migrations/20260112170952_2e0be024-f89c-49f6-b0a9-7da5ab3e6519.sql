-- FIX 1: Secure the bootstrap_first_admin function
-- Add email verification to prevent race condition attacks
-- Only the designated admin email can use this function

CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: Only allow specific admin email
  IF p_email != 'bethrenz@hotmail.com' THEN
    RAISE EXCEPTION 'Unauthorized: Only designated admin can use this function';
  END IF;

  -- Verify the authenticated user's email matches the parameter
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email = p_email
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Email mismatch';
  END IF;

  -- If already has admin, do nothing (idempotent)
  IF EXISTS (SELECT 1 FROM public.profiles WHERE is_admin = true) THEN
    RETURN;
  END IF;
  
  -- Grant admin to the authenticated user
  IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()) THEN
    UPDATE public.profiles SET is_admin = true WHERE user_id = auth.uid();
  ELSE
    INSERT INTO public.profiles(user_id, email, is_admin) 
    VALUES (auth.uid(), p_email, true);
  END IF;
END;
$$;

-- FIX 2: Secure storage policies - restrict to admins only
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete media" ON storage.objects;

-- Create admin-only policies
CREATE POLICY "Admins can upload media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can update media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can delete media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);