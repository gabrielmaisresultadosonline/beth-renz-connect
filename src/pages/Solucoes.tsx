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
                    <div className="flex flex-col items-center">
                      {/* Image Card with thick border */}
                      <motion.div className="w-full max-w-sm lg:max-w-md relative z-10" whileHover={{ scale: 1.02 }}>
                        <div className="rounded-2xl border-4 border-primary overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg">
                          {hasImage ? (
                            <div className="relative">
                              <div className="aspect-[4/3] w-full">
                                <img 
                                  src={service.image_url!} 
                                  alt={service.title}
                                  className="w-full h-full object-contain bg-muted/30"
                                />
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                                    <IconComponent className="h-5 w-5 text-primary-foreground" />
                                  </div>
                                  <h2 className="text-lg font-display font-bold text-white">{service.title}</h2>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-8 text-center flex flex-col items-center justify-center">
                              <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                                className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4"
                              >
                                <IconComponent className="h-10 w-10 text-primary-foreground" />
                              </motion.div>
                              <h2 className="text-xl font-display font-bold text-foreground">{service.title}</h2>
                            </div>
                          )}
                        </div>
                      </motion.div>

                      {/* Thick Vertical Connector Line */}
                      <div className="w-1.5 h-10 bg-primary rounded-full shadow-md" />

                      {/* Content Card with thick border */}
                      <div className="w-full relative z-10">
                        <div className="rounded-2xl border-4 border-primary bg-card shadow-lg overflow-hidden">
                          <div className="p-6 md:p-8">
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
                                  <Button variant="outline" className="gap-2">
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