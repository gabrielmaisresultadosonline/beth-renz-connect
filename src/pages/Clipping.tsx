import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Scissors, Calendar, ExternalLink, Images, FileText, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NewspaperGallery } from '@/components/NewspaperGallery';

interface ClippingItem {
  id: string;
  title: string;
  source: string | null;
  image_url: string | null;
  link: string | null;
  published_at: string | null;
  gallery_images: string[] | null;
  pdf_url: string | null;
}

export default function Clipping() {
  const [clippings, setClippings] = useState<ClippingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClipping, setSelectedClipping] = useState<ClippingItem | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  useEffect(() => {
    async function fetchClippings() {
      const { data } = await supabase
        .from('clipping')
        .select('*')
        .order('published_at', { ascending: false });
      
      setClippings((data || []) as ClippingItem[]);
      setLoading(false);
    }

    fetchClippings();
  }, []);

  const openGallery = (clip: ClippingItem) => {
    setSelectedClipping(clip);
    setGalleryOpen(true);
  };

  const getGalleryImages = (clip: ClippingItem): string[] => {
    const images: string[] = [];
    // Add cover image first if exists
    if (clip.image_url) {
      images.push(clip.image_url);
    }
    // Add gallery images
    if (clip.gallery_images && clip.gallery_images.length > 0) {
      images.push(...clip.gallery_images);
    }
    return images;
  };

  const hasGallery = (clip: ClippingItem) => {
    return (clip.gallery_images && clip.gallery_images.length > 0);
  };

  const hasOnlyLink = (clip: ClippingItem) => {
    return clip.link && !hasGallery(clip);
  };

  const handleImageClick = (clip: ClippingItem) => {
    if (hasGallery(clip)) {
      openGallery(clip);
    } else if (clip.link) {
      window.open(clip.link, '_blank', 'noopener,noreferrer');
    }
  };

  const isClickable = (clip: ClippingItem) => {
    return hasGallery(clip) || clip.link;
  };

  return (
    <Layout>
      <PageHero 
        title="Clipping" 
        subtitle="Publicações em veículos de comunicação" 
      />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded-lg h-80" />
              ))}
            </div>
          ) : clippings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {clippings.map((clip) => (
                <Card 
                  key={clip.id} 
                  className="group bg-card border-border hover:shadow-card hover:border-primary/30 transition-all duration-300 overflow-hidden"
                >
                  {/* Cover Image */}
                  <div 
                    className={`aspect-video overflow-hidden relative ${isClickable(clip) ? 'cursor-pointer' : ''}`}
                    onClick={() => handleImageClick(clip)}
                  >
                    {clip.image_url ? (
                      <>
                        <img
                          src={clip.image_url}
                          alt={clip.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Overlay */}
                        {isClickable(clip) && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2 text-white">
                              {hasGallery(clip) ? (
                                <>
                                  <Eye className="h-8 w-8" />
                                  <span className="text-sm font-medium">Ver completo</span>
                                </>
                              ) : (
                                <>
                                  <ExternalLink className="h-8 w-8" />
                                  <span className="text-sm font-medium">Acessar online</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                        {/* Page count badge */}
                        {clip.gallery_images && clip.gallery_images.length > 0 && (
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Images className="h-3 w-3" />
                            {clip.gallery_images.length + (clip.image_url ? 1 : 0)} páginas
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <Scissors className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    {clip.source && (
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
                        {clip.source}
                      </span>
                    )}
                    <h3 
                      className={`font-display font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors ${hasGallery(clip) ? 'cursor-pointer' : ''}`}
                      onClick={() => hasGallery(clip) && openGallery(clip)}
                    >
                      {clip.title}
                    </h3>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {clip.published_at && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(clip.published_at), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {/* Ver Jornal - só aparece se tiver galeria de imagens */}
                      {hasGallery(clip) && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => openGallery(clip)}
                          className="flex items-center gap-1"
                        >
                          <Images className="h-4 w-4" />
                          Ver Jornal
                        </Button>
                      )}

                      {/* Online - só aparece se tiver link */}
                      {clip.link && (
                        <a 
                          href={clip.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Online
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Scissors className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                Em breve
              </h3>
              <p className="text-muted-foreground">
                Nosso clipping será exibido aqui em breve.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newspaper Gallery Modal */}
      {selectedClipping && (
        <NewspaperGallery
          images={getGalleryImages(selectedClipping)}
          isOpen={galleryOpen}
          onClose={() => {
            setGalleryOpen(false);
            setSelectedClipping(null);
          }}
          title={selectedClipping.title}
        />
      )}
    </Layout>
  );
}
