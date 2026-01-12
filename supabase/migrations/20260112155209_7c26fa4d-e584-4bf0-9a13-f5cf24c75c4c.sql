-- Fix function search path security
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- The INSERT policy for contact_messages needs to be permissive for public contact forms
-- This is intentional - anyone can send a contact message
-- No changes needed for that policy as it's a public contact form