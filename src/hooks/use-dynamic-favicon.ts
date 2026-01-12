import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  favicon_url?: string;
  logo_url?: string;
}

export function useDynamicFavicon() {
  useEffect(() => {
    const loadFavicon = async () => {
      try {
        const { data } = await supabase
          .from('site_content')
          .select('metadata')
          .eq('section', 'settings')
          .single();

        if (data?.metadata) {
          const settings = data.metadata as SiteSettings;
          // Use favicon_url if available, otherwise fallback to logo_url
          const faviconUrl = settings.favicon_url || settings.logo_url;
          if (faviconUrl) {
            updateFavicon(faviconUrl);
          }
        }
      } catch (error) {
        console.log('Using default favicon');
      }
    };

    loadFavicon();
  }, []);
}

function updateFavicon(url: string) {
  // Remove existing favicons
  const existingLinks = document.querySelectorAll("link[rel*='icon']");
  existingLinks.forEach(link => link.remove());

  // Add new favicon
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = url.endsWith('.ico') ? 'image/x-icon' : 'image/png';
  link.href = url;
  document.head.appendChild(link);

  // Also add apple-touch-icon
  const appleLink = document.createElement('link');
  appleLink.rel = 'apple-touch-icon';
  appleLink.href = url;
  document.head.appendChild(appleLink);
}
