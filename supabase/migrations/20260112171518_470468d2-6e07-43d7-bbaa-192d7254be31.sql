-- FIX 1: Add DELETE policy for contact_messages
CREATE POLICY "Admins can delete messages"
ON public.contact_messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- FIX 2: Add database constraints for contact form validation
ALTER TABLE public.contact_messages
  ADD CONSTRAINT check_name_length 
    CHECK (length(name) BETWEEN 2 AND 200),
  ADD CONSTRAINT check_email_length 
    CHECK (length(email) BETWEEN 5 AND 320),
  ADD CONSTRAINT check_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT check_message_length 
    CHECK (length(message) BETWEEN 10 AND 5000),
  ADD CONSTRAINT check_phone_format 
    CHECK (phone IS NULL OR phone = '' OR phone ~* '^[0-9\s\(\)\+\-]{7,20}$');

-- FIX 3: Create RPC for admin verification (server-side check)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$;