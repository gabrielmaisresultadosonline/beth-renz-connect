import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Newspaper, Calendar, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';

interface PressRelease {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  image_url: string | null;
  published_at: string | null;
  pinned: boolean | null;
  show_date: boolean | null;
  display_order: number | null;
  slug: string | null;
}

export default function PressReleases() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [releases, setReleases] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    async function fetchReleases() {
      const { data } = await supabase
        .from('press_releases')
        .select('*')
        .eq('published', true)
        .order('pinned', { ascending: false })
        .order('display_order', { ascending: true })
        .order('published_at', { ascending: false });
      
      setReleases(data || []);
      setLoading(false);
    }

    fetchReleases();
  }, []);

  // Filter releases based on search query
  const filteredReleases = releases.filter(release => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      release.title.toLowerCase().includes(query) ||
      (release.summary?.toLowerCase().includes(query)) ||
      release.content.toLowerCase().includes(query)
    );
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <Layout>
      <PageHero 
        title="Press Releases" 
        subtitle="Últimas notícias e comunicados de nossos clientes" 
      />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="mb-8 max-w-xl mx-auto">
            <div className="relative">
              <Input
                type="search"
                placeholder="Pesquisar press releases..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-secondary border-0"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded-lg h-80" />
              ))}
            </div>
          ) : filteredReleases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredReleases.map((release) => (
                <Link key={release.id} to={`/press-releases/${release.slug || release.id}`}>
                  <Card className="group h-full bg-card border-border hover:shadow-card hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden">
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
                      {release.show_date !== false && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Calendar className="h-4 w-4" />
                          {release.published_at 
                            ? format(new Date(release.published_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                            : 'Data não informada'
                          }
                        </div>
                      )}
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
                </Link>
              ))}
            </div>
          ) : searchQuery.trim() ? (
            <div className="text-center py-20">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-muted-foreground">
                Não encontramos press releases para "{searchQuery}"
              </p>
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
    </Layout>
  );
}
