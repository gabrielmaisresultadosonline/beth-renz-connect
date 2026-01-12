import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  LucideIcon
} from 'lucide-react';

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
  icon: string;
  features: string[];
  how_we_do: string | null;
  display_order: number;
}

export default function Solucoes() {
  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('display_order');
      return data as Service[];
    },
  });

  const getIcon = (iconName: string): LucideIcon => {
    return iconMap[iconName] || Briefcase;
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
          ) : (
            <div className="space-y-16">
              {services?.map((service, index) => {
                const IconComponent = getIcon(service.icon);
                const isEven = index % 2 === 0;
                
                return (
                  <AnimatedSection key={service.id} delay={index * 0.1}>
                    <div className={`flex flex-col lg:flex-row gap-8 items-start ${!isEven ? 'lg:flex-row-reverse' : ''}`}>
                      {/* Icon Card */}
                      <motion.div 
                        className="w-full lg:w-1/3"
                        whileHover={{ scale: 1.02 }}
                      >
                        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 h-full">
                          <CardContent className="p-8 text-center">
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.6 }}
                              className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6"
                            >
                              <IconComponent className="h-10 w-10 text-primary-foreground" />
                            </motion.div>
                            <h2 className="text-2xl font-display font-bold text-foreground">
                              {service.title}
                            </h2>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Content */}
                      <div className="w-full lg:w-2/3">
                        <Card className="bg-card border-border h-full">
                          <CardContent className="p-8">
                            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                              {service.description}
                            </p>
                            
                            {service.how_we_do && (
                              <h3 className="font-semibold text-primary mb-4">
                                {service.how_we_do}
                              </h3>
                            )}
                            
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {service.features.map((feature, i) => (
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
                          </CardContent>
                        </Card>
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