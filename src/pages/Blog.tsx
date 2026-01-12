import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { AnimatedSection } from '@/components/AnimatedSection';
import { BlogCard } from '@/components/BlogCard';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Newspaper, Search } from 'lucide-react';
import { motion } from 'framer-motion';
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

export default function Blog() {
  const [releases, setReleases] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredReleases = releases.filter(release =>
    release.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    release.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <PageHero 
        title="Blog da Beth" 
        subtitle="Últimas notícias e comunicados de nossos clientes" 
      />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection className="mb-12">
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-0 h-12"
              />
            </div>
          </AnimatedSection>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded-2xl h-80" />
              ))}
            </div>
          ) : filteredReleases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredReleases.map((release, index) => (
                <BlogCard
                  key={release.id}
                  title={release.title}
                  summary={release.summary || undefined}
                  imageUrl={release.image_url || undefined}
                  date={release.published_at || undefined}
                  category="Press Release"
                  index={index}
                  onClick={() => setSelectedRelease(release)}
                />
              ))}
            </div>
          ) : (
            <AnimatedSection className="text-center py-20">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
              >
                <Newspaper className="h-12 w-12 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-3">
                {searchQuery ? 'Nenhum resultado encontrado' : 'Em breve'}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery 
                  ? 'Tente uma pesquisa diferente.' 
                  : 'Nossos posts serão exibidos aqui em breve.'}
              </p>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedRelease && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-foreground/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedRelease(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl max-w-3xl max-h-[80vh] overflow-y-auto p-8 shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedRelease.image_url && (
              <img
                src={selectedRelease.image_url}
                alt={selectedRelease.title}
                className="w-full aspect-video object-cover rounded-xl mb-6"
              />
            )}
            {selectedRelease.published_at && (
              <p className="text-sm text-muted-foreground mb-2">
                {format(new Date(selectedRelease.published_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            )}
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
              className="mt-6 text-primary hover:underline font-medium"
            >
              Fechar
            </button>
          </motion.div>
        </motion.div>
      )}
    </Layout>
  );
}
