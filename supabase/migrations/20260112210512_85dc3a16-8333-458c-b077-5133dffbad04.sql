-- Tighten the public INSERT policy for the contact form to avoid an always-true WITH CHECK.
-- This keeps the form publicly usable while adding basic server-side validation.

DROP POLICY IF EXISTS "Anyone can send messages" ON public.contact_messages;

CREATE POLICY "Anyone can send messages"
ON public.contact_messages
FOR INSERT
TO public
WITH CHECK (
  length(trim(name)) BETWEEN 1 AND 100
  AND length(trim(email)) BETWEEN 5 AND 255
  AND position('@' in email) > 1
  AND length(trim(message)) BETWEEN 1 AND 2000
  AND (phone IS NULL OR length(trim(phone)) BETWEEN 7 AND 30)
  AND ("read" IS NULL OR "read" = false)
);
