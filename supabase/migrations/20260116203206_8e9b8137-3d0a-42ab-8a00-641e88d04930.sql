-- Change image_position to store percentage value (0-100)
ALTER TABLE public.homepage_slides
ALTER COLUMN image_position TYPE VARCHAR(10);

-- Update existing values to percentage
UPDATE public.homepage_slides SET image_position = '50' WHERE image_position = 'center' OR image_position IS NULL;
UPDATE public.homepage_slides SET image_position = '0' WHERE image_position = 'top';
UPDATE public.homepage_slides SET image_position = '100' WHERE image_position = 'bottom';

COMMENT ON COLUMN public.homepage_slides.image_position IS 'Vertical position of the image as percentage (0-100)';