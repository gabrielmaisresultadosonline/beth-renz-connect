import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowRight, 
  Newspaper, 
  Users, 
  X,
  Calendar,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import heroBg from '@/assets/hero-bg.jpg';
import quemSomosImage from '@/assets/quem-somos-home.jpg';
import { HomepageSlider } from '@/components/HomepageSlider';

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

interface Client {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
}

interface Tip {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
}

interface SiteContent {
  section: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  image_url: string | null;
  metadata: any;
}

interface Clipping {
  id: string;
  title: string;
  source: string | null;
  link: string | null;
}

interface SearchResult {
  id: string;
  title: string;
  type: 'release' | 'tip' | 'clipping';
  link: string;
}

interface SectionVisibility {
  sidebar_search: boolean;
  sidebar_blog: boolean;
  sidebar_clients: boolean;
  sidebar_partners: boolean;
  slider: boolean;
}

export default function Index() {
  const [releases, setReleases] = useState<PressRelease[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [content, setContent] = useState<Record<string, SiteContent>>({});
  const [selectedRelease, setSelectedRelease] = useState<PressRelease | null>(null);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pressReleasesLimit, setPressReleasesLimit] = useState(5);
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>({
    sidebar_search: true,
    sidebar_blog: true,
    sidebar_clients: true,
    sidebar_partners: true,
    slider: true,
  });

  useEffect(() => {
    async function fetchData() {
      const [
        releasesData, 
        clientsData, 
        tipsData, 
        partnersData,
        contentData,
        sectionsData,
        settingsData
      ] = await Promise.all([
        supabase.from('press_releases').select('*').eq('published', true).order('pinned', { ascending: false }).order('display_order', { ascending: true }).order('published_at', { ascending: false }).limit(20),
        supabase.from('clients').select('*').eq('active', true).order('display_order', { ascending: true }).limit(12),
        supabase.from('tips').select('*').eq('published', true).order('created_at', { ascending: false }).limit(4),
        supabase.from('partners').select('*').eq('active', true).order('display_order', { ascending: true }),
        supabase.from('site_content').select('*'),
        supabase.from('homepage_sections').select('section_key, visible'),
        supabase.from('site_content').select('metadata').eq('section', 'settings').single(),
      ]);

      setReleases(releasesData.data || []);
      setClients(clientsData.data || []);
      setTips(tipsData.data || []);
      setPartners(partnersData.data || []);
      
      const contentMap: Record<string, SiteContent> = {};
      (contentData.data || []).forEach((item: SiteContent) => {
        contentMap[item.section] = item;
      });
      setContent(contentMap);

      // Set press releases limit from settings
      const settingsMetadata = settingsData.data?.metadata as Record<string, unknown> | null;
      if (settingsMetadata?.press_releases_homepage_limit) {
        setPressReleasesLimit(settingsMetadata.press_releases_homepage_limit as number);
      }

      // Set section visibility
      if (sectionsData.data) {
        const visibility: SectionVisibility = {
          sidebar_search: true,
          sidebar_blog: true,
          sidebar_clients: true,
          sidebar_partners: true,
          slider: true,
        };
        sectionsData.data.forEach((section: { section_key: string; visible: boolean | null }) => {
          if (section.section_key in visibility) {
            visibility[section.section_key as keyof SectionVisibility] = section.visible ?? true;
          }
        });
        setSectionVisibility(visibility);
      }
    }

    fetchData();
  }, []);

  // Filter releases based on search
  const filteredReleases = searchQuery.trim().length >= 2
    ? releases.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : releases;

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
      // Navigate to press releases page with search query
      window.location.href = `/press-releases?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const featuredRelease = filteredReleases[0];
  const otherReleases = filteredReleases.slice(1, pressReleasesLimit);
  const hasMoreReleases = filteredReleases.length > pressReleasesLimit;
  const sidebarTip = tips[0];
  const noSearchResults = searchQuery.trim().length >= 2 && filteredReleases.length === 0;

  return (
    <Layout>
      {/* Main Content - Portal Style */}
      <main className="pt-4 md:pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-8">

              {/* Search Box - Above News */}
              <AnimatedSection>
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Pesquisar notícias..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full pl-4 pr-10 py-3 bg-secondary border-0"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {searchQuery.trim().length >= 2 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {filteredReleases.length > 0 
                      ? `${filteredReleases.length} resultado(s) encontrado(s)`
                      : 'Nenhum resultado. Pressione Enter para ver todos os releases.'
                    }
                  </p>
                )}
              </AnimatedSection>

              {/* No Results - Link to All Releases */}
              {noSearchResults && (
                <AnimatedSection>
                  <div className="text-center py-12 bg-secondary/50 rounded-xl">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-display font-bold text-foreground mb-2">
                      Nenhum resultado para "{searchQuery}"
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Não encontramos notícias com esse termo
                    </p>
                    <Button asChild>
                      <Link to={`/press-releases?search=${encodeURIComponent(searchQuery)}`}>
                        Ver todos os Press Releases
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </AnimatedSection>
              )}

              {/* Featured Article */}
              {featuredRelease ? (
                <AnimatedSection>
                  <Link 
                    to={`/press-releases/${featuredRelease.slug || featuredRelease.id}`}
                    className="group block"
                  >
                    <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-4">
                      <img
                        src={featuredRelease.image_url || heroBg}
                        alt={featuredRelease.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide mb-2">
                      <span className="text-primary font-bold">CLIENTES</span>
                      <span className="text-muted-foreground">,</span>
                      <span className="text-primary font-bold">PRESS RELEASE</span>
                      {featuredRelease.show_date !== false && featuredRelease.published_at && (
                        <>
                          <span className="text-muted-foreground ml-2">
                            {format(new Date(featuredRelease.published_at), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </>
                      )}
                    </div>
                    
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
                      {featuredRelease.title}
                    </h1>
                    
                    {featuredRelease.summary && (
                      <p className="text-muted-foreground text-lg mb-4">
                        {featuredRelease.summary}
                      </p>
                    )}
                    
                    <Button className="bg-primary hover:bg-primary/90">
                      LEIA MAIS
                    </Button>
                  </Link>
                </AnimatedSection>
              ) : (
                <div className="text-center py-20 bg-secondary rounded-xl">
                  <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                    Em breve, notícias em destaque
                  </h2>
                  <p className="text-muted-foreground">
                    Acompanhe as principais notícias dos nossos clientes
                  </p>
                </div>
              )}

              {/* Other Articles - List Style */}
              {otherReleases.length > 0 && (
                <div className="space-y-6 border-t border-border pt-8">
                  {otherReleases.map((release, index) => (
                    <AnimatedSection key={release.id} delay={index * 0.1}>
                      <Link 
                        to={`/press-releases/${release.slug || release.id}`}
                        className="group flex gap-4"
                      >
                        <div className="flex-shrink-0 w-32 h-24 md:w-48 md:h-32 rounded-lg overflow-hidden">
                          <img
                            src={release.image_url || heroBg}
                            alt={release.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-wide mb-1">
                            <span className="text-primary font-bold">CLIENTES</span>
                            <span className="text-muted-foreground">,</span>
                            <span className="text-primary font-bold">PRESS RELEASE</span>
                            {release.show_date !== false && release.published_at && (
                              <span className="text-muted-foreground ml-2">
                                {format(new Date(release.published_at), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                            )}
                          </div>
                          
                          <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {release.title}
                          </h2>
                          
                          {release.summary && (
                            <p className="text-muted-foreground text-sm line-clamp-2 hidden md:block">
                              {release.summary}
                            </p>
                          )}
                        </div>
                      </Link>
                    </AnimatedSection>
                  ))}
                </div>
              )}

              {/* View All Button */}
              {hasMoreReleases && (
                <AnimatedSection className="pt-4">
                  <Button asChild variant="outline" size="lg" className="w-full md:w-auto">
                    <Link to="/press-releases">
                      Ver Todos os Press Releases
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </AnimatedSection>
              )}
            </div>

            {/* Sidebar - 1/3 width */}
            <aside className="space-y-8">

              {/* Homepage Slider */}
              {sectionVisibility.slider && (
                <AnimatedSection delay={0.05}>
                  <HomepageSlider />
                </AnimatedSection>
              )}

              {/* Blog da Beth Section */}
              {sectionVisibility.sidebar_blog && (
                <AnimatedSection delay={0.1}>
                  <div className="bg-primary text-primary-foreground px-6 py-4 font-display font-bold text-lg uppercase tracking-wide">
                    Blog da Beth
                  </div>
                  
                  {sidebarTip ? (
                    <article 
                      className="bg-card border border-border border-t-0 p-4 cursor-pointer group"
                      onClick={() => setSelectedTip(sidebarTip)}
                    >
                      {sidebarTip.image_url && (
                        <div className="aspect-[16/10] rounded overflow-hidden mb-4">
                          <img
                            src={sidebarTip.image_url}
                            alt={sidebarTip.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wide mb-2">
                        <span className="text-primary font-bold">BLOG DA BETH</span>
                        <span className="text-muted-foreground">
                          {format(new Date(sidebarTip.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-display font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {sidebarTip.title}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-4">
                        {sidebarTip.content
                          .replace(/<[^>]+>/g, '')
                          .replace(/style="[^"]*"/gi, '')
                          .replace(/--tw-[^:;]+:[^;]+;?/gi, '')
                          .replace(/margin[^:]*:[^;]+;?/gi, '')
                          .replace(/padding[^:]*:[^;]+;?/gi, '')
                          .replace(/border[^:]*:[^;]+;?/gi, '')
                          .replace(/font[^:]*:[^;]+;?/gi, '')
                          .replace(/color:[^;]+;?/gi, '')
                          .replace(/background[^:]*:[^;]+;?/gi, '')
                          .replace(/!\[.*?\]\(.*?\)(\{width=\d+%\})?/g, '')
                          .replace(/\[video\]\(.*?\)/g, '')
                          .replace(/#{1,6}\s/g, '')
                          .replace(/\*\*/g, '').replace(/\*/g, '')
                          .replace(/&nbsp;/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim()
                          .substring(0, 200)}...
                      </p>
                      
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        LEIA MAIS
                      </Button>
                    </article>
                  ) : (
                    <div className="bg-card border border-border border-t-0 p-6 text-center">
                      <p className="text-muted-foreground text-sm">
                        Em breve, dicas de comunicação
                      </p>
                    </div>
                  )}

                  <Link 
                    to="/dicas" 
                    className="block text-center py-3 text-primary font-semibold hover:underline"
                  >
                    Ver todos os artigos →
                  </Link>
                </AnimatedSection>
              )}

              {/* Quem Atendemos */}
              {sectionVisibility.sidebar_clients && (
                <AnimatedSection delay={0.2}>
                  <div className="bg-foreground text-background px-6 py-4 font-display font-bold text-lg uppercase tracking-wide">
                    Quem Atendemos
                  </div>
                  
                  <div className="bg-card border border-border border-t-0 p-4">
                    {clients.length > 0 ? (
                      <div className="grid grid-cols-3 gap-3">
                        {clients.slice(0, 6).map((client) => (
                          <a
                            key={client.id}
                            href={client.website || '#'}
                            target={client.website ? '_blank' : undefined}
                            rel="noopener noreferrer"
                            className="aspect-[3/2] bg-secondary rounded p-2 flex items-center justify-center hover:shadow-md transition-shadow"
                          >
                            {client.logo_url ? (
                              <img
                                src={client.logo_url}
                                alt={client.name}
                                className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground text-center">{client.name}</span>
                            )}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm text-center py-4">
                        Em breve, nossos clientes
                      </p>
                    )}
                    
                    <Link 
                      to="/clientes" 
                      className="block text-center py-3 text-primary font-semibold hover:underline mt-2"
                    >
                      Ver todos →
                    </Link>
                  </div>
                </AnimatedSection>
              )}

              {/* Parceiros */}
              {sectionVisibility.sidebar_partners && partners.length > 0 && (
                <AnimatedSection delay={0.3}>
                  <div className="bg-secondary px-6 py-4 font-display font-bold text-lg uppercase tracking-wide text-foreground">
                    Parceiros
                  </div>
                  
                  <div className="bg-card border border-border border-t-0 p-4">
                    <div className="flex flex-wrap gap-3 justify-center">
                      {partners.slice(0, 4).map((partner) => (
                        <a
                          key={partner.id}
                          href={partner.website || '#'}
                          target={partner.website ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          className="h-12 px-4 bg-secondary rounded flex items-center justify-center hover:shadow-md transition-shadow"
                        >
                          {partner.logo_url ? (
                            <img
                              src={partner.logo_url}
                              alt={partner.name}
                              className="h-8 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">{partner.name}</span>
                          )}
                        </a>
                      ))}
                    </div>
                    
                    <Link 
                      to="/parceiros" 
                      className="block text-center py-3 text-primary font-semibold hover:underline mt-2"
                    >
                      Ver todos →
                    </Link>
                  </div>
                </AnimatedSection>
              )}
            </aside>
          </div>
        </div>
      </main>

      {/* Quem Somos Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <AnimatedSection direction="left">
              <div className="relative flex justify-center lg:justify-start">
                <motion.div
                  className="aspect-square w-64 md:w-80 lg:w-96 rounded-2xl overflow-hidden shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src={content.about?.image_url || quemSomosImage}
                    alt="Beth Renz"
                    className="w-full h-full object-cover object-top"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="absolute bottom-4 right-4 lg:right-auto lg:left-64 md:lg:left-72 lg:left-80 bg-primary text-primary-foreground p-4 md:p-6 rounded-2xl shadow-lg"
                >
                  <div className="text-3xl md:text-4xl font-display font-bold">25+</div>
                  <div className="text-xs md:text-sm opacity-90">Anos de experiência</div>
                </motion.div>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right">
              <span className="text-primary font-semibold uppercase tracking-wider text-sm">
                Quem Somos
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mt-2 mb-6">
                Comunicação estratégica que gera credibilidade
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                {content.about?.content || 'Atuamos em jornalismo, assessoria de imprensa e comunicação integrada, com foco em relacionamento, reputação e visibilidade.'}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Transformamos fatos empresariais em notícias de impacto, conquistando espaço espontâneo em rádio, televisão, jornais e portais de notícias.
              </p>
              <Button asChild size="lg" className="shine">
                <Link to="/quem-somos">
                  Conheça Nossa História
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
              Transforme sua comunicação
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
              Entre em contato e descubra como podemos ajudar sua empresa a conquistar espaço na mídia.
            </p>
            <Button asChild size="lg" variant="secondary" className="font-semibold">
              <Link to="/contato">
                Fale com a Imprensa
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>


      {/* Modal for Tip */}
      <AnimatePresence>
        {selectedTip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTip(null)}
            className="fixed inset-0 bg-foreground/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.article
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl bg-card rounded-2xl overflow-hidden my-8"
            >
              <button
                onClick={() => setSelectedTip(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {selectedTip.image_url && (
                <div className="aspect-video">
                  <img
                    src={selectedTip.image_url}
                    alt={selectedTip.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8">
                <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded mb-4">
                  Dica de Comunicação
                </span>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                  {selectedTip.title}
                </h2>
                <div className="prose prose-lg max-w-none text-muted-foreground">
                  {selectedTip.content.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
