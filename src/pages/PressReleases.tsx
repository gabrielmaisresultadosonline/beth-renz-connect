import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Newspaper, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PressRelease {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  image_url: string | null;
  published_at: string | null;
}

export default function PressReleases() {
  const [releases, setReleases] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRelease, setSelectedRelease] = useState<PressRelease | null>(null);

  useEffect(() => {
    async function fetchReleases() {
      const { data } = await supabase
        .from('press_releases')
        .select('*')
        .order('published_at', { ascending: false });
      
      setReleases(data || []);
      setLoading(false);
    }

    fetchReleases();
  }, []);

  return (
    <Layout>
      <PageHero 
        title="Press Releases" 
        subtitle="Últimas notícias e comunicados de nossos clientes" 
      />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded-lg h-80" />
              ))}
            </div>
          ) : releases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {releases.map((release) => (
                <Card 
                  key={release.id} 
                  className="group bg-card border-border hover:shadow-card hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => setSelectedRelease(release)}
                >
                  {release.image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={release.image_url}
                        alt={release.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      {release.published_at 
                        ? format(new Date(release.published_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                        : 'Data não informada'
                      }
                    </div>
                    <CardTitle className="font-display text-lg group-hover:text-primary transition-colors">
                      {release.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {release.summary || release.content.substring(0, 150) + '...'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                Em breve
              </h3>
              <p className="text-muted-foreground">
                Nossos press releases serão exibidos aqui em breve.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modal for full release */}
      {selectedRelease && (
        <div 
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedRelease(null)}
        >
          <div 
            className="bg-card border border-border rounded-lg max-w-3xl max-h-[80vh] overflow-y-auto p-8 shadow-elevated animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedRelease.image_url && (
              <img
                src={selectedRelease.image_url}
                alt={selectedRelease.title}
                className="w-full aspect-video object-cover rounded-lg mb-6"
              />
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Calendar className="h-4 w-4" />
              {selectedRelease.published_at 
                ? format(new Date(selectedRelease.published_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                : 'Data não informada'
              }
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">
              {selectedRelease.title}
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              {selectedRelease.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <button
              onClick={() => setSelectedRelease(null)}
              className="mt-6 text-primary hover:underline"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
