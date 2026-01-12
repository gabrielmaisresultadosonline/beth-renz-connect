import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { AnimatedSection } from '@/components/AnimatedSection';
import { NewsSlider } from '@/components/NewsSlider';
import { NewsCard } from '@/components/NewsCard';
import { ClippingGallery } from '@/components/ClippingGallery';
import { ServiceIcon } from '@/components/ServiceIcon';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowRight, 
  Newspaper, 
  Users, 
  MessageSquare, 
  Megaphone, 
  FileText,
  Radio,
  BarChart3,
  X,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import heroBg from '@/assets/hero-bg.jpg';

interface PressRelease {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  image_url: string | null;
  published_at: string | null;
}

interface Client {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
}

interface Clipping {
  id: string;
  title: string;
  source: string | null;
  image_url: string | null;
  link: string | null;
  published_at: string | null;
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

const services = [
  {
    icon: Newspaper,
    title: 'Assessoria de Imprensa',
    description: 'Relacionamento estratégico com veículos de comunicação.',
  },
  {
    icon: FileText,
    title: 'Produção de Conteúdo',
    description: 'Textos jornalísticos de alta qualidade.',
  },
  {
    icon: MessageSquare,
    title: 'Gestão de Comunicação',
    description: 'Comunicação institucional integrada.',
  },
  {
    icon: Megaphone,
    title: 'Press Releases',
    description: 'Comunicados estratégicos para a mídia.',
  },
  {
    icon: Radio,
    title: 'Media Training',
    description: 'Preparação para entrevistas e aparições.',
  },
  {
    icon: BarChart3,
    title: 'Clipping e Monitoramento',
    description: 'Acompanhamento de mídia espontânea.',
  },
];

export default function Index() {
  const [releases, setReleases] = useState<PressRelease[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clippings, setClippings] = useState<Clipping[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [content, setContent] = useState<Record<string, SiteContent>>({});
  const [selectedRelease, setSelectedRelease] = useState<PressRelease | null>(null);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [
        releasesData, 
        clientsData, 
        clippingsData, 
        tipsData, 
        partnersData,
        contentData
      ] = await Promise.all([
        supabase.from('press_releases').select('*').eq('published', true).order('published_at', { ascending: false }).limit(10),
        supabase.from('clients').select('*').eq('active', true).order('display_order', { ascending: true }).limit(12),
        supabase.from('clipping').select('*').order('published_at', { ascending: false }).limit(8),
        supabase.from('tips').select('*').eq('published', true).order('created_at', { ascending: false }).limit(4),
        supabase.from('partners').select('*').eq('active', true).order('display_order', { ascending: true }),
        supabase.from('site_content').select('*'),
      ]);

      setReleases(releasesData.data || []);
      setClients(clientsData.data || []);
      setClippings(clippingsData.data || []);
      setTips(tipsData.data || []);
      setPartners(partnersData.data || []);
      
      const contentMap: Record<string, SiteContent> = {};
      (contentData.data || []).forEach((item: SiteContent) => {
        contentMap[item.section] = item;
      });
      setContent(contentMap);
    }

    fetchData();
  }, []);

  const sliderSlides = releases.slice(0, 5).map(release => ({
    id: release.id,
    title: release.title,
    subtitle: release.summary || '',
    image_url: release.image_url,
  }));

  const weeklyHighlights = releases.slice(0, 4);
  const recentReleases = releases.slice(0, 5);

  return (
    <Layout>
      {/* 1. Slider Principal - Destaques de Notícias */}
      <NewsSlider 
        slides={sliderSlides}
        onSlideClick={(slide) => {
          const release = releases.find(r => r.id === slide.id);
          if (release) setSelectedRelease(release);
        }}
      />

      {/* 2. Destaques da Semana */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection className="mb-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  Destaques da Semana
                </h2>
                <p className="text-muted-foreground mt-2">As principais notícias dos nossos clientes</p>
              </div>
              <Button asChild variant="outline" className="hidden md:flex">
                <Link to="/press-releases">
                  Ver todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>

          {weeklyHighlights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {weeklyHighlights.map((release, index) => (
                <NewsCard
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
            <div className="text-center py-12 bg-secondary rounded-2xl">
              <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Em breve, notícias em destaque</p>
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline">
              <Link to="/press-releases">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 3. Quem Somos (Resumo Institucional) */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection direction="left">
              <div className="relative">
                <motion.div
                  className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src={content.about?.image_url || heroBg}
                    alt="Beth Renz"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-2xl shadow-lg"
                >
                  <div className="text-4xl font-display font-bold">25+</div>
                  <div className="text-sm opacity-90">Anos de experiência</div>
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

      {/* 4. Nossas Soluções */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Nossas Soluções
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Soluções completas em comunicação corporativa para impulsionar sua marca na mídia
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {services.map((service, index) => (
              <ServiceIcon
                key={service.title}
                icon={service.icon}
                title={service.title}
                description={service.description}
                index={index}
              />
            ))}
          </div>

          <AnimatedSection className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link to="/solucoes">
                Ver Todas as Soluções
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* 5. Quem Atendemos */}
      <section className="py-16 bg-foreground">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-background mb-4">
              Quem Atendemos
            </h2>
            <p className="text-background/70 max-w-2xl mx-auto">
              Empresas, executivos, instituições e projetos especiais que confiam em nosso trabalho
            </p>
          </AnimatedSection>

          {clients.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {clients.map((client, index) => (
                <motion.a
                  key={client.id}
                  href={client.website || '#'}
                  target={client.website ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.1 }}
                  className="aspect-[3/2] bg-background rounded-lg p-4 flex items-center justify-center hover:shadow-lg transition-shadow"
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
                </motion.a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-background/50 mx-auto mb-4" />
              <p className="text-background/60">Em breve, nossos clientes</p>
            </div>
          )}

          <AnimatedSection className="text-center mt-10">
            <Button asChild variant="outline" className="border-background/30 text-background hover:bg-background/10">
              <Link to="/clientes">
                Ver Todos os Clientes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* 6. Press Releases Recentes */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection className="mb-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  Press Releases Recentes
                </h2>
                <p className="text-muted-foreground mt-2">Últimos comunicados de imprensa</p>
              </div>
              <Button asChild variant="outline" className="hidden md:flex">
                <Link to="/press-releases">
                  Ver todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>

          {recentReleases.length > 0 ? (
            <div className="space-y-4">
              {recentReleases.map((release, index) => (
                <motion.article
                  key={release.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => setSelectedRelease(release)}
                  className="group flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                    <img
                      src={release.image_url || heroBg}
                      alt={release.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    {release.published_at && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(release.published_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                      </div>
                    )}
                    <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {release.title}
                    </h3>
                  </div>
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    Ler
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-secondary rounded-2xl">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Em breve, press releases</p>
            </div>
          )}
        </div>
      </section>

      {/* 7. Clipping - Na Mídia */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <AnimatedSection className="mb-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  Na Mídia
                </h2>
                <p className="text-muted-foreground mt-2">Nossos clientes em destaque na imprensa</p>
              </div>
              <Button asChild variant="outline" className="hidden md:flex">
                <Link to="/clipping">
                  Ver todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>

          <ClippingGallery items={clippings} />

          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline">
              <Link to="/clipping">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 8. Dicas de Comunicação */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection className="mb-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  Dicas de Comunicação
                </h2>
                <p className="text-muted-foreground mt-2">Artigos e orientações sobre comunicação estratégica</p>
              </div>
              <Button asChild variant="outline" className="hidden md:flex">
                <Link to="/dicas">
                  Ver todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>

          {tips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tips.map((tip, index) => (
                <NewsCard
                  key={tip.id}
                  title={tip.title}
                  summary={tip.content.substring(0, 100) + '...'}
                  imageUrl={tip.image_url || undefined}
                  date={tip.created_at}
                  category="Dica"
                  index={index}
                  onClick={() => setSelectedTip(tip)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-secondary rounded-2xl">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Em breve, dicas de comunicação</p>
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline">
              <Link to="/dicas">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 9. Nossos Parceiros */}
      {partners.length > 0 && (
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Nossos Parceiros
              </h2>
            </AnimatedSection>

            <div className="flex flex-wrap justify-center items-center gap-8">
              {partners.map((partner, index) => (
                <motion.a
                  key={partner.id}
                  href={partner.website || '#'}
                  target={partner.website ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.1 }}
                  className="h-16 px-6 bg-card rounded-lg flex items-center justify-center hover:shadow-md transition-shadow"
                >
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="h-10 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">{partner.name}</span>
                  )}
                </motion.a>
              ))}
            </div>

            <AnimatedSection className="text-center mt-10">
              <Button asChild variant="outline">
                <Link to="/parceiros">
                  Ver Todos os Parceiros
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-background/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-6">
              Pronto para transformar sua comunicação?
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-10">
              Entre em contato e descubra como podemos ajudar sua empresa a conquistar espaço na mídia.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild size="lg" variant="secondary" className="font-semibold">
                <Link to="/contato">
                  Fale com a Imprensa
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Modal for Press Release */}
      <AnimatePresence>
        {selectedRelease && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedRelease(null)}
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
                onClick={() => setSelectedRelease(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {selectedRelease.image_url && (
                <div className="aspect-video">
                  <img
                    src={selectedRelease.image_url}
                    alt={selectedRelease.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8">
                {selectedRelease.published_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(selectedRelease.published_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                )}
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                  {selectedRelease.title}
                </h2>
                <div className="prose prose-lg max-w-none text-muted-foreground">
                  {selectedRelease.content.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>

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
