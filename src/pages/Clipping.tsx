import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Scissors, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClippingItem {
  id: string;
  title: string;
  source: string | null;
  image_url: string | null;
  link: string | null;
  published_at: string | null;
}

export default function Clipping() {
  const [clippings, setClippings] = useState<ClippingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClippings() {
      const { data } = await supabase
        .from('clipping')
        .select('*')
        .order('published_at', { ascending: false });
      
      setClippings(data || []);
      setLoading(false);
    }

    fetchClippings();
  }, []);

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
                  {clip.image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={clip.image_url}
                        alt={clip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    {clip.source && (
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
                        {clip.source}
                      </span>
                    )}
                    <h3 className="font-display font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                      {clip.title}
                    </h3>
                    <div className="flex items-center justify-between mt-4">
                      {clip.published_at && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(clip.published_at), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                        </div>
                      )}
                      {clip.link && (
                        <a
                          href={clip.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          Ver matéria
                          <ExternalLink className="h-3 w-3" />
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
    </Layout>
  );
}
