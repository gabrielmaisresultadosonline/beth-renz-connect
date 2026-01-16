-- Add image_position field to homepage_slides table
ALTER TABLE public.homepage_slides
ADD COLUMN image_position VARCHAR(20) DEFAULT 'center';

COMMENT ON COLUMN public.homepage_slides.image_position IS 'Vertical position of the image: top, center, or bottom';