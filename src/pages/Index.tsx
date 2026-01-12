import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { AnimatedSection } from '@/components/AnimatedSection';
import { BlogCard } from '@/components/BlogCard';
import { MarqueeText } from '@/components/MarqueeText';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Newspaper, Users, MessageSquare, Megaphone, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import heroBg from '@/assets/hero-bg.jpg';
import logo from '@/assets/logo.png';

interface PressRelease {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  image_url: string | null;
  published_at: string | null;
}

interface SiteContent {
  section: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  metadata: any;
}

const services = [
  {
    icon: Newspaper,
    title: 'Assessoria de Imprensa',
    description: 'Produção de textos jornalísticos e relacionamento estratégico com veículos de comunicação.',
  },
  {
    icon: MessageSquare,
    title: 'Gestão de Crise',
    description: 'Apoio em situações adversas com comunicados oficiais e gestão da imagem institucional.',
  },
  {
    icon: Megaphone,
    title: 'Apoio ao Marketing',
    description: 'Suporte estratégico para divulgação de novos produtos e serviços junto à imprensa.',
  },
  {
    icon: Users,
    title: 'Mídias Digitais',
    description: 'Compartilhamento de notícias em redes sociais para gerar engajamento.',
  },
];

export default function Index() {
  const [releases, setReleases] = useState<PressRelease[]>([]);
  const [content, setContent] = useState<Record<string, SiteContent>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRelease, setSelectedRelease] = useState<PressRelease | null>(null);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.1]);
  const heroY = useTransform(scrollY, [0, 400], [0, 100]);

  useEffect(() => {
    async function fetchData() {
      const [releasesData, contentData] = await Promise.all([
        supabase.from('press_releases').select('*').order('published_at', { ascending: false }).limit(5),
        supabase.from('site_content').select('*'),
      ]);

      setReleases(releasesData.data || []);
      
      const contentMap: Record<string, SiteContent> = {};
      (contentData.data || []).forEach((item: SiteContent) => {
        contentMap[item.section] = item;
      });
      setContent(contentMap);
    }

    fetchData();
  }, []);

  const featuredRelease = releases[0];
  const otherReleases = releases.slice(1);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ scale: heroScale, y: heroY }}
          className="absolute inset-0"
        >
          <img
            src={heroBg}
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/60 to-background" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 container mx-auto px-4 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <img 
              src={logo} 
              alt="Beth Renz" 
              className="h-20 md:h-28 w-auto mx-auto drop-shadow-2xl"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-background mb-6"
          >
            <span className="block">Transformamos fatos em</span>
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="block mt-2 text-primary"
            >
              notícias de impacto
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-background/80 max-w-3xl mx-auto mb-10"
          >
            Assessoria de imprensa estratégica para empresas que desejam conquistar espaço na mídia espontânea.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="group shine">
              <Link to="/contato">
                Fale Conosco
                <motion.span
                  className="ml-2"
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-background/50 text-background hover:bg-background/10 hover:border-background">
              <Link to="/quem-somos">
                Conheça Nossa História
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center text-background/60"
          >
            <span className="text-xs uppercase tracking-widest mb-2">Scroll</span>
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* Marquee */}
      <MarqueeText text="IMPRENSA & RELACIONAMENTO" className="bg-primary py-6" />

      {/* Blog Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection className="mb-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
                  Blog da Beth
                </h2>
                <p className="text-muted-foreground">
                  Últimas notícias e comunicados de nossos clientes
                </p>
              </div>
              
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary border-0"
                />
              </div>
            </div>
          </AnimatedSection>

          {/* Featured Post */}
          {featuredRelease && (
            <AnimatedSection className="mb-12">
              <BlogCard
                title={featuredRelease.title}
                summary={featuredRelease.summary || undefined}
                imageUrl={featuredRelease.image_url || undefined}
                date={featuredRelease.published_at || undefined}
                category="Press Release"
                featured
                onClick={() => setSelectedRelease(featuredRelease)}
              />
            </AnimatedSection>
          )}

          {/* Other Posts */}
          {otherReleases.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {otherReleases.map((release, index) => (
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
          )}

          {releases.length === 0 && (
            <AnimatedSection className="text-center py-20">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
              >
                <Newspaper className="h-12 w-12 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-3">
                Em breve, novidades aqui!
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Acompanhe nosso blog para ficar por dentro das últimas notícias e comunicados.
              </p>
            </AnimatedSection>
          )}

          <AnimatedSection className="text-center mt-12" delay={0.2}>
            <Button asChild variant="outline" size="lg" className="group">
              <Link to="/press-releases">
                Ver Todos os Posts
                <motion.span whileHover={{ x: 5 }} className="ml-2">
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Nossos Serviços
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Soluções completas em comunicação corporativa para impulsionar sua marca na mídia.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <AnimatedSection key={service.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="group relative bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-500 overflow-hidden shine"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/10 transition-all duration-500" />
                  
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:shadow-lg transition-all duration-300"
                  >
                    <service.icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </motion.div>
                  
                  <h3 className="relative font-display font-bold text-xl text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {service.title}
                  </h3>
                  
                  <p className="relative text-muted-foreground text-sm">
                    {service.description}
                  </p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="text-center mt-12" delay={0.4}>
            <Button asChild size="lg" className="group shine">
              <Link to="/solucoes">
                Ver Todos os Serviços
                <motion.span whileHover={{ x: 5 }} className="ml-2">
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection direction="left">
              <div className="relative">
                <motion.div
                  className="aspect-[4/3] rounded-2xl overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src={heroBg}
                    alt="Beth Renz"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-2xl shadow-elevated"
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
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-2 mb-6">
                {content.about?.title || 'Elizabeth Renz'}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                {content.about?.content || 'Jornalista com mais de 25 anos de experiência em assessoria de imprensa e comunicação corporativa no Rio Grande do Sul.'}
              </p>
              <Button asChild variant="outline" size="lg" className="group">
                <Link to="/quem-somos">
                  Conheça Nossa História
                  <motion.span whileHover={{ x: 5 }} className="ml-2">
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </Link>
              </Button>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-foreground relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-background mb-6"
            >
              Pronto para transformar sua
              <span className="block text-primary">comunicação?</span>
            </motion.h2>
            <p className="text-background/70 text-lg max-w-2xl mx-auto mb-10">
              Entre em contato e descubra como podemos ajudar sua empresa a conquistar espaço na mídia.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild size="lg" className="shine animate-pulse-glow">
                <Link to="/contato">
                  Entre em Contato
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Modal for full release */}
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
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
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
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">
              {selectedRelease.title}
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              {selectedRelease.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <Button
              onClick={() => setSelectedRelease(null)}
              variant="outline"
              className="mt-6"
            >
              Fechar
            </Button>
          </motion.div>
        </motion.div>
      )}
    </Layout>
  );
}
