-- Add columns for ordering, pinning and date visibility control
ALTER TABLE public.press_releases
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pinned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_date boolean DEFAULT true;

-- Create index for better ordering performance
CREATE INDEX IF NOT EXISTS idx_press_releases_order ON public.press_releases (pinned DESC, display_order ASC, published_at DESC);