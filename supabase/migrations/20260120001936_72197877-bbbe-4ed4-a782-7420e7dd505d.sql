-- Add columns for multiple images gallery and PDF support
ALTER TABLE public.clipping 
ADD COLUMN gallery_images TEXT[] DEFAULT '{}',
ADD COLUMN pdf_url TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.clipping.gallery_images IS 'Array of image URLs for newspaper gallery view';
COMMENT ON COLUMN public.clipping.pdf_url IS 'URL to PDF file of the complete newspaper/publication';