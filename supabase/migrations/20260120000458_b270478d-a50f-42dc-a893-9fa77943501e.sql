-- Create table for sent emails history
CREATE TABLE public.sent_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  to_addresses TEXT[] NOT NULL,
  cc_addresses TEXT[],
  bcc_addresses TEXT[],
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  attachments JSONB,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage sent emails
CREATE POLICY "Admins can view sent emails"
ON public.sent_emails
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can insert sent emails"
ON public.sent_emails
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can delete sent emails"
ON public.sent_emails
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);