-- Add description/content field to clipping table
ALTER TABLE public.clipping ADD COLUMN IF NOT EXISTS content TEXT;

-- Add homepage slider table
CREATE TABLE IF NOT EXISTS public.homepage_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  link TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on homepage_slides
ALTER TABLE public.homepage_slides ENABLE ROW LEVEL SECURITY;

-- Public can read active slides
CREATE POLICY "Anyone can view active slides" ON public.homepage_slides
FOR SELECT USING (active = true);

-- Admins can manage slides
CREATE POLICY "Admins can manage slides" ON public.homepage_slides
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Add homepage sections visibility table
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  section_label TEXT NOT NULL,
  visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

-- Public can read sections
CREATE POLICY "Anyone can view sections" ON public.homepage_sections
FOR SELECT USING (true);

-- Admins can manage sections
CREATE POLICY "Admins can manage sections" ON public.homepage_sections
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Insert default homepage sections
INSERT INTO public.homepage_sections (section_key, section_label, display_order) VALUES
  ('hero', 'Banner Principal', 1),
  ('slider', 'Slider de Imagens', 2),
  ('about', 'Quem Somos', 3),
  ('services', 'Serviços', 4),
  ('clients', 'Clientes', 5),
  ('releases', 'Press Releases', 6),
  ('tips', 'Dicas', 7),
  ('partners', 'Parceiros', 8)
ON CONFLICT (section_key) DO NOTHING;