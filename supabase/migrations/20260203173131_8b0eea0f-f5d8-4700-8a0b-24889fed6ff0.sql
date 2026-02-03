-- Add slug column to tips table
ALTER TABLE public.tips ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index for slug
CREATE UNIQUE INDEX IF NOT EXISTS tips_slug_unique ON public.tips(slug) WHERE slug IS NOT NULL;

-- Create trigger function to auto-generate slug for tips
CREATE OR REPLACE FUNCTION public.generate_tip_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Only generate if slug is empty/null and title exists
  IF (NEW.slug IS NULL OR NEW.slug = '') AND NEW.title IS NOT NULL THEN
    -- Generate base slug from title
    base_slug := public.generate_slug(NEW.title);
    final_slug := base_slug;
    
    -- Check for duplicates and add counter if needed
    WHILE EXISTS (SELECT 1 FROM public.tips WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for tips
DROP TRIGGER IF EXISTS trigger_generate_tip_slug ON public.tips;
CREATE TRIGGER trigger_generate_tip_slug
  BEFORE INSERT OR UPDATE ON public.tips
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_tip_slug();

-- Generate slugs for existing tips that don't have one
UPDATE public.tips 
SET slug = public.generate_slug(title) 
WHERE slug IS NULL OR slug = '';