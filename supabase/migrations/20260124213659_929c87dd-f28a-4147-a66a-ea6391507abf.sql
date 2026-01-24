-- Add slug column to press_releases table
ALTER TABLE public.press_releases 
ADD COLUMN slug text UNIQUE;

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  slug text;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  slug := lower(title);
  -- Remove accents
  slug := translate(slug, 'áàãâäéèêëíìîïóòõôöúùûüçñ', 'aaaaaeeeeiiiioooooouuuucn');
  -- Replace non-alphanumeric with hyphen
  slug := regexp_replace(slug, '[^a-z0-9]+', '-', 'g');
  -- Remove leading/trailing hyphens
  slug := trim(both '-' from slug);
  RETURN slug;
END;
$$;

-- Create trigger function to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION public.set_press_release_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  base_slug text;
  new_slug text;
  counter integer := 1;
BEGIN
  -- Only generate slug if it's null or title changed
  IF NEW.slug IS NULL OR (TG_OP = 'UPDATE' AND OLD.title != NEW.title) THEN
    base_slug := generate_slug(NEW.title);
    new_slug := base_slug;
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (SELECT 1 FROM press_releases WHERE slug = new_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
      new_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    NEW.slug := new_slug;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER set_press_release_slug_trigger
BEFORE INSERT OR UPDATE ON public.press_releases
FOR EACH ROW
EXECUTE FUNCTION public.set_press_release_slug();

-- Update existing press releases with slugs
UPDATE public.press_releases
SET slug = generate_slug(title) || '-' || LEFT(id::text, 8)
WHERE slug IS NULL;