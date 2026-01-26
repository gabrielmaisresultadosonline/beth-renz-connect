-- Add image_position column to press_releases table
ALTER TABLE public.press_releases 
ADD COLUMN IF NOT EXISTS image_position VARCHAR DEFAULT 'center';