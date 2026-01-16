import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Target, 
  Newspaper, 
  PenTool, 
  User, 
  Video, 
  Briefcase,
  Mic,
  Share2,
  TrendingUp,
  AlertTriangle,
  Users,
  Lightbulb,
  LucideIcon,
  FileText,
  ExternalLink
} from 'lucide-react';
import { useState } from 'react';

// Map of icon names to components
const iconMap: Record<string, LucideIcon> = {
  Target,
  Newspaper,
  PenTool,
  User,
  Video,
  Briefcase,
  Mic,
  Share2,
  TrendingUp,
  AlertTriangle,
  Users,
  Lightbulb,
};

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  features: string[] | null;
  how_we_do: string | null;
  display_order: number | null;
  image_url: string | null;
}

export default function Solucoes() {
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);

  const {
    data: services,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('display_order');

      if (error) throw error;
      return (data ?? []) as Service[];
    },
  });

  const getIcon = (iconName: string | null | undefined): LucideIcon => {
    if (!iconName) return Briefcase;
    return iconMap[iconName] || Briefcase;
  };

  // Check if this is the "Produção de Conteúdo" service
  const isProducaoConteudo = (title: string) => {
    return title.toLowerCase().includes('produção de conteúdo');
  };

  return (
    <Layout>
      <PageHero 
        title="Nossos Serviços" 
        subtitle="Comunicação estratégica para sua empresa" 
      />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Não foi possível carregar os serviços agora.</p>
            </div>
          ) : !services?.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum serviço cadastrado.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {services.map((service, index) => {
                const IconComponent = getIcon(service.icon);
                const isEven = index % 2 === 0;
                const features = service.features ?? [];
                const hasImage = !!service.image_url;
                const showPdfButton = isProducaoConteudo(service.title);

                return (
                  <AnimatedSection key={service.id} delay={index * 0.1}>
                    {/* Single unified container with continuous border */}
                    <div className="rounded-2xl border-4 border-primary bg-card shadow-lg overflow-hidden">
                      {/* Flex container - vertical on mobile (image top), horizontal on desktop (content left, image right) */}
                      <div className="flex flex-col-reverse lg:flex-row">
                        {/* Image Section - clean without overlay */}
                        <motion.div 
                          className="w-full lg:w-2/5 flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/5"
                          whileHover={{ scale: 1.01 }}
                        >
                          {hasImage ? (
                            <div className="h-full">
                              <div className="aspect-[4/3] lg:aspect-auto lg:h-full w-full">
                                <img 
                                  src={service.image_url!} 
                                  alt={service.title}
                                  className="w-full h-full object-cover bg-muted/30"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="p-8 text-center h-full flex flex-col items-center justify-center min-h-[200px] lg:min-h-[300px] bg-gradient-to-br from-primary/20 to-primary/5">
                              <div className="w-24 h-24 rounded-2xl bg-primary/20 flex items-center justify-center">
                                <IconComponent className="h-12 w-12 text-primary" />
                              </div>
                            </div>
                          )}
                        </motion.div>

                        {/* Content Section with title at top */}
                        <div className="w-full lg:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                          {/* Title with icon - centered and larger */}
                          <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-3">
                              <IconComponent className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">{service.title}</h2>
                          </div>

                          <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                            {service.description}
                          </p>

                          {service.how_we_do && (
                            <h3 className="font-semibold text-primary mb-4">{service.how_we_do}</h3>
                          )}

                          {features.length > 0 && (
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                              {features.map((feature, i) => (
                                <motion.li
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: i * 0.05 }}
                                  className="flex items-start gap-3 text-muted-foreground"
                                >
                                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                  <span>{feature}</span>
                                </motion.li>
                              ))}
                            </ul>
                          )}

                          {/* PDF Button for Produção de Conteúdo */}
                          {showPdfButton && (
                            <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
                              <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2 w-fit">
                                  <FileText className="h-4 w-4" />
                                  Ver exemplos de conteúdo
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh]">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Exemplos de Produção de Conteúdo
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="mt-4">
                                  <div className="bg-muted rounded-lg p-8 text-center">
                                    <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
                                    <p className="text-muted-foreground mb-4">
                                      Visualize nossos exemplos de produção de conteúdo
                                    </p>
                                    <Button asChild className="gap-2">
                                      <a href="/docs/producao-conteudo.pdf" target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4" />
                                        Abrir PDF em nova aba
                                      </a>
                                    </Button>
                                  </div>
                                  {/* PDF Iframe preview */}
                                  <div className="mt-4 border rounded-lg overflow-hidden bg-white">
                                    <iframe
                                      src="/docs/producao-conteudo.pdf"
                                      className="w-full h-[500px]"
                                      title="Produção de Conteúdo PDF"
                                    />
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}